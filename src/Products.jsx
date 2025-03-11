import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap

const Products = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    currency: 'us $ (US Dollar)',
    price: '',
    description: '',
    ref: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProducts([...products, newProduct]);
    setNewProduct({
      name: '',
      category: '',
      currency: 'us $ (US Dollar)',
      price: '',
      description: '',
      ref: ''
    });
    setIsFormOpen(false);
  };

  return (
    <div className="d-flex vh-100 bg-light" style={{ marginLeft: '200px' }}>
      {/* Main Content */}
      <main className="flex-grow-1 ms-5 p-4" style={{ marginLeft: "270px" }}>
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Product List</h2>
            <div className="d-flex gap-2">
              <input type="text" className="form-control" placeholder="Search..." style={{ width: "200px" }} />
              <button className="btn btn-outline-secondary">Refresh</button>
              <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                Add New Product
              </button>
            </div>
          </div>

          {/* Product Table */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {["Name", "Product Category", "Currency", "Price", "Description", "Ref"].map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <tr key={index}>
                      <td className="text-center">{product.name}</td>
                      <td className="text-center">{product.category}</td>
                      <td className="text-center">{product.currency}</td>
                      <td className="text-center">{product.price}</td>
                      <td className="text-center">{product.description}</td>
                      <td className="text-center">{product.ref}</td>
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

      {/* Slide-in Form */}
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

        {/* Bootstrap Form */}
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
            >
              <option value="">Select</option>
              <option value="Category 1">Category 1</option>
              <option value="Category 2">Category 2</option>
              <option value="Category 3">Category 3</option>
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
            />
          </div>

          <div className="col-12">
            <label className="form-label">Ref</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter ref"
              name="ref"
              value={newProduct.ref}
              onChange={handleInputChange}
              required
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