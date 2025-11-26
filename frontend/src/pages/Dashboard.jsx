import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, Users, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import AgentStatus from '../components/AgentStatus';
import { useOrders } from '../hooks/useOrders';
import apiClient from '../api/client';
import { statusColors, formatDate } from '../utils/helpers';
import { cn } from '../utils/helpers';

export default function Dashboard() {
  const { orders, loading } = useOrders();
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await apiClient.get('/agents/status');
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const stats = [
    {
      label: 'Total Commandes',
      value: orders.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'En Livraison',
      value: orders.filter(o => o.status === 'in_transit').length,
      icon: Truck,
      color: 'bg-green-500',
    },
    {
      label: 'Agents Actifs',
      value: agents.filter(a => a.status === 'active').length,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Taux de Succès',
      value: '98%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Agents Status */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">État des Agents</h2>
            <AgentStatus agents={agents} />
          </div>

          {/* Recent Orders */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Commandes Récentes</h2>
            <Card>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune commande pour le moment
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Numéro de Suivi
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Expéditeur
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Destinataire
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Statut
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-mono text-primary-500">
                            {order.tracking_number}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {order.sender?.name}
                            <br />
                            <span className="text-xs text-gray-500">{order.sender?.city}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {order.recipient?.name}
                            <br />
                            <span className="text-xs text-gray-500">{order.recipient?.city}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[order.status])}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
