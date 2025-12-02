import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import apiClient from '../api/client';

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'employee',
    department: 'operations'
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get('/admin/users');
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.role === 'employee') {
        await apiClient.post('/admin/employees', formData);
      } else {
        await apiClient.post('/admin/users', formData);
      }
      
      alert('Utilisateur créé avec succès!');
      setShowCreateForm(false);
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'employee',
        department: 'operations'
      });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiClient.put(`/admin/users/${userId}`, {
        is_active: !currentStatus
      });
      fetchUsers();
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    employee: 'bg-blue-100 text-blue-800',
    client: 'bg-green-100 text-green-800',
    enterprise: 'bg-purple-100 text-purple-800'
  };

  const roleIcons = {
    admin: Shield,
    employee: Users,
    client: Users,
    enterprise: Briefcase
  };

  return (
    <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <UserPlus className="h-5 w-5 mr-2" />
              Créer Utilisateur
            </Button>
          </div>

          {showCreateForm && (
            <Card className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Nouveau Utilisateur</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nom complet"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Téléphone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <Input
                    label="Mot de passe"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="employee">Employé</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  {formData.role === 'employee' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Département
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="operations">Opérations</option>
                        <option value="customer_service">Service Client</option>
                        <option value="warehouse">Entrepôt</option>
                        <option value="delivery">Livraison</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    Créer
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                      Utilisateur
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                      Rôle
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const RoleIcon = roleIcons[u.role];
                    return (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <RoleIcon className="h-5 w-5 text-primary-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{u.profile.name}</p>
                              <p className="text-xs text-gray-500">{u.profile.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleUserStatus(u.id, u.is_active)}
                            className="text-sm text-primary-500 hover:text-primary-600"
                          >
                            {u.is_active ? 'Désactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
    </div>
  );
}
