import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./navbar";
import Dashboard from "./Dashboard";
import Invoices from "./Invoices";
import Payments from "./Payments";
import QuotesForCustomers from "./QuotesForCustomers";
import Customers from "./Customers";
import Peoples from "./Peoples";
import Companies from "./Companies";
import Leads from "./Leads";
import QuotesForLeads from "./QuotesForLeads";
import Products from "./Products";
import ProductsCategory from "./ProductsCategory";
import Expenses from "./Expenses";
import ExpensesCategory from "./ExpensesCategory";
import Reports from "./Reports";
import Settings from "./Settings";

function App() {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Navbar /> {/* Sidebar Component */}
        <div style={{ flexGrow: 1, padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/quotes-for-customers" element={<QuotesForCustomers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/peoples" element={<Peoples />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/quotes-for-leads" element={<QuotesForLeads />} />
            <Route path="/products" element={<Products />} />
            <Route path="/Products-Category" element={<ProductsCategory />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses-category" element={<ExpensesCategory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
