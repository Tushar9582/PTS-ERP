import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Grid, Select, Space, Tag, message } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, AudioOutlined, ReloadOutlined } from "@ant-design/icons";
import { ref, push, onValue, remove, update } from "firebase/database";
import { db } from "./firebase";

const { useBreakpoint } = Grid;
const { TextArea } = Input;

const Peoples = () => {
  const screens = useBreakpoint();
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    company: "", 
    country: "", 
    phone: "", 
    email: "" 
  });
  const [aiCommand, setAiCommand] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [editId, setEditId] = useState(null);
  const [listening, setListening] = useState(false);
  let recognition;

  // Fetch from Firebase
  useEffect(() => {
    const peopleRef = ref(db, "people");
    onValue(peopleRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setPeople(list);
      setFilteredPeople(list);
    });
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = people.filter(person =>
      Object.values(person).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredPeople(filtered);
  }, [searchTerm, people]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      message.error("Name is required");
      return;
    }
    try {
      if (editId) {
        await update(ref(db, `people/${editId}`), formData);
        message.success("Person updated successfully");
      } else {
        await push(ref(db, "people"), formData);
        message.success("Person added successfully");
      }
      setFormData({ name: "", company: "", country: "", phone: "", email: "" });
      setEditId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving person:", error);
      message.error("Error saving person");
    }
  };

  const handleEdit = (person) => {
    setEditId(person.id);
    setFormData({ 
      name: person.name, 
      company: person.company, 
      country: person.country, 
      phone: person.phone, 
      email: person.email 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await remove(ref(db, `people/${id}`));
      message.success("Person deleted successfully");
    } catch (error) {
      console.error("Error deleting person:", error);
      message.error("Error deleting person");
    }
  };

  const handleAICommand = () => {
    const command = aiCommand.toLowerCase();
    if (command.includes("name is") && command.includes("submit")) {
      const name = command.match(/name is (.*?),/i)?.[1]?.trim();
      const company = command.match(/company is (.*?),/i)?.[1]?.trim();
      const country = command.match(/country is (.*?),/i)?.[1]?.trim();
      const phone = command.match(/phone is (.*?),/i)?.[1]?.trim();
      const email = command.match(/email is (.*?)(,|submit)/i)?.[1]?.trim();
      if (name && company && country && phone && email) {
        push(ref(db, 'people'), { name, company, country, phone, email });
        setAiResponse("✔️ Person added successfully via command!");
        setAiCommand("");
        message.success("Person added via AI command");
      } else {
        setAiResponse("❌ Incomplete command. Please follow format: name is ..., company is ..., etc.");
        message.error("Incomplete AI command");
      }
    } else if (command.includes("delete") && command.includes("name is")) {
      const nameToDelete = command.match(/name is (.*)/i)?.[1]?.trim();
      const person = people.find(p => p.name.toLowerCase() === nameToDelete.toLowerCase());
      if (person) {
        remove(ref(db, `people/${person.id}`));
        setAiResponse(`🗑️ Deleted person with name '${nameToDelete}'`);
        message.success(`Deleted ${nameToDelete}`);
      } else {
        setAiResponse("❌ Person not found to delete.");
        message.error("Person not found");
      }
    } else if (command.includes("edit") && command.includes("name is")) {
      const nameToEdit = command.match(/name is (.*?),/i)?.[1]?.trim();
      const updates = {};
      if (command.includes("company is")) updates.company = command.match(/company is (.*?),/i)?.[1]?.trim();
      if (command.includes("country is")) updates.country = command.match(/country is (.*?),/i)?.[1]?.trim();
      if (command.includes("phone is")) updates.phone = command.match(/phone is (.*?),/i)?.[1]?.trim();
      if (command.includes("email is")) updates.email = command.match(/email is (.*?)(,|submit)/i)?.[1]?.trim();
      const person = people.find(p => p.name.toLowerCase() === nameToEdit.toLowerCase());
      if (person) {
        update(ref(db, `people/${person.id}`), updates);
        setAiResponse(`✏️ Updated person '${nameToEdit}'`);
        message.success(`Updated ${nameToEdit}`);
      } else {
        setAiResponse("❌ Person not found to edit.");
        message.error("Person not found");
      }
    } else if (command.includes("export")) {
      const csvData = people.map(p => `${p.name},${p.company},${p.country},${p.phone},${p.email}`).join("\n");
      const blob = new Blob(["Name,Company,Country,Phone,Email\n" + csvData], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'people_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setAiResponse("📤 Data exported successfully.");
      message.success("Data exported");
    } else {
      setAiResponse("❓ Unknown command. Try: name is ..., submit | delete name is ... | export");
      message.info("Unknown AI command");
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error("Your browser doesn't support Speech Recognition");
      return;
    }
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAiCommand(transcript);
    };

    recognition.start();
  };

  // Responsive Columns
  const getColumns = () => {
    if (screens.xs) {
      return [
        {
          title: "People",
          dataIndex: "name",
          key: "name",
          render: (_, record) => (
            <div>
              <strong>👤 {record.name}</strong><br />
              🏢 {record.company || 'N/A'}<br />
              🌎 {record.country || 'N/A'}<br />
              📞 {record.phone || 'N/A'}<br />
              ✉️ {record.email || 'N/A'}
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Button 
                    icon={<EditOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(record);
                    }}
                    size="small"
                  />
                  <Button 
                    icon={<DeleteOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(record.id);
                    }}
                    size="small" 
                    danger
                  />
                </Space>
              </div>
            </div>
          ),
        },
      ];
    }

    return [
      { 
        title: "Name", 
        dataIndex: "name", 
        key: "name",
        render: (name) => <strong>👤 {name}</strong>
      },
      { title: "Company", dataIndex: "company", key: "company", render: (company) => company || 'N/A' },
      { title: "Country", dataIndex: "country", key: "country", render: (country) => country || 'N/A' },
      { title: "Phone", dataIndex: "phone", key: "phone", render: (phone) => phone || 'N/A' },
      { title: "Email", dataIndex: "email", key: "email", render: (email) => email || 'N/A' },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
            <Button 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id)}
              danger
            />
          </Space>
        ),
      },
    ];
  };

  return (
    <div
      style={{
        padding: screens.xs ? "12px" : "24px",
        marginLeft: screens.xs ? "0" : "250px",
        maxWidth: "1100px",
        width: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: screens.xs ? "column" : "row",
          justifyContent: "space-between",
          marginBottom: "16px",
          gap: screens.xs ? "12px" : "8px",
        }}
      >
        <h2 style={{ margin: screens.xs ? "0 0 8px 0" : "0" }}>People List</h2>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexDirection: screens.xs ? "column" : "row",
          }}
        >
          <Input
            placeholder="Search people..."
            allowClear
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: screens.xs ? "100%" : "200px" }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          />
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            style={{ width: screens.xs ? "100%" : "auto" }}
          >
            + Add Person
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={getColumns()}
        dataSource={filteredPeople}
        rowKey="id"
        size={screens.xs ? "small" : "middle"}
        scroll={screens.xs ? { x: true } : undefined}
        style={{
          background: "white",
          borderRadius: "8px",
          padding: screens.xs ? "8px" : "12px",
        }}
        locale={{ emptyText: "No people found" }}
      />

      {/* AI Command Box */}
      <div style={{ 
        marginTop: 24,
        padding: screens.xs ? 8 : 16,
        background: "white",
        borderRadius: 8
      }}>
        <h3 style={{ marginBottom: 16 }}>AI Command Input</h3>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={aiCommand}
            onChange={(e) => setAiCommand(e.target.value)}
            placeholder="e.g. name is John, company is XYZ, country is US, phone is 123456, email is j@j.com, submit"
          />
          <Button type="primary" onClick={handleAICommand}>Execute</Button>
          <Button 
            icon={<AudioOutlined />} 
            onClick={startVoiceRecognition}
            type={listening ? "primary" : "default"}
          >
            {listening ? "Listening..." : "Voice"}
          </Button>
        </Space.Compact>
        {aiResponse && (
          <div style={{ 
            marginTop: 16,
            padding: 8,
            background: '#f0f0f0',
            borderRadius: 4
          }}>
            {aiResponse}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        title={editId ? "Edit Person" : "Add New Person"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditId(null);
        }}
        onOk={handleSubmit}
        okText={editId ? "Update" : "Submit"}
        cancelText="Cancel"
        width={screens.xs ? "90%" : 700}
        style={{ top: screens.xs ? "16px" : "50px" }}
      >
        <div className="row g-3">
          {[
            { label: "Name", name: "name" },
            { label: "Company", name: "company" },
            { label: "Country", name: "country" },
            { label: "Phone", name: "phone" },
            { label: "Email", name: "email" }
          ].map(({ label, name }) => (
            <div className="col-12" key={name}>
              <label className="form-label">{label}</label>
              <Input
                name={name}
                placeholder={`Enter ${label}`}
                value={formData[name]}
                onChange={handleChange}
                required={name === "name"}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Peoples;