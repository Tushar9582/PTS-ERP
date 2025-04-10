import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, push, onValue } from "firebase/database";
import { db } from './firebase';

const ProductsCategory = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    category: ''
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
    const categoriesRef = ref(db, 'categories');
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCategories(categoriesList);
      } else {
        setCategories([]);
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const categoriesRef = ref(db, 'categories');
    push(categoriesRef, newCategory)
      .then(() => {
        console.log("Category saved to Firebase!");
        setNewCategory({ name: '', description: '', category: '' });
        setIsFormOpen(false);
      })
      .catch((error) => {
        console.error("Error saving category: ", error);
      });
  };

  return (
    <div className={`d-flex vh-100 bg-light ${isMobile ? '' : 'ps-3'}`} style={isMobile ? {} : { marginLeft: '200px' }}>
      <main className={`flex-grow-1 p-3 ${isMobile ? '' : 'ps-4'}`} style={isMobile ? {} : { marginLeft: "70px" }}>
        <div className="bg-white p-3 p-md-4 shadow rounded">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
            <h2 className="fs-3 fw-bold mb-0">Product Categories</h2>
            <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={isMobile ? { width: '100%' } : { width: '200px' }}
              />
              <div className="d-flex flex-column flex-md-row gap-2 w-100">
                <button className="btn btn-outline-secondary flex-grow-1 flex-md-grow-0">Refresh</button>
                <button
                  className="btn btn-primary flex-grow-1 flex-md-grow-0"
                  onClick={() => setIsFormOpen(true)}
                >
                  Add New Category
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {["Name", "Description", "Product Category"].map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="text-center">{category.name}</td>
                      <td className="text-center">{category.description}</td>
                      <td className="text-center">{category.category}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center" colSpan="3">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🖥️ Sidebar on Desktop */}
      {!isMobile ? (
        <div
          className={"position-fixed top-0 end-0 vh-100 bg-white shadow p-4 " + (isFormOpen ? "translate-0" : "translate-100")}
          style={{
            width: "350px",
            marginRight: "20px",
            transform: isFormOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <button className="btn-close position-absolute top-2 end-2" onClick={() => setIsFormOpen(false)}></button>
          <h2 className="fs-3 fw-bold mb-3">Add New Category</h2>
          <form className="row g-3" onSubmit={handleSubmit}>
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Description", name: "description", type: "text" },
              { label: "Product Category", name: "category", type: "text" }
            ].map(({ label, name, type }) => (
              <div className="col-12" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  className="form-control"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  name={name}
                  value={newCategory[name]}
                  onChange={handleInputChange}
                  required
                  style={{ border: '1px solid black' }}
                />
              </div>
            ))}
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100">
                Submit
              </button>
            </div>
          </form>
        </div>
      ) : (
        // 📱 Modal on Mobile
        <div className={`modal ${isFormOpen ? 'd-block' : 'd-none'}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Category</h5>
                <button type="button" className="btn-close" onClick={() => setIsFormOpen(false)}></button>
              </div>
              <div className="modal-body">
                <form className="row g-3" onSubmit={handleSubmit}>
                  {[
                    { label: "Name", name: "name", type: "text" },
                    { label: "Description", name: "description", type: "text" },
                    { label: "Product Category", name: "category", type: "text" }
                  ].map(({ label, name, type }) => (
                    <div className="col-12" key={name}>
                      <label className="form-label">{label}</label>
                      <input
                        type={type}
                        className="form-control"
                        placeholder={`Enter ${label.toLowerCase()}`}
                        name={name}
                        value={newCategory[name]}
                        onChange={handleInputChange}
                        required
                        style={{ border: '1px solid black' }}
                      />
                    </div>
                  ))}
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary w-100 mt-2">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsCategory;
