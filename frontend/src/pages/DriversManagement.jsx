import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Bike, Package, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import apiClient from '../api/client';

export default function DriversManagement() {
  const { isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin() && !isEmployee()) {
      navigate('/');
      return;
    }
    fetchDrivers();
  }, [filter]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const data = await apiClient.get('/drivers', { params });
      setDrivers(data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDriverIcon = (type) => {
    switch (type) {
      case 'pickup':
        return <Bike className="h-5 w-5" />;

      case 'inter_city':
        return <Truck className="h-5 w-5" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'on_route':
        return 'bg-blue-100 text-blue-800';
      case 'break':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    on_route: drivers.filter(d => d.status === 'on_route').length,
    pickup: drivers.filter(d => d.driver_type === 'pickup').length,
    inter_city: drivers.filter(d => d.driver_type === 'inter_city').length,
  };

  return (
    <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion des Chauffeurs</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                <p className="text-sm text-gray-600">Disponibles</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.on_route}</p>
                <p className="text-sm text-gray-600">En route</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.pickup}</p>
                <p className="text-sm text-gray-600">Ramassage</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.inter_city}</p>
                <p className="text-sm text-gray-600">Inter-ville</p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex space-x-2">
            {['all', 'pickup', 'inter_city'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type === 'all' ? 'Tous' : type === 'pickup' ? 'Ramassage' : 'Inter-ville'}
              </button>
            ))}
          </div>

          {/* Drivers Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((driver) => (
                <Card key={driver.driver_id} hover>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                        {getDriverIcon(driver.driver_type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {driver.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                          {driver.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{driver.phone}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{driver.city}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {driver.vehicle.type} - {driver.vehicle.plate}
                        </span>
                        <span className="text-gray-500">
                          {driver.assigned_orders?.length || 0} commandes
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
    </div>
  );
}
