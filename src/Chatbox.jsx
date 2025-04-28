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
    fields: ["name", "company", "country", "phone", "email"],
    fieldLabels: {
      name: "Full Name",
      company: "Company",
      country: "Country",
      phone: "Phone Number",
      email: "Email Address"
    }
  },
  leads: {
    name: "Leads",
    icon: <FaChartLine />,
    fields: ["name", "email", "branch", "type", "phone"],
    fieldLabels: {
      name: "Full Name",
      email: "Email Address",
      branch: "Branch Location",
      type: "Lead Type (hot/warm/cold)",
      phone: "Phone Number"
    }
  },
  customers: {
    name: "Clients",
    icon: <FaUserTie />,
    fields: ["name", "email", "phone", "address", "company"],
    fieldLabels: {
      name: "Client Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Physical Address",
      company: "Company Name"
    }
  },
  payments: {
    name: "Payments",
    icon: <FaMoneyBillWave />,
    fields: ["number", "client", "amount", "date", "year", "payment_mode"],
    fieldLabels: {
      number: "Invoice Number",
      client: "Client Name",
      amount: "Amount",
      date: "Date (YYYY-MM-DD)",
      year: "Year",
      payment_mode: "Payment Method (cash/creditcard/banktransfer)"
    }
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
  }, [currentComponent]);

  // Voice recognition setup
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

    try {
      if (!currentComponent) {
        await handleComponentSelection(userInput);
      } else if (!interactionMode) {
        await handleModeSelection(userInput);
      } else {
        await processInput(userInput);
      }
    } catch (error) {
      addBotMessage(`❌ ${error.message}`, "error");
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
      addBotMessage(`You selected: ${COMPONENTS[selectedComponent].name}. How would you like to add records?`);
      addBotMessage("Choose mode:\n1. Command (single line)\n2. Voice");
    } else {
      addBotMessage("Please select a valid option (1-4)");
    }
  };

  const handleModeSelection = (input) => {
    const selection = input.toLowerCase();
    
    if (selection.includes('1') || selection.includes('command')) {
      setInteractionMode('command');
      showCommandFormat();
    } else if (selection.includes('2') || selection.includes('voice')) {
      setInteractionMode('voice');
      addBotMessage("Voice mode selected. Click the microphone button and speak clearly.");
    } else {
      addBotMessage("Please select a valid mode (1-2)");
    }
  };

  const showCommandFormat = () => {
    const component = COMPONENTS[currentComponent];
    let format = '';
    let example = '';
    
    if (currentComponent === 'payments') {
      format = "Number Client Amount Date Year PaymentMode";
      example = "Example: INV-101 TechCorp 5000 2023-08-15 2023 banktransfer";
    } else {
      format = component.fields.join(' ');
      if (currentComponent === 'people') {
        example = "Example: John Doe TechWave USA 5551234567 john@techwave.com";
      } else if (currentComponent === 'leads') {
        example = "Example: John jd@example.com Mumbai hot 9876543210";
      } else if (currentComponent === 'customers') {
        example = "Example: TechCorp tc@tech.com 9876543210 '123 Business St' techcorp.com";
      }
    }
    
    addBotMessage(`Enter all fields in this order:\n${format}`);
    addBotMessage(example);
  };

  const processInput = async (input) => {
    if (interactionMode === 'command') {
      await processCommandInput(input);
    } else if (interactionMode === 'voice') {
      await processCommandInput(input);
    }
  };

  const processCommandInput = async (input) => {
    const parsed = parseCommandInput(input);
    if (!parsed) throw new Error("Invalid format. Please check the field order and try again.");
    
    // Validate all fields
    for (const field of COMPONENTS[currentComponent].fields) {
      validateField(field, parsed[field]);
    }
    
    await saveData(parsed);
    addBotMessage(`✅ ${COMPONENTS[currentComponent].name} record saved successfully!`);
    resetAfterSave();
  };

  const parseCommandInput = (input) => {
    // Handle quoted strings that might contain spaces
    const parts = input.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g) || [];
    const cleanedParts = parts.map(part => 
      part.startsWith('"') && part.endsWith('"') ? part.slice(1, -1) : 
      part.startsWith("'") && part.endsWith("'") ? part.slice(1, -1) : 
      part
    );
    
    const fields = COMPONENTS[currentComponent].fields;
    
    if (cleanedParts.length < fields.length) return null;
    
    const data = {};
    fields.forEach((field, index) => {
      data[field] = cleanedParts[index];
    });
    
    return data;
  };

  const validateField = (field, value) => {
    if (!value || !value.trim()) throw new Error(`${field} cannot be empty`);
    
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error("Please enter a valid email address");
    }
    
    if (field === 'phone' && !/^[0-9+() -]{7,}$/.test(value)) {
      throw new Error("Please enter a valid phone number");
    }
    
    if (field === 'payment_mode' && !['cash', 'creditcard', 'banktransfer'].includes(value.toLowerCase())) {
      throw new Error("Payment method must be cash, creditcard, or banktransfer");
    }
    
    if (field === 'amount' && isNaN(Number(value))) {
      throw new Error("Amount must be a number");
    }
    
    if (field === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error("Date must be in YYYY-MM-DD format");
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
    setCollectedData({});
    addBotMessage("Would you like to work with another component? (yes/no)");
  };

  const addBotMessage = (text, type = "bot") => {
    setMessages(prev => [...prev, { sender: "bot", text, type }]);
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      addBotMessage("Voice recognition is not supported in your browser", "error");
      return;
    }
    
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

  const handleReset = () => {
    setCurrentComponent(null);
    setInteractionMode(null);
    setCollectedData({});
    addBotMessage("Session reset. What would you like to work with?");
    addBotMessage("Please choose an option:\n1. People\n2. Leads\n3. Clients\n4. Payments");
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
                {interactionMode && ` | ${interactionMode.charAt(0).toUpperCase() + interactionMode.slice(1)} Mode`}
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
              {msg.sender === "user" && <div className="user-avatar">U</div>}
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
            disabled={!currentComponent || isTyping}
          >
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button
            onClick={handleSend}
            className="send-btn"
            disabled={isTyping || !input.trim()}
            title="Send message"
          >
            {isTyping ? <FaSpinner className="spin" /> : <FaPaperPlane />}
          </button>
          {(currentComponent || interactionMode) && (
            <button
              onClick={handleReset}
              className="reset-btn"
              title="Start over"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );

  function getInputPlaceholder() {
    if (!currentComponent) return "Select component (1-4)";
    if (!interactionMode) return "Select mode (1-2)";
    
    if (interactionMode === "command") {
      return `Enter: ${COMPONENTS[currentComponent].fields.join(' ')}`;
    }
    
    return "Click mic and speak";
  }
};

export default Chatbox;