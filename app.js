const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connexion MongoDB
mongoose.connect('mongodb://mongo:27017/nosql_demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schéma utilisateur
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Initialisation des données de test
async function initData() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create([
        { username: 'admin', email: 'admin@demo.com', password: hashedPassword, role: 'admin' },
        { username: 'user1', email: 'user1@demo.com', password: await bcrypt.hash('password123', 10), role: 'user' },
        { username: 'user2', email: 'user2@demo.com', password: await bcrypt.hash('secret456', 10), role: 'user' }
      ]);
      console.log('Données de test créées');
    }
  } catch (err) {
    console.error('Erreur lors de l\'initialisation:', err);
  }
}

// Page d'accueil
app.get('/', (req, res) => {
  res.render('index');
});

// =================== ENDPOINTS VULNÉRABLES ===================

// LOGIN VULNÉRABLE - Injection NoSQL
app.post('/login-vulnerable', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // VULNÉRABILITÉ: Utilisation directe des données utilisateur dans la requête
    const user = await User.findOne({ 
      username: username,  // Peut être manipulé avec des objets
      password: password   // Bypass possible avec $ne, $gt, etc.
    });
    
    if (user) {
      res.json({ 
        success: true, 
        message: 'Connexion réussie!', 
        user: { username: user.username, role: user.role } 
      });
    } else {
      res.json({ success: false, message: 'Identifiants incorrects' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RECHERCHE VULNÉRABLE - Injection NoSQL
app.post('/search-vulnerable', async (req, res) => {
  try {
    const { query } = req.body;
    
    // VULNÉRABILITÉ: Utilisation directe du query sans validation
    const users = await User.find(query); // Peut exécuter n'importe quelle requête MongoDB
    
    res.json({ users: users.map(u => ({ username: u.username, email: u.email })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== ENDPOINTS SÉCURISÉS ===================

// LOGIN SÉCURISÉ
app.post('/login-secure', async (req, res) => {
  try {
    let { username, password } = req.body;
    
    // SÉCURITÉ: Validation des types et nettoyage
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.json({ success: false, message: 'Format invalide' });
    }
    
    // Nettoyage des caractères spéciaux MongoDB
    username = username.replace(/[$.]/g, '');
    
    const user = await User.findOne({ username: username });
    
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ 
        success: true, 
        message: 'Connexion sécurisée réussie!', 
        user: { username: user.username, role: user.role } 
      });
    } else {
      res.json({ success: false, message: 'Identifiants incorrects' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RECHERCHE SÉCURISÉE
app.post('/search-secure', async (req, res) => {
  try {
    let { searchTerm } = req.body;
    
    // SÉCURITÉ: Validation et limitation des requêtes
    if (typeof searchTerm !== 'string') {
      return res.json({ error: 'Le terme de recherche doit être une chaîne' });
    }
    
    // Recherche sécurisée avec regex
    const users = await User.find({
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    }).select('username email'); // Sélection explicite des champs
    
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Page d'exploitation
app.get('/exploit', (req, res) => {
  res.render('exploit');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  initData();
});
