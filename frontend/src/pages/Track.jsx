import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Search, Loader } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import TrackingCard from '../components/TrackingCard';
import DeliveryInsights from '../components/DeliveryInsights';
import RouteMap from '../components/RouteMap';
import { useOrders } from '../hooks/useOrders';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Track() {
  const { trackingNumber: urlTrackingNumber } = useParams();
  const [trackingNumber, setTrackingNumber] = useState(urlTrackingNumber || '');
  const [order, setOrder] = useState(null);
  const { trackOrder, loading } = useOrders();
  const { orderStatus, connected } = useWebSocket(order?.tracking_number);

  useEffect(() => {
    if (urlTrackingNumber) {
      handleTrack(urlTrackingNumber);
    }
  }, [urlTrackingNumber]);

  useEffect(() => {
    if (orderStatus) {
      setOrder(orderStatus);
    }
  }, [orderStatus]);

  const handleTrack = async (number = trackingNumber) => {
    try {
      const result = await trackOrder(number);
      setOrder(result.order);
    } catch (error) {
      alert('Commande introuvable');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Suivre ma Commande
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Entrez votre numéro de suivi pour voir l'état de votre colis
          </p>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex space-x-2">
              <Input
                placeholder="Ex: CTM1234567890"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
              <Button onClick={() => handleTrack()} disabled={loading || !trackingNumber}>
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
            {connected && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Suivi en temps réel activé
              </div>
            )}
          </div>

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TrackingCard order={order} />
              
              {order.delivery_insights && (
                <div className="mt-6">
                  <DeliveryInsights insights={order.delivery_insights} order={order} />
                </div>
              )}
              
              {order.assigned_agent && (
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Agent Assigné
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-500 font-bold">
                        {order.assigned_agent.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Agent {order.assigned_agent}</p>
                      <p className="text-sm text-gray-500">En charge de votre livraison</p>
                    </div>
                  </div>
                </div>
              )}
              
              {order.sender && order.recipient && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Carte de l'itinéraire</h3>
                  <RouteMap 
                    order={order}
                  />
                </div>
              )}
            </motion.div>
          )}

          {!order && !loading && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Entrez un numéro de suivi pour commencer
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
