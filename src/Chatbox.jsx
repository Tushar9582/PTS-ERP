  import React, { useState, useEffect, useRef } from "react";
  import {
    FaRobot, FaPaperPlane, FaSpinner, 
    FaMicrophone, FaMicrophoneSlash,
    FaUser, FaUserTie, FaMoneyBillWave, FaChartLine
  } from "react-icons/fa";
  import { ref, push } from "firebase/database";
  import { db } from "./firebase";
  import { useDarkMode } from "./DarkModeContext";
  import "./Chatbox.css";

  const COMPONENTS = {
    people: {
      name: "People",
      icon: <FaUser />,
      fields: ["name", "company", "country", "phone", "email"]
    },
    leads: {
      name: "Leads",
      icon: <FaChartLine />,
      fields: ["name", "email", "branch", "type", "phone"]
    },
    customers: {
      name: "Clients",
      icon: <FaUserTie />,
      fields: ["name", "email", "phone", "address", "company"]
    },
    payments: {
      name: "Payments",
      icon: <FaMoneyBillWave />,
      fields: ["number", "client", "amount", "date", "year", "payment_mode"]
    }
  };

  const Chatbox = ({ onAddRecord }) => {
    const { darkMode } = useDarkMode();
    const [messages, setMessages] = useState([
      {
        sender: "bot",
        text: "Hello! I'm your assistant. What would you like to work with today?",
        type: "greeting"
      },
      {
        sender: "bot",
        text: "Please choose an option:\n1. People\n2. Leads\n3. Clients\n4. Payments",
        type: "component-selection"
      }
    ]);
    
    // Core state
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [currentComponent, setCurrentComponent] = useState(null);
    const [interactionMode, setInteractionMode] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [collectedData, setCollectedData] = useState({});
    
    // Refs
    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Initialize empty data structure when component changes
    useEffect(() => {
      if (currentComponent) {
        const initialData = {};
        COMPONENTS[currentComponent].fields.forEach(field => {
          initialData[field] = "";
        });
        setCollectedData(initialData);
      }
    }, [currentComponent]);  // Voice recognition setup
    useEffect(() => {
      const initVoiceRecognition = async () => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-US';

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
          };
        }
      };
      initVoiceRecognition();
    }, []);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleSend = async (text = input) => {
      const userInput = text.trim();
      if (!userInput) return;

      setMessages(prev => [...prev, { sender: "user", text: userInput }]);
      setInput("");
      setIsTyping(true);

      if (!currentComponent) {
        await handleComponentSelection(userInput);
      } else if (!interactionMode) {
        await handleModeSelection(userInput);
      } else {
        await processInput(userInput);
      }

      setIsTyping(false);
    };

    const handleComponentSelection = (input) => {
      const selection = input.toLowerCase();
      let selectedComponent = null;

      if (selection.includes('1') || selection.includes('people')) {
        selectedComponent = 'people';
      } else if (selection.includes('2') || selection.includes('leads')) {
        selectedComponent = 'leads';
      } else if (selection.includes('3') || selection.includes('clients') || selection.includes('customers')) {
        selectedComponent = 'customers';
      } else if (selection.includes('4') || selection.includes('payments')) {
        selectedComponent = 'payments';
      }

      if (selectedComponent) {
        setCurrentComponent(selectedComponent);
        addBotMessage(`${COMPONENTS[selectedComponent].name} selected. How would you like to add?`);
        addBotMessage("Choose mode:\n1. Command\n2. Voice\n3. Chat");
      } else {
        addBotMessage("Please select a valid option (1-4)");
      }
    };  const handleModeSelection = (input) => {
      const selection = input.toLowerCase();
      
      if (selection.includes('1') || selection.includes('command')) {
        setInteractionMode('command');
        showCommandFormat();
      } else if (selection.includes('2') || selection.includes('voice')) {
        setInteractionMode('voice');
        addBotMessage("Voice mode selected. Click the mic and speak clearly.");
      } else if (selection.includes('3') || selection.includes('chat')) {
        setInteractionMode('chat');
        startChatMode();
      } else {
        addBotMessage("Please select a valid mode (1-3)");
      }
    };

    const showCommandFormat = () => {
      const component = COMPONENTS[currentComponent];
      let format = '';
      
      if (currentComponent === 'payments') {
        format = "Number Client Amount Date Year PaymentMode\nExample: INV-101 TechCorp 5000 2023-08-15 2023 banktransfer";
      } else {
        format = component.fields.join(' ') + `\nExample: `;
        if (currentComponent === 'people') {
          format += "John Doe TechWave USA 5551234567 john@techwave.com";
        } else if (currentComponent === 'leads') {
          format += "John jd@example.com Mumbai hot 9876543210";
        } else if (currentComponent === 'customers') {
          format += "TechCorp tc@tech.com 9876543210 '123 Business St' techcorp.com";
        }
      }
      
      addBotMessage(`Command format:\n${format}`);
    };

    const startChatMode = () => {
      setCurrentStep(0);
      askForCurrentField();
    };

    const askForCurrentField = () => {
      const field = COMPONENTS[currentComponent].fields[currentStep];
      let question = '';
      
      if (currentComponent === 'payments') {
        if (field === 'client') question = "Which client is this payment for?";
        else if (field === 'payment_mode') question = "Payment method? (cash/creditcard/banktransfer)";
        else question = `Enter ${field.replace('_', ' ')}:`;
      } else {
        question = `Enter ${field}:`;
      }
      
      addBotMessage(question);
    };  const processInput = async (input) => {
      if (interactionMode === 'command') {
        await processCommandInput(input);
      } else if (interactionMode === 'chat') {
        await processChatInput(input);
      }
    };

    const processCommandInput = async (input) => {
      try {
        const parsed = parseCommandInput(input);
        if (!parsed) throw new Error("Invalid format");
        
        await saveData(parsed);
        addBotMessage(`✅ ${COMPONENTS[currentComponent].name} record saved successfully!`);
        resetAfterSave();
      } catch (error) {
        addBotMessage(`❌ ${error.message}`, "error");
        showCommandFormat();
      }
    };

    const parseCommandInput = (input) => {
      const parts = input.trim().split(/\s+/);
      const fields = COMPONENTS[currentComponent].fields;
      
      if (parts.length < fields.length) return null;
      
      const data = {};
      fields.forEach((field, index) => {
        data[field] = parts[index];
      });
      
      return data;
    };

    const processChatInput = async (input) => {
      const field = COMPONENTS[currentComponent].fields[currentStep];
      const updatedData = { ...collectedData, [field]: input };
      
      try {
        validateField(field, input);
        setCollectedData(updatedData);
        
        if (currentStep < COMPONENTS[currentComponent].fields.length - 1) {
          setCurrentStep(currentStep + 1);
          askForCurrentField();
        } else {
          await saveData(updatedData);
          addBotMessage(`✅ ${COMPONENTS[currentComponent].name} record saved successfully!`);
          resetAfterSave();
        }
      } catch (error) {
        addBotMessage(`❌ ${error.message}`, "error");
        askForCurrentField();
      }
    };

    const validateField = (field, value) => {
      if (!value.trim()) throw new Error(`${field} cannot be empty`);
      
      if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new Error("Invalid email format");
      }
      
      if (field === 'payment_mode' && !['cash', 'creditcard', 'banktransfer'].includes(value.toLowerCase())) {
        throw new Error("Payment mode must be cash, creditcard, or banktransfer");
      }
    };

    const saveData = async (data) => {
      try {
        const dbRef = ref(db, currentComponent);
        await push(dbRef, data);
        if (onAddRecord) onAddRecord(currentComponent, data);
      } catch (error) {
        console.error("Error saving data:", error);
        throw new Error("Failed to save. Please try again.");
      }
    };

    const resetAfterSave = () => {
      setCurrentComponent(null);
      setInteractionMode(null);
      setCurrentStep(0);
      addBotMessage("Would you like to work with another component? (yes/no)");
    };  const addBotMessage = (text, type = "bot") => {
      setMessages(prev => [...prev, { sender: "bot", text, type }]);
    };

    const toggleVoiceRecognition = () => {
      if (!recognitionRef.current) return;
      
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        if (!interactionMode) setInteractionMode('voice');
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
              <h2>Business Assistant</h2>
              {currentComponent && (
                <div className="mode-indicator">
                  {COMPONENTS[currentComponent].icon}
                  <span>{COMPONENTS[currentComponent].name}</span>
                  {interactionMode && ` | ${interactionMode.toUpperCase()}`}
                </div>
              )}
            </div>
          </div>
          {isListening && (
            <div className="listening-indicator">
              <div className="pulse-animation" />
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
            placeholder={getInputPlaceholder()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isListening && interactionMode === "voice"}
          />
          <div className="input-buttons">
            <button
              onClick={toggleVoiceRecognition}
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

    function getInputPlaceholder() {
      if (!currentComponent) return "Select component (1-4)";
      if (!interactionMode) return "Select mode (1-3)";
      
      if (interactionMode === "command") {
        return `Enter: ${COMPONENTS[currentComponent].fields.join(' ')}`;
      }
      
      if (interactionMode === "chat") {
        const field = COMPONENTS[currentComponent].fields[currentStep];
        return `Enter ${field.replace('_', ' ')}`;
      }
      
      return "Click mic and speak";
    }
  };

  export default Chatbox;