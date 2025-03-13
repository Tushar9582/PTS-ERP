import React, { useState } from "react";

const CompanyForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    country: "",
    phone: "",  // Removed default value
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
    onSave(formData); // Send data to Firebase
    setFormData({ name: "", contact: "", country: "", phone: "", email: "", website: "" }); // Reset Form
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <label className="block mb-2 font-medium">Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-md" required />

        {/* Contact */}
        <label className="block mt-4 mb-2 font-medium">Contact</label>
        <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="w-full p-3 border rounded-md" />

        {/* Country */}
        <label className="block mt-4 mb-2 font-medium">Country</label>
        <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full p-3 border rounded-md" />

        {/* Phone */}
        <label className="block mt-4 mb-2 font-medium">Phone</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border rounded-md" required />

        {/* Email */}
        <label className="block mt-4 mb-2 font-medium text-red-500">* Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-md" required />

        {/* Website */}
        <label className="block mt-4 mb-2 font-medium">Website</label>
        <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full p-3 border rounded-md" />

        {/* Submit Button */}
        <button type="submit" className="w-full mt-6 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default CompanyForm;
