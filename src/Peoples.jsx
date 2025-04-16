import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, push, onValue, remove, update } from "firebase/database";
import { db } from './firebase';
import './People.css';

const Peoples = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({ name: '', company: '', country: '', phone: '', email: '' });
  const [aiCommand, setAiCommand] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [listening, setListening] = useState(false);
  let recognition;

  useEffect(() => {
    const peopleRef = ref(db, 'people');
    onValue(peopleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const peopleList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setPeople(peopleList);
      } else {
        setPeople([]);
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson({ ...newPerson, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const peopleRef = ref(db, 'people');
    if (editId) {
      update(ref(db, `people/${editId}`), newPerson).then(() => {
        setEditId(null);
      });
    } else {
      push(peopleRef, newPerson);
    }
    setNewPerson({ name: '', company: '', country: '', phone: '', email: '' });
    setIsFormOpen(false);
  };

  const handleEdit = (person) => {
    setEditId(person.id);
    setNewPerson({ name: person.name, company: person.company, country: person.country, phone: person.phone, email: person.email });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    remove(ref(db, `people/${id}`));
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
        const peopleRef = ref(db, 'people');
        push(peopleRef, { name, company, country, phone, email });
        setAiResponse("✔️ Person added successfully via command!");
        setAiCommand("");
      } else {
        setAiResponse("❌ Incomplete command. Please follow format: name is ..., company is ..., etc.");
      }
    } else if (command.includes("delete") && command.includes("name is")) {
      const nameToDelete = command.match(/name is (.*)/i)?.[1]?.trim();
      const person = people.find(p => p.name.toLowerCase() === nameToDelete.toLowerCase());
      if (person) {
        const personRef = ref(db, `people/${person.id}`);
        remove(personRef);
        setAiResponse(`🗑️ Deleted person with name '${nameToDelete}'`);
      } else {
        setAiResponse("❌ Person not found to delete.");
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
      } else {
        setAiResponse("❌ Person not found to edit.");
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
    } else {
      setAiResponse("❓ Unknown command. Try: name is ..., submit | delete name is ... | export");
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser doesn't support Speech Recognition");
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

  const filteredPeople = people.filter(p =>
    Object.values(p).some(value => value.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container-fluid bg-light py-2 px-1 px-md-3">
      <main className="main-content">
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">People List</h2>
            <div className="d-flex flex-column flex-md-row gap-2 w-100">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={{ maxWidth: "250px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}>Refresh</button>
              <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                Add New Person
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {"Name,Company,Country,Phone,Email,Actions".split(",").map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((person) => (
                    <tr key={person.id}>
                      <td className="text-center">{person.name}</td>
                      <td className="text-center">{person.company}</td>
                      <td className="text-center">{person.country}</td>
                      <td className="text-center">{person.phone}</td>
                      <td className="text-center">{person.email}</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(person)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(person.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="text-center" colSpan="6">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* AI Command Box */}
          <div className="mt-4">
            <label className="form-label fw-bold">AI Command Input</label>
            <div className="d-flex gap-2">
              <input
                type="text"
                value={aiCommand}
                onChange={(e) => setAiCommand(e.target.value)}
                placeholder="e.g. name is John, company is XYZ, country is US, phone is 123456, email is j@j.com, submit"
                className="form-control"
              />
              <button className="btn btn-success" onClick={handleAICommand}>Execute</button>
              <button className="btn btn-dark" onClick={startVoiceRecognition}>
                {listening ? "🎙️ Listening..." : "🎤 Voice"}
              </button>
            </div>
            {aiResponse && <p className="mt-2 text-info fw-bold">{aiResponse}</p>}
          </div>
        </div>
      </main>

      {isFormOpen && (
        <div className="position-fixed top-0 end-0 vh-100 bg-white shadow p-4" style={{ width: "350px", zIndex: 1050 }}>
          <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => { setIsFormOpen(false); setEditId(null); }}></button>
          <h2 className="fs-3 fw-bold mb-3 mt-4">{editId ? "Edit Person" : "Add New Person"}</h2>
          <form className="row g-3" onSubmit={handleSubmit}>
            {[{ label: "Name", name: "name" }, { label: "Company", name: "company" }, { label: "Country", name: "country" }, { label: "Phone", name: "phone" }, { label: "Email", name: "email" }].map(({ label, name }) => (
              <div className="col-12" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type="text"
                  name={name}
                  placeholder={`Enter ${label}`}
                  className="form-control"
                  value={newPerson[name]}
                  onChange={handleInputChange}
                  required={name === "name"}
                />
              </div>
            ))}
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100 py-2">{editId ? "Update" : "Submit"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Peoples;
