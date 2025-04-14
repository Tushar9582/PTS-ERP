import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, push, onValue } from 'firebase/database';
import { db } from './firebase'; // Adjust the path to your firebase.js
import './People.css'; // Reuse same styling from customer

const Products = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    currency: 'us $ (US Dollar)',
    description: '',
    ref: ''
  });

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setProducts(productList);
      } else {
        setProducts([]);
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productsRef = ref(db, 'products');
    push(productsRef, newProduct)
      .then(() => {
        console.log("Product saved to Firebase!");
        setNewProduct({ name: '', category: '', price: '', currency: 'us $ (US Dollar)', description: '', ref: '' });
        setIsFormOpen(false);
      })
      .catch((error) => {
        console.error("Error saving product: ", error);
      });
  };

  return (
    <div className="container-fluid bg-light py-2 px-1 px-md-3">
      <main className="main-content">
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Products List</h2>
            <div className="d-flex flex-column flex-md-row gap-2 w-100">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={{ maxWidth: "250px" }}
              />
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
                  {["Name", "Category", "Price", "Currency", "Ref", "Description"].map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="text-center">{product.name}</td>
                      <td className="text-center">{product.category}</td>
                      <td className="text-center">{product.price}</td>
                      <td className="text-center">{product.currency}</td>
                      <td className="text-center">{product.ref}</td>
                      <td className="text-center">{product.description}</td>
                    </tr>
                  ))
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

      {/* CRM-style Slide-In Panel */}
      {isFormOpen && (
        <div
          className="position-fixed top-0 end-0 vh-100 bg-white shadow p-4"
          style={{
            width: "350px",
            zIndex: 1050,
            transition: "transform 0.3s ease-in-out",
            transform: isFormOpen ? "translateX(0)" : "translateX(100%)"
          }}
        >
          <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setIsFormOpen(false)}></button>
          <h2 className="fs-3 fw-bold mb-3 mt-4">Add New Product</h2>

          <form className="row g-3" onSubmit={handleSubmit}>
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Category", name: "category", type: "text" },
              { label: "Price", name: "price", type: "number" },
              { label: "Ref", name: "ref", type: "text" },
            ].map(({ label, name, type }) => (
              <div className="col-12" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  name={name}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="form-control"
                  value={newProduct[name]}
                  onChange={handleInputChange}
                  required
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px'
                  }}
                />
              </div>
            ))}

            <div className="col-12">
              <label className="form-label">Currency</label>
              <select
                className="form-select"
                name="currency"
                value={newProduct.currency}
                onChange={handleInputChange}
                required
              >
                <option value="us $ (US Dollar)">us $ (US Dollar)</option>
                <option value="€ (Euro)">€ (Euro)</option>
                <option value="₹ (INR)">₹ (INR)</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                placeholder="Enter product description"
                rows="3"
                value={newProduct.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100">
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Products;
