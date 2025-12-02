import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import apiClient from '../api/client';
import { statusColors, formatDate, cn } from '../utils/helpers';

export default function MyOrders() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyOrders();
  }, [isAuthenticated, statusFilter]);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await apiClient.get('/orders/my-orders', { params });
      setOrders(data.orders);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.recipient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.recipient?.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReorder = (order) => {
    navigate('/new-order', { state: { reorderData: order } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
            <Button onClick={fetchMyOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card hover>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </Card>
              <Card hover>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-sm text-gray-600">En attente</p>
                </div>
              </Card>
              <Card hover>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.in_transit}</p>
                  <p className="text-sm text-gray-600">En transit</p>
                </div>
              </Card>
              <Card hover>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                  <p className="text-sm text-gray-600">Livrées</p>
                </div>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par numéro de suivi, destinataire, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="assigned">Assigné</option>
                  <option value="routed">Routé</option>
                  <option value="in_transit">En transit</option>
                  <option value="delivered">Livré</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune commande trouvée</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card hover>
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Package className="h-6 w-6 text-primary-500" />
                          <div>
                            <p className="font-mono font-bold text-primary-500">
                              {order.tracking_number}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Destinataire</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.recipient?.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {order.recipient?.city}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Colis</p>
                            <p className="text-sm text-gray-900">
                              {order.package?.weight}kg - {order.package?.type}
                            </p>
                            <p className="text-xs text-gray-600">
                              Urgence: {order.package?.urgency}
                            </p>
                          </div>
                        </div>

                        <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusColors[order.status])}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex flex-col justify-between items-end mt-4 md:mt-0 space-y-2">
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`/track/${order.tracking_number}`)}
                          className="w-full md:w-auto"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Suivre
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleReorder(order)}
                          className="w-full md:w-auto"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Recommander
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
