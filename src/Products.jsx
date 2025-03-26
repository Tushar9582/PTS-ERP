import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "./firebase";
import Swal from "sweetalert2";
import { ref, push, onValue, set } from "firebase/database";

const Products = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    currency: "us $ (US Dollar)",
    price: "",
    description: "",
    ref: ""
  });

  // Fetch products and categories from Firebase
  useEffect(() => {
    // Fetch products
    const productsRef = ref(db, "products");
    onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const productList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        setProducts(productList);
      } else {
        setProducts([]);
      }
    });

    // Fetch categories
    const categoriesRef = ref(db, "categories");
    onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const categoriesList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        setCategories(categoriesList);
      } else {
        setCategories([]);
      }
    });
  }, []);

  // Find full category data by name
  const getCategoryData = (categoryName) => {
    return categories.find(cat => cat.name === categoryName) || {};
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const newProductRef = push(ref(db, "products"));
  
    set(newProductRef, newProduct)
      .then(() => {
        Swal.fire({
          title: "Success!",
          text: "Product added successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
  
        setNewProduct({
          name: "",
          category: "",
          currency: "us $ (US Dollar)",
          price: "",
          description: "",
          ref: ""
        });
        setIsFormOpen(false);
      })
      .catch((error) => {
        Swal.fire({
          title: "Error!",
          text: "Failed to add product. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
        console.error("Error adding product:", error);
      });
  };

  return (
    <div className="d-flex vh-100 bg-light" style={{ marginLeft: "200px" }}>
      <main className="flex-grow-1 ms-5 p-4" style={{ marginLeft: "270px" }}>
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Product List</h2>
            <div className="d-flex gap-2">
              <input type="text" className="form-control2" placeholder="Search..." style={{ width: "200px" }} />
              <button className="btn btn-outline-secondary">Refresh</button>
              <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                Add New Product
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {["Name", "Category (Name + Description)", "Currency", "Price", "Product Description", "Ref"].map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => {
                    const categoryData = getCategoryData(product.category);
                    return (
                      <tr key={product.id}>
                        <td className="text-center">{product.name}</td>
                        <td className="text-center">
                          <div><strong>{categoryData.name || product.category}</strong></div>
                          <div className="text-muted small">{categoryData.description || "-"}</div>
                        </td>
                        <td className="text-center">{product.currency}</td>
                        <td className="text-center">{product.price}</td>
                        <td className="text-center">{product.description}</td>
                        <td className="text-center">{product.ref}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="text-center" colSpan="6">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <div
        className={`position-fixed top-0 end-0 vh-100 bg-white shadow p-4 transition ${
          isFormOpen ? "translate-0" : "translate-100"
        }`}
        style={{
          width: "350px",
          marginRight: "20px",
          transform: isFormOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <button className="btn-close position-absolute top-2 end-2" onClick={() => setIsFormOpen(false)}></button>
        <h2 className="fs-3 fw-bold mb-3">Add New Product</h2>

        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-12">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter name"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              required
              style={{border:'1px solid black'}}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Product Category</label>
            <select
              className="form-select"
              name="category"
              value={newProduct.category}
              onChange={handleInputChange}
              required
              style={{border:'1px solid black'}}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.category}>
                  {category.category}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">Currency *</label>
            <select
              className="form-select"
              name="currency"
              value={newProduct.currency}
              onChange={handleInputChange}
              required
              style={{border:'1px solid black'}}
            >
              <option value="us $ (US Dollar)">us $ (US Dollar)</option>
              <option value="€ (Euro)">€ (Euro)</option>
              <option value="£ (Pound Sterling)">£ (Pound Sterling)</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter price"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              required
              style={{border:'1px solid black'}}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              placeholder="Enter description"
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              required
              style={{border:'1px solid black'}}
            ></textarea>
          </div>

          <div className="col-12">
            <label className="form-label">Ref</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter reference"
              name="ref"
              value={newProduct.ref}
              onChange={handleInputChange}
              required
              style={{border:'1px solid black'}}
            />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;