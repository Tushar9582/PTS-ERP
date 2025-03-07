import React, { useState } from "react";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample product data
  const products = [
    { id: 1, name: "Laptop", price: 55000, stock: "In Stock", category: "Electronics", img: "https://via.placeholder.com/150" },
    { id: 2, name: "Smartphone", price: 25000, stock: "Out of Stock", category: "Electronics", img: "https://via.placeholder.com/150" },
    { id: 3, name: "Headphones", price: 3000, stock: "In Stock", category: "Accessories", img: "https://via.placeholder.com/150" },
    { id: 4, name: "Office Chair", price: 8000, stock: "In Stock", category: "Furniture", img: "https://via.placeholder.com/150" },
  ];

  // Filter products based on search input
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🛍 Product Management</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchBar}
      />

      {/* Products Grid */}
      <div style={styles.grid}>
        {filteredProducts.map((product) => (
          <div key={product.id} style={styles.card}>
            <img src={product.img} alt={product.name} style={styles.image} />
            <h3>{product.name}</h3>
            <p>Price: ₹{product.price}</p>
            <p>Category: {product.category}</p>
            <p style={{ color: product.stock === "In Stock" ? "green" : "red" }}>
              {product.stock}
            </p>
            <div style={styles.buttonContainer}>
              <button style={styles.editButton}>✏️ Edit</button>
              <button style={styles.deleteButton}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: "20px",
    marginLeft: "80px", // Adjust for sidebar width
    backgroundColor: "#f5f7fa",
  },
  heading: {
    marginBottom: "20px",
  },
  searchBar: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  buttonContainer: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Products;
