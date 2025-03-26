import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, push, onValue } from "firebase/database";
import { db } from './firebase'; // Import the Firebase db instance

const ProductsCategory = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    category: ''  // Changed from 'color' to 'category'
  });

  // Fetch data from Firebase on component mount
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

    // Reference to the "categories" node in Firebase
    const categoriesRef = ref(db, 'categories');

    // Push new category data to Firebase
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
    <div className="d-flex vh-100 bg-light" style={{ marginLeft: '200px' }}>
      <main className="flex-grow-1 ms-5 p-4" style={{ marginLeft: "270px" }}>
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Product Categories</h2>
            <div className="d-flex gap-2">
              <input type="text" className="form-control2" placeholder="Search..." style={{ width: "200px" }} />
              <button className="btn btn-outline-secondary">Refresh</button>
              <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                Add New Category
              </button>
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
            { label: "Product Category", name: "category", type: "text" }  // Changed from 'color' to 'category'
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
                style={{border:'1px solid black'}}
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
    </div>
  );
};

export default ProductsCategory;