import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Grid } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ref, push, onValue } from "firebase/database";
import { db } from "./firebase";

const { useBreakpoint } = Grid;

const ProductsCategory = () => {
  const screens = useBreakpoint();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: ""
  });

  // Fetch from Firebase
  useEffect(() => {
    const categoriesRef = ref(db, "categories");
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setCategories(list);
      setFilteredCategories(list);
    });
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = categories.filter(category =>
      Object.values(category).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    try {
      await push(ref(db, "categories"), formData);
      setFormData({
        name: "",
        description: "",
        category: ""
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Responsive Columns
  const getColumns = () => {
    if (screens.xs) {
      return [
        {
          title: "Category Details",
          dataIndex: "name",
          key: "name",
          render: (_, record) => (
            <div>
              <strong>{record.name}</strong><br />
              📝 {record.description || 'N/A'}<br />
              🏷️ {record.category || 'N/A'}
            </div>
          ),
        },
      ];
    }

    return [
      { title: "Name", dataIndex: "name", key: "name" },
      { 
        title: "Description", 
        dataIndex: "description", 
        key: "description",
        render: (description) => description || 'N/A'
      },
      { 
        title: "Category", 
        dataIndex: "category", 
        key: "category",
        render: (category) => category || 'N/A'
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
        <h2 style={{ margin: screens.xs ? "0 0 8px 0" : "0" }}>Product Categories</h2>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexDirection: screens.xs ? "column" : "row",
          }}
        >
          <Input
            placeholder="Search categories..."
            allowClear
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: screens.xs ? "100%" : "200px" }}
          />
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            style={{ width: screens.xs ? "100%" : "auto" }}
          >
            + Add Category
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={getColumns()}
        dataSource={filteredCategories}
        rowKey="id"
        size={screens.xs ? "small" : "middle"}
        scroll={screens.xs ? { x: true } : undefined}
        style={{
          background: "white",
          borderRadius: "8px",
          padding: screens.xs ? "8px" : "12px",
        }}
        locale={{ emptyText: "No categories found" }}
      />

      {/* Modal */}
      <Modal
        title="Add New Category"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText="Submit"
        cancelText="Cancel"
        width={screens.xs ? "90%" : 700}
        style={{ top: screens.xs ? "16px" : "50px" }}
      >
        <div className="row g-3">
          {[
            { label: "Name", name: "name" },
            { label: "Description", name: "description" },
            { label: "Category", name: "category" },
          ].map(({ label, name, type = "text" }) => (
            <div className="col-12" key={name}>
              <label className="form-label">{label}</label>
              <Input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={name === "name"}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ProductsCategory;