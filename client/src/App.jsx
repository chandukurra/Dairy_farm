import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Global Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Customer specific pages
import MyPurchases from './pages/customer/MyPurchases';
import MyPayments from './pages/customer/MyPayments';

// Animal Management
import AnimalList from './pages/animals/AnimalList';
import AnimalForm from './pages/animals/AnimalForm';
import AnimalProfile from './pages/animals/AnimalProfile';

// Milk Production & Verifications
import MilkList from './pages/milk/MilkList';
import MilkForm from './pages/milk/MilkForm';
import VerificationList from './pages/admin/VerificationList';

// Customers & Sales
import CustomerList from './pages/customers/CustomerList';
import SaleList from './pages/sales/SaleList';
import SaleForm from './pages/sales/SaleForm';

// Finance
import ExpenseList from './pages/finance/ExpenseList';
import ExpenseForm from './pages/finance/ExpenseForm';
import IncomeList from './pages/finance/IncomeList';
import IncomeForm from './pages/finance/IncomeForm';
import PaymentList from './pages/finance/PaymentList';
import PaymentForm from './pages/finance/PaymentForm';
import CustomerPaymentForm from './pages/customer/CustomerPaymentForm';
import Attendance from './pages/admin/Attendance';

// Inventory
import InventoryList from './pages/inventory/InventoryList';
import InventoryItemForm from './pages/inventory/InventoryItemForm';
import InventoryTransactionForm from './pages/inventory/InventoryTransactionForm';

// Reports & Users (Admin Only)
import AnalyticsDashboard from './pages/reports/AnalyticsDashboard';
import UserList from './pages/admin/UserList';
import UserForm from './pages/admin/UserForm';

function App() {
  return (
    <Router>
      <div className="app-container bg-light min-vh-100">
        <Routes>
          {/* -------------------------------------- */}
          {/* PUBLIC ROUTES                          */}
          {/* -------------------------------------- */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          {/* -------------------------------------- */}
          {/* ADMIN PROTECTED ROUTES                 */}
          {/* -------------------------------------- */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Layout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="dashboard" element={<AdminDashboard />} />
                  
                  {/* Animals */}
                  <Route path="animals" element={<AnimalList />} />
                  <Route path="animals/new" element={<AnimalForm />} />
                  <Route path="animals/edit/:id" element={<AnimalForm />} />
                  <Route path="animals/:id" element={<AnimalProfile />} />
                  
                  {/* Milk & Verifications */}
                  <Route path="milk" element={<MilkList />} />
                  <Route path="milk/new" element={<MilkForm />} />
                  <Route path="verifications" element={<VerificationList />} />
                  
                  {/* Sales & Customers */}
                  <Route path="customers" element={<CustomerList />} />
                  <Route path="sales" element={<SaleList />} />
                  <Route path="sales/new" element={<SaleForm />} />
                  
                  {/* Finance */}
                  <Route path="expenses" element={<ExpenseList />} />
                  <Route path="expenses/new" element={<ExpenseForm />} />
                  <Route path="income" element={<IncomeList />} />
                  <Route path="income/new" element={<IncomeForm />} />
                  <Route path="payments" element={<PaymentList />} />
                  <Route path="payments/new" element={<PaymentForm />} />
                  
                  {/* Inventory */}
                  <Route path="inventory" element={<InventoryList />} />
                  <Route path="inventory/new" element={<InventoryItemForm />} />
                  <Route path="inventory/transaction" element={<InventoryTransactionForm />} />
                  
                  {/* Reports & System Administration */}
                  <Route path="reports" element={<AnalyticsDashboard />} />
                  <Route path="users" element={<UserList />} />
                  <Route path="users/new" element={<UserForm />} />
                  <Route path="attendance" element={<Attendance />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />


          {/* -------------------------------------- */}
          {/* FARM MANAGER PROTECTED ROUTES          */}
          {/* -------------------------------------- */}
          <Route path="/manager/*" element={
            <ProtectedRoute allowedRoles={['FARM_MANAGER']}>
              <Layout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="dashboard" element={<ManagerDashboard />} />
                  
                  {/* Animals */}
                  <Route path="animals" element={<AnimalList />} />
                  <Route path="animals/new" element={<AnimalForm />} />
                  <Route path="animals/edit/:id" element={<AnimalForm />} />
                  <Route path="animals/:id" element={<AnimalProfile />} />
                  
                  {/* Milk (No verifications access) */}
                  <Route path="milk" element={<MilkList />} />
                  <Route path="milk/new" element={<MilkForm />} />
                  
                  {/* Sales & Customers */}
                  <Route path="customers" element={<CustomerList />} />
                  <Route path="sales" element={<SaleList />} />
                  <Route path="sales/new" element={<SaleForm />} />
                  
                  {/* Finance */}
                  <Route path="expenses" element={<ExpenseList />} />
                  <Route path="expenses/new" element={<ExpenseForm />} />
                  <Route path="income" element={<IncomeList />} />
                  <Route path="income/new" element={<IncomeForm />} />
                  <Route path="payments" element={<PaymentList />} />
                  <Route path="payments/new" element={<PaymentForm />} />
                  
                  {/* Inventory */}
                  <Route path="inventory" element={<InventoryList />} />
                  <Route path="inventory/new" element={<InventoryItemForm />} />
                  <Route path="inventory/transaction" element={<InventoryTransactionForm />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />


          {/* -------------------------------------- */}
          {/* CUSTOMER PROTECTED ROUTES              */}
          {/* -------------------------------------- */}
          <Route path="/customer/*" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Layout>
                <Routes>
                  {/* Dashboard acts as the primary hub */}
                  <Route path="dashboard" element={<CustomerDashboard />} />
                  
                  {/* Customer specific data routes */}
                  <Route path="purchases" element={<MyPurchases />} />
                  <Route path="payments" element={<MyPayments />} />
                  <Route path="payments/new" element={<CustomerPaymentForm />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
