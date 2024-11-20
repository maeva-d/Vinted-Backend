# Vinted-Backend 
## Description
Vinted-Backend est la partie backend Vinted-React, une mini-reproduction de la célèbre application du même non. Ce projet est basé sur Node.js, Express et MongoDB pour gérer les utilisateurs et les offres.

## Fonctionnalités
- Inscription (création de compte) et connexion des utilisateurs
- Publication d'annonces pour vendre un article
- Achat d'articles

## Prérequis
- [Node.js (v16+)](https://nodejs.org/en/download/package-manager)
- [MongoDB (v5+)](https://www.mongodb.com/try/download/community)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Instalation
1. Cloner le repo :
```

git clone https://github.com/maeva-d/Vinted-Backend.git

```

2. Accéder au dossier du projet : ``cd bla bla``

3. Installer les dépendances : ``yarn`` ou ``npm install``

4. Configurez les variables d'environnement (exemple avec un fichier .env) :
```
PORT=3000
MONGODB_URI=<votre-uri-mongodb>
```

5. Lancer l'application en local : ``` npx nodemon ```

## Endpoints de l'API

**Note** : AUCUN mot de passe n'est stocké en base de donnée; ils sont cryptés à l'aide d'un hash + salt.

### Thématique de route : user

#### 1.S'inscrire

- **URL :** ``/user/signup``
- **Method :** ``POST``
- **Description :** Permets de créer un nouvel utilisateur dans la base de donnée (si l'utilisateur ne possède pas déjà un compte). 
- **Request body :**
```
  {
  "username": "john-doe",
  "email": "john.doe@example.com",
  "password": "yourPassword"
  }
```

- **Responses :** 
  - 201 : Le compte a bien été créé
  - 400 : Erreur dans le body (ex: champs manquants, ou non-conformes aux consignes d'inscription)
  - 409 : Validation impossible (ex: email déjà utilisé)

#### 2.Se connecter

- **URL :** ``/user/login``
- **Method :** ``POST``
- **Description :** Permets à l'utilisateur qui possède déjà un compte de se connecter. 
- **Request body :**
```
{
  "email": "john.doe@example.com",
  "password": "yourPassword"
}
```

- **Responses :** 
  - 200 : Connexion réussie
  - 400 : Erreur dans le body (ex: champs manquants, mauvais MDP ou identifiant)

