import { motion } from 'framer-motion';
import { User, Circle } from 'lucide-react';
import Card from './ui/Card';

export default function AgentStatus({ agents }) {
  const statusColors = {
    active: 'bg-green-500',
    available: 'bg-green-500',
    busy: 'bg-orange-500',
    offline: 'bg-gray-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {agents?.map((agent, index) => (
        <motion.div
          key={agent.agent_id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card hover>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {agent.name}
                  </h3>
                  <Circle
                    className={`h-2 w-2 ${statusColors[agent.status]} rounded-full`}
                    fill="currentColor"
                  />
                </div>
                <p className="text-xs text-gray-500">{agent.role}</p>
                {agent.vehicle_type && (
                  <p className="text-xs text-gray-400 mt-1">
                    Véhicule: {agent.vehicle_type}
                  </p>
                )}
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {agent.current_orders?.length || 0} commandes
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
