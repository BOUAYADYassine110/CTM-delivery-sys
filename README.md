# CTM Messagerie IA

Système de gestion de livraison intelligent utilisant une architecture multi-agents avec CrewAI, Flask, MongoDB et React.js.

## 🎯 Fonctionnalités

- **Architecture Multi-Agents**: 3 agents IA collaborent pour optimiser les livraisons
  - Order Agent: Traitement et validation des commandes
  - Warehouse Agent: Gestion des colis et préparation
  - Route Optimizer Agent: Optimisation des itinéraires de livraison

- **Interface Moderne**: Dashboard React avec animations fluides (Framer Motion)
- **Suivi en Temps Réel**: WebSocket pour les mises à jour instantanées
- **API REST**: Backend Flask avec endpoints complets
- **Base de Données**: MongoDB pour le stockage des données

## 🛠️ Stack Technique

### Backend
- Python 3.10+
- Flask (API REST)
- Flask-SocketIO (WebSocket)
- CrewAI (Multi-agents)
- MongoDB (Base de données)
- OR-Tools (Optimisation de routes)

### Frontend
- React 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Socket.IO Client (WebSocket)
- React Router (Navigation)
- Axios (HTTP client)

## 📦 Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- MongoDB 6.0+

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd CTM-delivery-sys
```

### 2. Configuration Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
# Copier .env.example vers .env et modifier les valeurs
```

### 3. Configuration Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Les variables d'environnement sont déjà configurées dans .env
```

### 4. Démarrer MongoDB

```bash
# Windows (si installé comme service):
net start MongoDB

# macOS/Linux:
mongod --dbpath=/path/to/data
```

## 🚀 Démarrage

### Démarrer le Backend
```bash
cd backend
python app.py
```
Le serveur démarre sur `http://localhost:5000`

### Démarrer le Frontend
```bash
cd frontend
npm run dev
```
L'application démarre sur `http://localhost:5173`

## 📱 Utilisation

### 1. Créer une Commande
- Accéder à "Nouveau Colis" dans la navigation
- Remplir le formulaire multi-étapes:
  - Informations expéditeur
  - Informations destinataire
  - Détails du colis
  - Confirmation
- Récupérer le numéro de suivi

### 2. Suivre une Commande
- Accéder à "Suivre" dans la navigation
- Entrer le numéro de suivi
- Voir l'état en temps réel avec historique complet

### 3. Dashboard Admin
- Accéder au "Dashboard"
- Voir les statistiques globales
- Consulter l'état des agents
- Liste des commandes récentes

## 🧪 Tests

### Test Flow Automatique
```bash
cd tests
python test_flow.py
```

Ce script:
- Charge 5 commandes de test
- Crée les commandes via l'API
- Vérifie l'état des agents
- Suit toutes les commandes créées

## 📁 Structure du Projet

```
CTM-delivery-sys/
├── backend/
│   ├── app.py                 # Application Flask principale
│   ├── config.py              # Configuration
│   ├── routes/                # Endpoints API
│   │   ├── orders.py
│   │   ├── agents.py
│   │   └── tracking.py
│   ├── models/                # Modèles de données
│   │   ├── order.py
│   │   └── agent.py
│   ├── utils/                 # Utilitaires
│   │   ├── db.py
│   │   └── websocket.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # Composants React
│   │   ├── pages/             # Pages
│   │   ├── hooks/             # Custom hooks
│   │   ├── api/               # Client API
│   │   └── utils/             # Utilitaires
│   ├── package.json
│   └── vite.config.js
├── agents/
│   ├── crew_setup.py          # Orchestration CrewAI
│   ├── order_agent.py
│   ├── warehouse_agent.py
│   └── route_optimizer.py
├── data/
│   └── test_orders.json       # Données de test
└── tests/
    └── test_flow.py           # Tests automatisés
```

## 🎨 Design System

### Couleurs
- Primary: `#0066cc` (Bleu CTM)
- Success: `#10b981` (Vert)
- Warning: `#f59e0b` (Orange)
- Danger: `#ef4444` (Rouge)

### Typographie
- Font: Inter
- Headings: 700 weight
- Body: 400 weight

## 🔌 API Endpoints

### Orders
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Liste des commandes
- `GET /api/orders/<id>` - Détails d'une commande
- `PUT /api/orders/<id>` - Mettre à jour une commande
- `DELETE /api/orders/<id>` - Supprimer une commande

### Agents
- `GET /api/agents/status` - État de tous les agents
- `GET /api/agents/<id>` - Détails d'un agent

### Tracking
- `GET /api/tracking/<tracking_number>` - Suivre une commande

### WebSocket Events
- `subscribe_order` - S'abonner aux mises à jour
- `unsubscribe_order` - Se désabonner
- `order_update` - Recevoir les mises à jour

## 🌍 Villes Couvertes

- Casablanca
- Rabat
- Marrakech
- Fès
- Tanger
- Agadir
- Meknès
- Oujda
- Kenitra
- Tétouan

## 📝 TODO / Améliorations Futures

- [ ] Intégration de cartes interactives (Leaflet/Mapbox)
- [ ] Notifications push
- [ ] Authentification utilisateur
- [ ] Export de rapports PDF
- [ ] Application mobile
- [ ] Intégration paiement en ligne
- [ ] Système de notation
- [ ] Chat support client

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou un pull request.

## 📄 Licence

MIT License

## 👥 Auteur

Développé avec ❤️ pour CTM Messagerie

---

**Note**: Ce projet est un MVP (Minimum Viable Product) pour démonstration. Pour une utilisation en production, des améliorations de sécurité et de performance sont nécessaires.
