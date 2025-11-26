import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';
import { moroccanCities } from '../utils/helpers';

export default function OrderForm({ onSubmit, loading }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sender: { name: '', phone: '', address: '', city: '' },
    recipient: { name: '', phone: '', address: '', city: '' },
    package: { weight: 1, type: 'standard', urgency: 'normal' },
  });

  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const steps = [
    { number: 1, title: 'Expéditeur' },
    { number: 2, title: 'Destinataire' },
    { number: 3, title: 'Colis' },
    { number: 4, title: 'Confirmation' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition ${
                    step >= s.number
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                </div>
                <span className="text-xs mt-2 text-gray-600">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition ${
                    step > s.number ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">Informations Expéditeur</h2>
              <Input
                label="Nom complet"
                value={formData.sender.name}
                onChange={(e) => updateField('sender', 'name', e.target.value)}
                required
              />
              <Input
                label="Téléphone"
                type="tel"
                value={formData.sender.phone}
                onChange={(e) => updateField('sender', 'phone', e.target.value)}
                required
              />
              <Input
                label="Adresse"
                value={formData.sender.address}
                onChange={(e) => updateField('sender', 'address', e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select
                  value={formData.sender.city}
                  onChange={(e) => updateField('sender', 'city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Sélectionner une ville</option>
                  {moroccanCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">Informations Destinataire</h2>
              <Input
                label="Nom complet"
                value={formData.recipient.name}
                onChange={(e) => updateField('recipient', 'name', e.target.value)}
                required
              />
              <Input
                label="Téléphone"
                type="tel"
                value={formData.recipient.phone}
                onChange={(e) => updateField('recipient', 'phone', e.target.value)}
                required
              />
              <Input
                label="Adresse"
                value={formData.recipient.address}
                onChange={(e) => updateField('recipient', 'address', e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select
                  value={formData.recipient.city}
                  onChange={(e) => updateField('recipient', 'city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Sélectionner une ville</option>
                  {moroccanCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">Détails du Colis</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids (kg): {formData.package.weight}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={formData.package.weight}
                  onChange={(e) => updateField('package', 'weight', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de colis
                </label>
                <select
                  value={formData.package.type}
                  onChange={(e) => updateField('package', 'type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="standard">Standard</option>
                  <option value="fragile">Fragile</option>
                  <option value="refrigerated">Réfrigéré</option>
                  <option value="medical">Médical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgence
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['normal', 'high', 'express'].map(urgency => (
                    <button
                      key={urgency}
                      type="button"
                      onClick={() => updateField('package', 'urgency', urgency)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        formData.package.urgency === urgency
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {urgency === 'normal' ? 'Normal' : urgency === 'high' ? 'Urgent' : 'Express'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">Confirmation</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Expéditeur</h3>
                  <p className="text-sm text-gray-600">
                    {formData.sender.name} - {formData.sender.city}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Destinataire</h3>
                  <p className="text-sm text-gray-600">
                    {formData.recipient.name} - {formData.recipient.city}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Colis</h3>
                  <p className="text-sm text-gray-600">
                    {formData.package.weight}kg - {formData.package.type} - {formData.package.urgency}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="ml-auto"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : step === 4 ? (
              'Confirmer'
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
