import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, push, onValue } from "firebase/database";
import { db } from './firebase';
import './ProductsCategory.css';

const ProductsCategory = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredCategories = categories.filter(category =>
    Object.values(category).some(value => 
      value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="container-fluid bg-light py-2 px-1 px-md-3">
      <main className="main-content">
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Product Categories</h2>
            <div className="d-flex flex-column flex-md-row gap-2 w-100">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={{ maxWidth: "250px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setIsFormOpen(true)}
              >
                Add New Category
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered" style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '50%' }} />
                <col style={{ width: '25%' }} />
              </colgroup>
              <thead className="table-light">
                <tr>
                  {["Name", "Description", "Category"].map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="text-center text-nowrap" style={{ overflow: 'visible' }}>
                        {category.name || 'N/A'}
                      </td>
                      <td className="text-wrap" style={{ minWidth: '200px' }}>
                        {category.description || 'N/A'}
                      </td>
                      <td className="text-center text-nowrap">
                        {category.category || 'N/A'}
                      </td>
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

      {/* Form Panel */}
      {isFormOpen && (
        <div
          className="position-fixed top-0 end-0 vh-100 bg-white shadow p-4"
          style={{
            width: isMobile ? "100%" : "350px",
            zIndex: 1050,
            transition: "transform 0.3s ease-in-out",
            transform: isFormOpen ? "translateX(0)" : "translateX(100%)"
          }}
        >
          <button 
            className="btn-close position-absolute top-0 end-0 m-3" 
            onClick={() => setIsFormOpen(false)}
          ></button>
          <h2 className="fs-3 fw-bold mb-3 mt-4">Add New Category</h2>
          <form className="row g-3" onSubmit={handleSubmit}>
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Description", name: "description", type: "text" },
              { label: "Category", name: "category", type: "text" }
            ].map(({ label, name, type }) => (
              <div className="col-12" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  name={name}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="form-control"
                  value={newCategory[name]}
                  onChange={handleInputChange}
                  required
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
      )}
    </div>
  );
};

export default ProductsCategory;