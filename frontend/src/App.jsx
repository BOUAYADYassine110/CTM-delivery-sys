import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NewOrder from './pages/NewOrder';
import Track from './pages/Track';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import MyOrders from './pages/MyOrders';
import DriversManagement from './pages/DriversManagement';
import RouteTest from './pages/RouteTest';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes with Navbar */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/login" element={<><Navbar /><Login /></>} />
            <Route path="/register" element={<><Navbar /><Register /></>} />
            <Route path="/new-order" element={<><Navbar /><NewOrder /></>} />
            <Route path="/track" element={<><Navbar /><Track /></>} />
            <Route path="/track/:trackingNumber" element={<><Navbar /><Track /></>} />
            <Route path="/my-orders" element={<><Navbar /><MyOrders /></>} />
            
            {/* Admin routes with Sidebar */}
            <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
            <Route path="/orders" element={<AdminLayout><Dashboard /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><AdminPanel /></AdminLayout>} />
            <Route path="/drivers" element={<AdminLayout><DriversManagement /></AdminLayout>} />
            <Route path="/route-test" element={<AdminLayout><RouteTest /></AdminLayout>} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
