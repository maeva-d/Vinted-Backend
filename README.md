# Vinted-Backend

## Description

Vinted-Backend est la partie backend Vinted-React, une mini-reproduction de la célèbre application du même non. Ce projet est basé sur Node.js, Express et MongoDB pour gérer les utilisateurs et les offres.

## Fonctionnalités

- Inscription (création de compte) et connexion des utilisateurs
- Publication d'annonces pour vendre un article
- Recherche d'articles
- Achat d'articles
- Déconnexion

## Prérequis

- [Node.js (v16+)](https://nodejs.org/en/download/package-manager)
- [MongoDB (v5+)](https://www.mongodb.com/try/download/community)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Instalation

1. Cloner le repo :

```

git clone https://github.com/maeva-d/Vinted-Backend.git

```

2. Accéder au dossier du projet : `cd BACK-END-VINTED`

3. Installer les dépendances : `yarn` ou `npm install`

4. Configurez les variables d'environnement (exemple avec un fichier .env) :

```
PORT=3000
MONGODB_URI=<votre-uri-mongodb>
CLOUDINARY_NAME=<votre-nom-cloudinary>
CLOUDINARY_API_KEY=<votre-api-key-cloudinary>
CLOUDINARY_API_SECRET=<votre-api-secret-cloudinary>
STRIPE_SECRET_KEY=<votre-clé-secrète-stripe>
```

5. Lancer l'application en local : `npx nodemon`

## Endpoints de l'API

**Note** : _AUCUN mot de passe n'est stocké en base de données; ils sont cryptés à l'aide d'un hash + salt._

### Thématique de route : user

#### 1.S'inscrire

- **URL :** `/user/signup`
- **Method :** `POST`
- **Description :** Permets de créer un nouvel utilisateur dans la base de donnée (si l'utilisateur ne possède pas déjà un compte).
- **Request body (raw) :**

```
  {
  "username": "john-doe",
  "email": "john.doe@example.com",
  "password": "yourPassword"
  }
```

- **Responses :**
  - 201 : Le compte a bien été créé
  - 403 : Accès intedit (ex: champs manquants ou non-conformes aux consignes d'inscription, email ou pseudo déjà existant)

#### 2.Se connecter

- **URL :** `/user/login`
- **Method :** `POST`
- **Description :** Permets à l'utilisateur qui possède déjà un compte de se connecter.
- **Request body (raw):**

```
{
  "email": "john.doe@example.com",
  "password": "yourPassword"
}
```

- **Responses :**
  - 200 : Connexion réussie
  - 403 : Accès interdit (ex: champs manquants, mauvais MDP ou identifiant)

### Thématique de route : offers

#### 1.1.Obtenir toutes les offres

- **URL :** `/offers`
- **Method :** `GET`
- **Description :** L'utilisateur a accès à toutes les offres dans la BDD.
- **Queries :**

  - `page` (pour aller de page en page, avec `1` comme valeur par défaut)
  - `limit` (la limite d'offres affichées par page, avec `20` comme valeur par défaut).

- **Responses :**
  - 200 : Requête réussie

#### 1.2.Obtenir certaines offres précises

- **URL :** `/offers`
- **Method :** `GET`
- **Description :** L'utilisateur recherche des offres dans la BDD à l'aide de filtres passés dans les queries.
- **Queries :**

  - `title` (ex: pantalon, balenciaga, petite robe noire)
  - `priceMin` (offres avec un prix supérieur on égal au prix renseigné par l'utilisateur)
  - `priceMax` (offres avec un prix inférieur ou égal au prix renseigné par l'utilisateur)
  - `price-asc` (offres triées par prix croissants)
  - `price-desc` (offres triées par prix décroissants)

- **Responses :**
  - 200 : Requête réussie

#### 2.Obtenir les informations d'une annonce en particulier

- **URL :** `/offers/:id`
- **Method :** `GET`
- **Description :** Récupère les informations de l'annonce consultée. L'utilisateur peut aussi choisir d'acheter ou non l'article.
- **Responses :**
  - 200 : Requête réussie

#### 3.Publier une annonce

- **URL :** `/offers/publish`
- **Method :** `POST`
- **Description :** Permets à l'utilisateur déjà connecté de poster une annonce.
- **Authorization :** Bearer token dans les headers.

  ```

  Authorization : bearer <token>

  ```

- **Request body (form-data):**

```
{
  "pictures" : <file> // obligatoire
  "title" : "petite robe noire", // obligatoire
  "description" : "je vends cette petite robe noire", // obligatoire
  "price" : "555", // obligatoire
  "brand" : "Chanel",
  "size" : "36",
  "condition" : "comme neuf",
  "color" : "noire",
  "city" : "Paris",
}
```

- **Responses :**
  - 201 : L'annonce a bien été créée
  - 400 : Erreur dans le body (ex: champs manquants, ou non-conformes aux consignes)
  - 401 : Non autorisé (si le bearer token est absent ou invalide)
