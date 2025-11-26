import { Link } from 'react-router-dom';
import { Package, Home, PlusCircle, Search, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">CTM Messagerie IA</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition"
            >
              <Home className="h-4 w-4" />
              <span>Accueil</span>
            </Link>
            
            <Link
              to="/new-order"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nouveau Colis</span>
            </Link>
            
            <Link
              to="/track"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition"
            >
              <Search className="h-4 w-4" />
              <span>Suivre</span>
            </Link>
            
            <Link
              to="/dashboard"
              className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
