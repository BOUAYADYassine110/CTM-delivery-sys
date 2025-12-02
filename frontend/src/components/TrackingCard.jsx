import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, Package, Truck } from 'lucide-react';
import Card from './ui/Card';
import { statusColors, formatDate } from '../utils/helpers';
import { cn } from '../utils/helpers';

export default function TrackingCard({ order }) {
  const statusIcons = {
    pending: Clock,
    assigned: Package,
    routed: Truck,
    in_transit: Truck,
    delivered: CheckCircle,
  };

  const StatusIcon = statusIcons[order.status] || Circle;

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Suivi: {order.tracking_number}
            </h3>
            <p className="text-sm text-gray-500">
              Créé le {formatDate(order.created_at)}
            </p>
          </div>
          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', statusColors[order.status])}>
            {order.status}
          </span>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-3">
            {order.status_history?.map((history, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0">
                  {index === order.status_history.length - 1 ? (
                    <StatusIcon className="h-5 w-5 text-primary-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{history.status}</p>
                  <p className="text-xs text-gray-500">{history.message}</p>
                  <p className="text-xs text-gray-400">{formatDate(history.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Expéditeur</p>
            <p className="text-sm font-medium">{order.sender?.name}</p>
            <p className="text-xs text-gray-600">{order.sender?.city}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Destinataire</p>
            <p className="text-sm font-medium">{order.recipient?.name}</p>
            <p className="text-xs text-gray-600">{order.recipient?.city}</p>
          </div>
        </div>
        
        {(order.route_distance_km || order.route_duration_minutes) && (
          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Distance</p>
              <p className="text-sm font-medium">{order.route_distance_km} km</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Durée estimée</p>
              <p className="text-sm font-medium">{order.route_duration_minutes} min</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
