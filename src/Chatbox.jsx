import React, { useState, useEffect, useRef } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaSpinner,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";
import { ref, push } from "firebase/database";
import { db } from "./firebase";
import { useDarkMode } from "./DarkModeContext";
import "./Chatbox.css";

const Chatbox = ({ onAddPerson }) => {
  const { darkMode } = useDarkMode();
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your assistant. How would you like to add people?",
      type: "greeting",
    },
    {
      sender: "bot",
      text: "Please choose an option:\n1. Command mode (quick format)\n2. Voice mode\n3. Chat mode (step-by-step)",
      type: "mode-selection",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [availableMics, setAvailableMics] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [showMicDropdown, setShowMicDropdown] = useState(false);
  const [interactionMode, setInteractionMode] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [collectedData, setCollectedData] = useState({
    name: "",
    company: "",
    country: "",
    phone: "",
    email: "",
  });

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initVoiceRecognition = async () => {
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          handleSend(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          addBotMessage("Sorry, I couldn't understand that. Please try again.", "error");
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (interactionMode === "voice") {
            addBotMessage("Would you like to say another command? (yes/no)");
          }
        };
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((device) => device.kind === "audioinput");
        setAvailableMics(mics);
        if (mics.length > 0) {
          setSelectedMic(mics[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting microphone devices:", error);
      }
    };

    initVoiceRecognition();
  }, [interactionMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text = input) => {
    const userInput = text.trim();
    if (!userInput) return;

    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setInput("");
    setIsTyping(true);

    if (!interactionMode) {
      await handleModeSelection(userInput.toLowerCase());
    } else {
      switch (interactionMode) {
        case "command":
        case "voice":
          await processCommandInput(userInput);
          break;
        case "chat":
          await processChatInput(userInput);
          break;
      }
    }

    setIsTyping(false);
  };

  const handleModeSelection = async (input) => {
    if (input.includes("1") || input.includes("command")) {
      setInteractionMode("command");
      addBotMessage("Command mode selected. You can enter details in format: 'Name Company Country Phone Email'");
      addBotMessage("Example: 'John Doe TechWave USA 5551234567 john@techwave.com'");
    } else if (input.includes("2") || input.includes("voice")) {
      setInteractionMode("voice");
      addBotMessage("Voice mode selected. Please click the microphone and speak clearly.");
    } else if (input.includes("3") || input.includes("chat")) {
      setInteractionMode("chat");
      startChatMode();
    } else {
      addBotMessage("Please select a valid option (1, 2, or 3)");
    }
  };

  const startChatMode = () => {
    setCurrentStep("name");
    addBotMessage("Let's add a new person step by step. What's their full name?");
  };

  const processCommandInput = async (input) => {
    try {
      const parsed = trySpaceSeparatedParsing(input) || tryNaturalLanguageProcessing(input);
      
      if (parsed) {
        if (!parsed.name || !parsed.email) {
          throw new Error("Name and email are required");
        }
        await saveData(parsed);
      } else {
        throw new Error("Invalid format");
      }
    } catch (error) {
      addBotMessage(`❌ ${error.message || "Failed to save. Please check your input format."}`, "error");
      addBotMessage("Correct format: Name Company Country Phone Email\nExample: John Doe TechWave USA 5551234567 john@techwave.com");
    }
  };

  const trySpaceSeparatedParsing = (input) => {
    const parts = input.trim().split(/\s+/);
    if (parts.length >= 5) {
      const email = parts.pop();
      if (!validateEmail(email)) return null;
      
      const phone = parts.pop();
      const country = parts.pop();
      const company = parts.pop();
      const name = parts.join(" ");
      
      return { name, company, country, phone, email };
    }
    return null;
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const tryNaturalLanguageProcessing = (input) => {
    const patterns = [
      /add\s(.+?)\sfrom\s(.+?)\s(?:in|from)\s(.+?)\sphone\s(.+?)\semail\s(.+)/i,
      /^(.+?)\s(.+?)\s(.+?)\s(.+?)\s(.+)$/,
      /create\scontact\s(.+?)\sat\s(.+?)\s(.+?)\s(.+?)\s(.+)/i,
      /(.+?)\sworks?\sat\s(.+?)\sbased\sin\s(.+?)\scontact\s(.+?)\s(.+)/i
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return {
          name: match[1].trim(),
          company: match[2].trim(),
          country: match[3].trim(),
          phone: match[4].trim(),
          email: match[5].trim()
        };
      }
    }
    return null;
  };

  const processChatInput = async (input) => {
    const step = currentStep;
    const updatedData = { ...collectedData };

    try {
      switch (step) {
        case "name":
          if (!input.trim()) throw new Error("Name cannot be empty");
          updatedData.name = input;
          setCollectedData(updatedData);
          setCurrentStep("company");
          addBotMessage("What company do they work for?");
          break;
        case "company":
          updatedData.company = input;
          setCollectedData(updatedData);
          setCurrentStep("country");
          addBotMessage("Which country are they from?");
          break;
        case "country":
          updatedData.country = input;
          setCollectedData(updatedData);
          setCurrentStep("phone");
          addBotMessage("What is their phone number?");
          break;
        case "phone":
          updatedData.phone = input;
          setCollectedData(updatedData);
          setCurrentStep("email");
          addBotMessage("What is their email address?");
          break;
        case "email":
          if (!validateEmail(input)) throw new Error("Invalid email format");
          updatedData.email = input;
          await saveData(updatedData);
          setCollectedData({ name: "", company: "", country: "", phone: "", email: "" });
          setCurrentStep("name");
          addBotMessage("✅ Person saved successfully! Want to add another one? (yes/no)");
          break;
        default:
          if (input.toLowerCase().startsWith("yes")) {
            setCurrentStep("name");
            addBotMessage("Great! What's the full name?");
          } else {
            addBotMessage("Alright, I'm ready when you are!");
            setInteractionMode(null);
          }
          break;
      }
    } catch (error) {
      addBotMessage(`❌ ${error.message}`, "error");
      if (step === "email") {
        addBotMessage("Please enter a valid email address:");
      }
    }
  };

  const addBotMessage = (text, type = "bot") => {
    setMessages((prev) => [...prev, { sender: "bot", text, type }]);
  };

  const saveData = async (data) => {
    try {
      const peopleRef = ref(db, "people");
      await push(peopleRef, data);
      if (onAddPerson) onAddPerson(data);
      return true;
    } catch (error) {
      console.error("Error saving data:", error);
      throw new Error("Failed to save. Please try again.");
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      addBotMessage("Voice recognition not supported in your browser", "error");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!interactionMode) {
        setInteractionMode("voice");
      }
      recognitionRef.current.start();
      setIsListening(true);
      addBotMessage("Listening... Please speak now", "info");
    }
  };

  return (
    <div className={`chatbox-container ${darkMode ? "dark" : ""}`}>
      <div className="chatbox-header">
        <div className="header-content">
          <FaRobot className="bot-icon" />
          <div className="header-text">
            <h2>People Assistant</h2>
            {interactionMode && (
              <div className="mode-indicator">
                {interactionMode.toUpperCase()} MODE
              </div>
            )}
          </div>
        </div>
        {isListening && (
          <div className="listening-indicator">
            <div className="pulse-animation"></div>
            <span>Listening...</span>
          </div>
        )}
      </div>

      <div className="chatbox-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender} ${msg.type || ""}`}>
            <div className="message-content">
              {msg.sender === "bot" && <FaRobot className="message-icon" />}
              <div className="message-text">
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot typing">
            <div className="message-content">
              <FaRobot className="message-icon" />
              <div className="message-text">
                <FaSpinner className="spin" /> Typing...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbox-input">
        <input
          type="text"
          placeholder={
            !interactionMode ? "Type 1, 2, or 3 to select mode" :
            interactionMode === "command" ? "Enter: Name Company Country Phone Email" :
            interactionMode === "chat" ? 
              (currentStep === "name" ? "Enter full name" :
               currentStep === "company" ? "Enter company" :
               currentStep === "country" ? "Enter country" :
               currentStep === "phone" ? "Enter phone number" :
               "Enter email address") :
            "Click mic and speak"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isListening && interactionMode === "voice"}
        />
        <div className="input-buttons">
          <button
            onClick={toggleMic}
            className={`mic-btn ${isListening ? "active" : ""}`}
            title="Voice input"
          >
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button
            onClick={handleSend}
            className="send-btn"
            disabled={isTyping}
            title="Send message"
          >
            {isTyping ? <FaSpinner className="spin" /> : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;