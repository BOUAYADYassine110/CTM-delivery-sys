import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, MapPin, Shield, Clock, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Truck,
      title: 'Livraison Rapide',
      description: 'Livraison express dans toutes les villes du Maroc',
    },
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Vos colis sont assurés et suivis en temps réel',
    },
    {
      icon: MapPin,
      title: 'Suivi en Direct',
      description: 'Suivez votre colis en temps réel avec notre système IA',
    },
  ];

  const stats = [
    { label: 'Livraisons', value: '10,000+' },
    { label: 'Villes Couvertes', value: '10+' },
    { label: 'Satisfaction', value: '98%' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">
              CTM Messagerie IA
            </h1>
            <p className="text-xl mb-8 text-primary-50 max-w-2xl mx-auto">
              Système de livraison intelligent propulsé par l'IA pour une gestion optimale de vos colis au Maroc
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => navigate('/new-order')}
                className="bg-white text-primary-500 hover:bg-gray-100"
              >
                <Package className="h-5 w-5 mr-2 inline" />
                Envoyer un Colis
              </Button>
              <Button
                onClick={() => navigate('/track')}
                variant="secondary"
                className="bg-primary-700 text-white hover:bg-primary-800 border-2 border-white"
              >
                Suivre ma Commande
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir CTM Messagerie IA?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Notre système multi-agents optimise chaque étape de la livraison
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card hover className="text-center h-full">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <feature.icon className="h-8 w-8 text-primary-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Prêt à Envoyer Votre Colis?
            </h2>
            <p className="text-primary-50 mb-8 max-w-2xl mx-auto">
              Commencez dès maintenant et profitez de notre service de livraison intelligent
            </p>
            <Button
              onClick={() => navigate('/new-order')}
              className="bg-white text-primary-500 hover:bg-gray-100"
            >
              Créer une Commande
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
