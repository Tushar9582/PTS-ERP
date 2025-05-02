import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Grid, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ref, push, onValue } from "firebase/database";
import { db } from "./firebase";

const { useBreakpoint } = Grid;

const Products = () => {
  const screens = useBreakpoint();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    currency: "us $ (US Dollar)",
    description: "",
    ref: ""
  });

  // Fetch from Firebase
  useEffect(() => {
    const productsRef = ref(db, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setProducts(list);
      setFilteredProducts(list);
    });
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = products.filter(product =>
      Object.values(product).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    try {
      await push(ref(db, "products"), formData);
      setFormData({
        name: "",
        category: "",
        price: "",
        currency: "us $ (US Dollar)",
        description: "",
        ref: ""
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Responsive Columns
  const getColumns = () => {
    if (screens.xs) {
      return [
        {
          title: "Product Details",
          dataIndex: "name",
          key: "name",
          render: (_, record) => (
            <div>
              <strong>{record.name}</strong><br />
              🏷️ {record.category || 'N/A'}<br />
              💵 {record.price} {record.currency}<br />
              #️⃣ {record.ref || 'N/A'}<br />
              📝 {record.description || 'N/A'}
            </div>
          ),
        },
      ];
    }

    return [
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Category", dataIndex: "category", key: "category", render: (category) => category || 'N/A' },
      { 
        title: "Price", 
        dataIndex: "price", 
        key: "price",
        render: (_, record) => `${record.price || 'N/A'} ${record.currency || ''}`
      },
      { title: "Ref", dataIndex: "ref", key: "ref", render: (ref) => ref || 'N/A' },
      { 
        title: "Description", 
        dataIndex: "description", 
        key: "description",
        render: (description) => description || 'N/A'
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
        <h2 style={{ margin: screens.xs ? "0 0 8px 0" : "0" }}>Products List</h2>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexDirection: screens.xs ? "column" : "row",
          }}
        >
          <Input
            placeholder="Search products..."
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
            + Add Product
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={getColumns()}
        dataSource={filteredProducts}
        rowKey="id"
        size={screens.xs ? "small" : "middle"}
        scroll={screens.xs ? { x: true } : undefined}
        style={{
          background: "white",
          borderRadius: "8px",
          padding: screens.xs ? "8px" : "12px",
        }}
        locale={{ emptyText: "No products found" }}
      />

      {/* Modal */}
      <Modal
        title="Add New Product"
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
            { label: "Category", name: "category" },
            { label: "Price", name: "price", type: "number" },
            { label: "Ref", name: "ref" },
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
          
          <div className="col-12">
            <label className="form-label">Currency</label>
            <Select
              style={{ width: '100%' }}
              value={formData.currency}
              onChange={(value) => handleSelectChange(value, "currency")}
              options={[
                { value: 'us $ (US Dollar)', label: 'us $ (US Dollar)' },
                { value: '€ (Euro)', label: '€ (Euro)' },
                { value: '₹ (INR)', label: '₹ (INR)' },
              ]}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <Input.TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;