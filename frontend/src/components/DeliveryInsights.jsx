import { motion } from 'framer-motion';
import { Cloud, Navigation, AlertTriangle, Truck, Clock } from 'lucide-react';
import Card from './ui/Card';

export default function DeliveryInsights({ insights, order }) {
  if (!insights) return null;
  
  // Check if this is an in-city order with coordinates
  const hasCoordinates = order?.sender?.coordinates && order?.recipient?.coordinates;
  const isInCity = order?.delivery_type === 'in_city';
  
  // Use order's saved route data if available, otherwise fall back to insights
  const distance = order?.route_distance_km || insights.route?.distance_km;
  const duration = order?.route_duration_minutes || insights.estimated_delivery_minutes;
  
  console.log('DeliveryInsights data:', { 
    hasCoordinates,
    isInCity,
    order_distance: order?.route_distance_km, 
    order_duration: order?.route_duration_minutes,
    insights_distance: insights.route?.distance_km,
    insights_duration: insights.estimated_delivery_minutes,
    final_distance: distance,
    final_duration: duration
  });

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Informations de Livraison Intelligente
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Route Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-blue-50 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Navigation className="h-5 w-5 text-blue-500" />
            <h4 className="font-semibold text-blue-900">Itinéraire</h4>
          </div>
          <p className="text-sm text-blue-800">
            Distance: <span className="font-bold">{distance > 0 ? `${distance.toFixed(2)} km` : (isInCity && hasCoordinates ? 'Calcul en cours...' : 'Non disponible')}</span>
          </p>
          <p className="text-sm text-blue-800">
            Durée estimée: <span className="font-bold">{duration > 0 ? `${Math.round(duration)} min` : (isInCity && hasCoordinates ? 'Calcul en cours...' : 'Non disponible')}</span>
          </p>
        </motion.div>

        {/* Weather Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-green-50 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Cloud className="h-5 w-5 text-green-500" />
            <h4 className="font-semibold text-green-900">Météo</h4>
          </div>
          <p className="text-sm text-green-800">
            {insights.weather?.temperature}°C - {insights.weather?.description}
          </p>
          <p className="text-sm text-green-800">
            Vent: {insights.weather?.wind_speed} m/s
          </p>
        </motion.div>

        {/* Traffic Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-orange-50 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h4 className="font-semibold text-orange-900">Trafic</h4>
          </div>
          <p className="text-sm text-orange-800">
            État: <span className="font-bold capitalize">{insights.traffic?.status}</span>
          </p>
          <p className="text-sm text-orange-800">
            Facteur de retard: {insights.traffic?.delay_factor}x
          </p>
        </motion.div>

        {/* Vehicle Recommendation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-50 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Truck className="h-5 w-5 text-purple-500" />
            <h4 className="font-semibold text-purple-900">Véhicule</h4>
          </div>
          <p className="text-sm text-purple-800 capitalize">
            Recommandé: <span className="font-bold">{insights.recommended_vehicle}</span>
          </p>
        </motion.div>
      </div>

      {/* Warnings */}
      {insights.warnings && insights.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Avertissements</h4>
              <ul className="space-y-1">
                {insights.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
