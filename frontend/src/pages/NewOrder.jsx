import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Copy } from 'lucide-react';
import OrderForm from '../components/OrderForm';
import Button from '../components/ui/Button';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import { AnimatePresence } from 'framer-motion';

export default function NewOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createOrder, loading } = useOrders();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { toasts, showToast, hideToast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reorderData, setReorderData] = useState(null);

  useEffect(() => {
    console.log('Auth check:', { isAuthenticated, user, authLoading });
    
    // Wait for auth to load
    if (authLoading) return;
    
    if (!isAuthenticated) {
      showToast('Vous devez vous connecter pour créer une commande', 'warning');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    
    if (location.state?.reorderData) {
      const order = location.state.reorderData;
      setReorderData({
        sender: order.sender,
        recipient: order.recipient,
        package: order.package
      });
    }
  }, [location, isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (formData) => {
    try {
      const result = await createOrder(formData);
      setTrackingNumber(result.tracking_number);
      setShowSuccess(true);
    } catch (error) {
      showToast(error.response?.data?.error || 'Erreur lors de la création de la commande', 'error');
    }
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingNumber);
    showToast('Numéro de suivi copié!', 'success');
  };

  if (authLoading) {
    return (
      <>
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => hideToast(toast.id)}
            />
          ))}
        </AnimatePresence>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </>
    );
  }
  
  if (showSuccess) {
    return (
      <>
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => hideToast(toast.id)}
            />
          ))}
        </AnimatePresence>
        <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Commande Créée avec Succès!
            </h2>
            <p className="text-gray-600 mb-6">
              Votre colis a été enregistré et sera traité par nos agents IA
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">Numéro de suivi</p>
              <div className="flex items-center justify-center space-x-2">
                <code className="text-xl font-mono font-bold text-primary-500">
                  {trackingNumber}
                </code>
                <button
                  onClick={copyTrackingNumber}
                  className="p-2 hover:bg-gray-200 rounded transition"
                >
                  <Copy className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate(`/track/${trackingNumber}`)}>
                Suivre ma Commande
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSuccess(false);
                  setTrackingNumber(null);
                }}
              >
                Nouvelle Commande
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </AnimatePresence>
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Nouvelle Commande
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Remplissez les informations pour créer votre commande
          </p>
          <div className="bg-white rounded-lg shadow-sm p-8">
            {reorderData && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                ℹ️ Vous recommandez une commande précédente. Les informations ont été pré-remplies.
              </div>
            )}
            <OrderForm onSubmit={handleSubmit} loading={loading} initialData={reorderData} />
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
