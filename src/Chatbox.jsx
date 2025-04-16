import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { ref, push } from "firebase/database";
import { db } from "./firebase";
import { useDarkMode } from "./DarkModeContext";
import "./Chatbox.css";

const Chatbox = ({ onAddPerson }) => {
  const { darkMode } = useDarkMode();
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi, I'm your assistant. Would you like to add a new person? (Type 'add person' or similar)",
      type: "greeting"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(null);
  const [newPerson, setNewPerson] = useState({
    name: "",
    company: "",
    country: "",
    phone: "",
    email: ""
  });
  const messagesEndRef = useRef(null);

  const fields = [
    { key: "name", question: "What's the person's name?" },
    { key: "company", question: "Which company do they work for?" },
    { key: "country", question: "Which country are they from?" },
    { key: "phone", question: "What's their phone number?" },
    { key: "email", question: "What's their email address?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const userInput = input.trim();
    if (!userInput) return;

    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: userInput }]);
    setInput("");
    setIsTyping(true);

    // Process input
    await processInput(userInput);

    setIsTyping(false);
  };

  const processInput = async (userInput) => {
    // Check if we're in the middle of adding a person
    if (currentFieldIndex !== null) {
      await handleFieldResponse(userInput);
      return;
    }

    // Check if user wants to add a person
    if (userInput.toLowerCase().includes("add person") || 
        userInput.toLowerCase().includes("new person") ||
        userInput.toLowerCase().includes("yes")) {
      startAddPersonFlow();
      return;
    }

    // Try natural language processing
    if (await tryNaturalLanguageProcessing(userInput)) {
      return;
    }

    // Default response
    addBotMessage("I can help you add new people. Type 'add person' to get started or just tell me the details like: 'John Doe from Acme Inc, USA, phone 555-1234, email john@acme.com'");
  };

  const startAddPersonFlow = () => {
    setNewPerson({ name: "", company: "", country: "", phone: "", email: "" });
    setCurrentFieldIndex(0);
    addBotMessage(fields[0].question);
  };

  const handleFieldResponse = async (response) => {
    const currentField = fields[currentFieldIndex].key;
    const updatedPerson = { ...newPerson, [currentField]: response };
    setNewPerson(updatedPerson);

    // Move to next field or complete if all fields are done
    if (currentFieldIndex < fields.length - 1) {
      const nextFieldIndex = currentFieldIndex + 1;
      setCurrentFieldIndex(nextFieldIndex);
      addBotMessage(fields[nextFieldIndex].question);
    } else {
      await completePersonAddition(updatedPerson);
    }
  };

  const completePersonAddition = async (personData) => {
    try {
      // Validate required fields
      if (!personData.name || !personData.email) {
        addBotMessage("Please provide at least name and email to add a person.", "error");
        startAddPersonFlow();
        return;
      }

      // Add to Firebase
      const peopleRef = ref(db, 'people');
      await push(peopleRef, personData);
      
      // Update UI
      addBotMessage(`✅ Successfully added ${personData.name} to the people list!`, "success");
      setCurrentFieldIndex(null);
      
      // Notify parent component if needed
      if (onAddPerson) onAddPerson(personData);
      
      // Offer next action
      setTimeout(() => {
        addBotMessage("Would you like to add another person? (yes/no)", "question");
      }, 1000);
    } catch (error) {
      addBotMessage("❌ Failed to add person. Please try again.", "error");
      console.error("Error adding person:", error);
      setCurrentFieldIndex(null);
    }
  };

  const tryNaturalLanguageProcessing = async (input) => {
    // Skip NLP if we're in the middle of a guided flow
    if (currentFieldIndex !== null) return false;

    // Enhanced natural language parsing
    const nameMatch = input.match(/(?:add|create)?\s([a-zA-Z\s]+?)(?:\sfrom|\sat|\swith|,|$)/i);
    const companyMatch = input.match(/(?:company\s)?(?:is\s)?(?:from\s|at\s|works?\s)?([a-zA-Z0-9\s&.,]+?)(?:\sbased|\sin|,|$)/i);
    const countryMatch = input.match(/(?:country\s)?(?:is\s)?(?:in\s|from\s)?([a-zA-Z\s]+?)(?:\sphone|,|$)/i);
    const phoneMatch = input.match(/(?:phone\s)?(?:is\s)?(\+?[\d\s-]{7,})(?:\semail|,|$)/i);
    const emailMatch = input.match(/(?:email\s)?(?:is\s)?([\w.-]+@[\w.-]+\.\w+)/i);

    if (nameMatch || companyMatch || countryMatch || phoneMatch || emailMatch) {
      const personData = {
        name: nameMatch?.[1]?.trim() || "",
        company: companyMatch?.[1]?.trim() || "",
        country: countryMatch?.[1]?.trim() || "",
        phone: phoneMatch?.[1]?.trim() || "",
        email: emailMatch?.[1]?.trim() || ""
      };

      // If we have all fields, complete the addition
      if (personData.name && personData.email) {
        await completePersonAddition(personData);
        return true;
      }

      // If partial data, start guided flow for missing fields
      const firstMissingFieldIndex = fields.findIndex(f => !personData[f.key]);
      if (firstMissingFieldIndex !== -1) {
        setNewPerson(personData);
        setCurrentFieldIndex(firstMissingFieldIndex);
        addBotMessage(`Thanks! ${fields[firstMissingFieldIndex].question}`);
        return true;
      }
    }

    return false;
  };

  const addBotMessage = (text, type = "message") => {
    setMessages(prev => [...prev, { sender: "bot", text, type }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className={`chatbox-container ${darkMode ? "dark" : "light"}`}>
      <div className="max-w-4xl mx-auto flex flex-col h-full">
        <div className="chat-header">
          <div className="relative">
            <FaRobot size={30} className="text-purple-400" />
            {isTyping && (
              <div className="absolute -top-2 -right-2 flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>
          <h1>AI People Assistant</h1>
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === "user"
                  ? "user-message"
                  : msg.type === "success"
                  ? "success-message"
                  : msg.type === "error"
                  ? "error-message"
                  : "bot-message"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <FaSpinner className="animate-spin mr-2" />
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex flex-col gap-2">
          {currentFieldIndex !== null && (
            <div className={`field-tracker ${darkMode ? "dark" : "light"}`}>
              Currently adding: {newPerson.name || "New Person"}
              <div className="field-progress">
                {fields.map((field, idx) => (
                  <span
                    key={field.key}
                    className={
                      idx < currentFieldIndex
                        ? "bg-green-500 text-white"
                        : idx === currentFieldIndex
                        ? "bg-purple-500 text-white"
                        : darkMode
                        ? "bg-[#2c2c3e] text-white"
                        : "bg-gray-300 text-black"
                    }
                  >
                    {field.key}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                currentFieldIndex !== null
                  ? `Enter ${fields[currentFieldIndex].key}...`
                  : "Type your message or 'add person'..."
              }
              className={`chat-input ${darkMode ? "dark" : "light"}`}
            />
            <button
              onClick={handleSend}
              disabled={isTyping}
              className="send-button"
            >
              <FaPaperPlane />
            </button>
          </div>
          <div className="helper-text">
            Try: "Add John Doe from Acme Inc, USA" or just type the details separated by commas
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;