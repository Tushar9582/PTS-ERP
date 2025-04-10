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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
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
    <div className={`d-flex vh-100 bg-light ${isMobile ? '' : 'ps-3'}`} style={isMobile ? {} : { marginLeft: "200px" }}>
      <main className={`flex-grow-1 p-3 ${isMobile ? '' : 'ps-4'}`} style={isMobile ? {} : { marginLeft: "70px" }}>
        <div className="bg-white p-3 p-md-4 shadow rounded">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
            <h2 className="fs-3 fw-bold mb-0">Product List</h2>
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-2 w-100 w-md-auto">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search..." 
                style={isMobile ? {width: "100%"} : { width: "200px" }}
              />
              {/* ✅ Updated button layout below */}
              <div className="d-flex flex-column flex-md-row gap-2 w-100">
                <button className="btn btn-outline-secondary flex-grow-1 flex-md-grow-0">Refresh</button>
                <button 
                  className="btn btn-primary flex-grow-1 flex-md-grow-0" 
                  onClick={() => setIsFormOpen(true)}
                >
                  Add New Product
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {isMobile ? (
                    <>
                      <th className="text-center">Name</th>
                      <th className="text-center">Details</th>
                    </>
                  ) : (
                    ["Name", "Category (Name + Description)", "Currency", "Price", "Product Description", "Ref"].map((heading) => (
                      <th key={heading} className="text-center">{heading}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => {
                    const categoryData = getCategoryData(product.category);
                    return isMobile ? (
                      <tr key={product.id}>
                        <td className="text-center">{product.name}</td>
                        <td>
                          <div><strong>Category:</strong> {categoryData.name || product.category}</div>
                          <div className="text-muted small">{categoryData.description || "-"}</div>
                          <div><strong>Price:</strong> {product.currency} {product.price}</div>
                          <div className="text-truncate" style={{ maxWidth: "150px" }} title={product.description}>
                            <strong>Description:</strong> {product.description}
                          </div>
                          <div><strong>Ref:</strong> {product.ref}</div>
                        </td>
                      </tr>
                    ) : (
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
                    <td className="text-center" colSpan={isMobile ? 2 : 6}>No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Form Panel for desktop */}
      {!isMobile ? (
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
          <form onSubmit={handleSubmit}>
            {/* ...form fields... */}
            {/* You already have all these fields correctly implemented */}
            {/* Keeping form code short here, it's unchanged */}
          </form>
        </div>
      ) : (
        // Modal for mobile view
        <div className={`modal ${isFormOpen ? 'd-block' : 'd-none'}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Product</h5>
                <button type="button" className="btn-close" onClick={() => setIsFormOpen(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {/* ...same form fields as above... */}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
