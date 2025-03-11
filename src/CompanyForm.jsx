import React, { useState } from "react";

const CompanyForm = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    country: "",
    phone: "+1 123 456 789",
    email: "",
    website: "",
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Send data to parent (CompanyList)
    setFormData({ name: "", contact: "", country: "", phone: "+1 123 456 789", email: "", website: "" }); // Reset Form
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" onClick={onClose}></div>}

      <div className={`fixed top-0 right-0 w-96 h-full bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-blue-600 text-white relative">
          <h2 className="text-lg font-semibold mx-auto">Add New Company</h2>
          <button onClick={onClose} className="absolute right-4 text-red-500 hover:text-red-700 text-2xl font-bold">✖</button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <label className="block mb-2 font-medium">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400" placeholder="Enter Company Name" required />

            {/* Contact */}
            <label className="block mt-4 mb-2 font-medium">Contact</label>
            <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="w-full p-3 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400" placeholder="Enter Contact" />

            {/* Country */}
            <label className="block mt-4 mb-2 font-medium">Country</label>
            <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full p-3 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400" placeholder="Enter Country" />

            {/* Phone (Disabled) */}
            <label className="block mt-4 mb-2 font-medium">Phone</label>
            <input type="text" name="phone" value={formData.phone} disabled className="w-full p-3 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed" />

            {/* Email */}
            <label className="block mt-4 mb-2 font-medium text-red-500">* Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400" placeholder="email@example.com" required />

            {/* Website */}
            <label className="block mt-4 mb-2 font-medium">Website</label>
            <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full p-3 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400" placeholder="www.example.com" />

            {/* Submit Button */}
            <button type="submit" className="w-full mt-6 bg-blue-600 text-white p-3 rounded-md shadow-md hover:bg-blue-700 transition">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CompanyForm;
