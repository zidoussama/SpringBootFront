# GestionDeRetoure API - All Endpoints

## Base URL
```
http://localhost:9000/api
```

The routes below are written relative to this base URL.

---

## 1. AUTHENTICATION ENDPOINTS (`/auth`)

### 1.1 Register User
- **Method**: POST
- **URL**: `/auth/register`
- **Description**: Create a new user account
- **Request Body**:
```json
{
  "nom": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "USER"
}
```
- **Response**: AuthResponse with JWT token

Note: the current React forms send `nom`, `email`, `password`, and `role` when creating a user.

### 1.2 Login
- **Method**: POST
- **URL**: `/auth/login`
- **Description**: Login and get JWT token
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: AuthResponse with JWT token

---

## 2. PRODUCTS ENDPOINTS (`/produits`)

### 2.1 Get All Products
- **Method**: GET
- **URL**: `/produits/getall`
- **Auth Required**: Yes
- **Description**: Retrieve all products
- **Response**: List of ProduitDto

### 2.2 Get Product By ID
- **Method**: GET
- **URL**: `/produits/get/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Product ID
- **Description**: Get a specific product by ID
- **Response**: Single ProduitDto

### 2.3 Create Product
- **Method**: POST
- **URL**: `/produits/add`
- **Auth Required**: Yes
- **Description**: Create a new product
- **Request Body**:
```json
{
  "nom": "Laptop",
  "description": "High-performance laptop",
  "prix": 999.99,
  "quantite": 50,
  "reference": "PROD001"
}
```
- **Response**: "Produit créé avec succès"

### 2.4 Update Product
- **Method**: PUT
- **URL**: `/produits/update/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Product ID
- **Description**: Update an existing product
- **Request Body**:
```json
{
  "nom": "Updated Laptop",
  "description": "Updated description",
  "prix": 1099.99,
  "quantite": 45,
  "reference": "PROD001"
}
```
- **Response**: Update response

### 2.5 Delete Product
- **Method**: DELETE
- **URL**: `/produits/delete/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Product ID
- **Description**: Delete a product
- **Response**: "Produit supprimé avec succès"

---

## 3. PRODUCT RETURNS ENDPOINTS (`/retours`)

### 3.1 Get All Returns
- **Method**: GET
- **URL**: `/retours/getall`
- **Auth Required**: Yes
- **Description**: Retrieve all product returns
- **Response**: List of RetourProduitDto

### 3.2 Get Return By ID
- **Method**: GET
- **URL**: `/retours/get/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Return ID
- **Description**: Get a specific return by ID
- **Response**: Single RetourProduitDto

### 3.3 Create Return
- **Method**: POST
- **URL**: `/retours/add`
- **Auth Required**: Yes
- **Description**: Create a new product return
- **Request Body**:
```json
{
  "produitId": 1,
  "utilisateurId": 1,
  "raison": "Product defect",
  "etatTraitement": "EN_COURS",
  "date": "2024-05-15T10:30:00"
}
```
- **Response**: "RetourProduit créé avec succès"

Note: the current React client sends `utilisateurId` and `date` when creating a return. Keep the backend aliases (`clientId`, `dateRetour`) only if your controller still accepts them.

### 3.4 Update Return
- **Method**: PUT
- **URL**: `/retours/update/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Return ID
- **Description**: Update an existing return
- **Request Body**:
```json
{
  "produitId": 1,
  "clientId": 1,
  "quantite": 2,
  "raison": "Updated reason",
  "dateRetour": "2024-05-15",
  "etatTraitement": "TRAITE"
}
```
- **Response**: "RetourProduit mis à jour avec succès"

### 3.5 Delete Return
- **Method**: DELETE
- **URL**: `/retours/delete/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Return ID
- **Description**: Delete a return
- **Response**: "RetourProduit supprimé avec succès"

### 3.6 Get Returns By State
- **Method**: GET
- **URL**: `/retours/getbyetat/{etat}`
- **Auth Required**: Yes
- **Parameters**: `etat` (EtatTraitement) - Treatment state (EN_ATTENTE, TRAITE, REJECT)
- **Description**: Get returns filtered by treatment state
- **Response**: List of RetourProduitDto

### 3.7 Get Returns By Client
- **Method**: GET
- **URL**: `/retours/getbyclient/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Client ID
- **Description**: Get all returns for a specific client
- **Response**: List of RetourProduitDto

### 3.8 Get Returns By Product
- **Method**: GET
- **URL**: `/retours/getbyproduit/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Product ID
- **Description**: Get all returns for a specific product
- **Response**: List of RetourProduitDto

### 3.9 Get Returns By Date
- **Method**: GET
- **URL**: `/retours/getbydate/{date}`
- **Auth Required**: Yes
- **Parameters**: `date` (String) - Date in format YYYY-MM-DD
- **Description**: Get returns for a specific date
- **Response**: List of RetourProduitDto

### 3.10 Count Returns By State
- **Method**: GET
- **URL**: `/retours/countbyetat/{etat}`
- **Auth Required**: Yes
- **Parameters**: `etat` (EtatTraitement) - Treatment state
- **Description**: Count returns by treatment state
- **Response**: Count value

### 3.11 Count All Returns
- **Method**: GET
- **URL**: `/retours/count`
- **Auth Required**: Yes
- **Description**: Get total count of all returns
- **Response**: Count value

---

## 4. NON-CONFORMITIES ENDPOINTS (`/NonConformite`)

### 4.1 Get All Non-Conformities
- **Method**: GET
- **URL**: `/NonConformite/getall`
- **Auth Required**: Yes
- **Description**: Retrieve all non-conformities
- **Response**: List of NonConformiteDto

### 4.2 Get Non-Conformity By ID
- **Method**: GET
- **URL**: `/NonConformite/get/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Non-conformity ID
- **Description**: Get a specific non-conformity by ID
- **Response**: Single NonConformiteDto

### 4.3 Create Non-Conformity
- **Method**: POST
- **URL**: `/NonConformite/add`
- **Auth Required**: Yes
- **Description**: Create a new non-conformity
- **Request Body**:
```json
{
  "description": "Product has scratches",
  "gravite": "MAJEURE",
  "retourProduitId": 1,
  "dateConstatation": "2024-05-15"
}
```
- **Response**: "NonConformite créé avec succès"

### 4.4 Update Non-Conformity
- **Method**: PUT
- **URL**: `/NonConformite/update/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Non-conformity ID
- **Description**: Update an existing non-conformity
- **Request Body**:
```json
{
  "description": "Updated description",
  "gravite": "CRITIQUE",
  "retourProduitId": 1,
  "dateConstatation": "2024-05-15"
}
```
- **Response**: "NonConformite mis à jour avec succès"

### 4.5 Delete Non-Conformity
- **Method**: DELETE
- **URL**: `/NonConformite/delete/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - Non-conformity ID
- **Description**: Delete a non-conformity
- **Response**: "NonConformite supprimé avec succès"

### 4.6 Get Non-Conformities By Severity
- **Method**: GET
- **URL**: `/NonConformite/findByGravity/{gravity}`
- **Auth Required**: Yes
- **Parameters**: `gravity` (Gravite) - Severity level (MINEURE, MAJEURE, CRITIQUE)
- **Description**: Get non-conformities filtered by severity
- **Response**: List of NonConformiteDto

### 4.7 Get Non-Conformities By Date
- **Method**: GET
- **URL**: `/NonConformite/findByDate/{date}`
- **Auth Required**: Yes
- **Parameters**: `date` (LocalDate) - Date in format YYYY-MM-DD
- **Description**: Get non-conformities for a specific date
- **Response**: List of NonConformiteDto

### 4.8 Get Non-Conformities By Return
- **Method**: GET
- **URL**: `/NonConformite/findByRetour/{retourProduitId}`
- **Auth Required**: Yes
- **Parameters**: `retourProduitId` (Long) - Return ID
- **Description**: Get non-conformities for a specific return
- **Response**: List of NonConformiteDto

---

## 5. USERS ENDPOINTS (`/users`)

### 5.1 Get All Users
- **Method**: GET
- **URL**: `/users/getall`
- **Auth Required**: Yes
- **Description**: Retrieve all users
- **Response**: List of Utilisateur

### 5.2 Update User
- **Method**: PUT
- **URL**: `/users/update/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - User ID
- **Description**: Update user information
- **Request Body**:
```json
{
  "email": "newemail@example.com",
  "password": "newpassword123",
  "prenom": "Jane",
  "nom": "Smith",
  "role": "ADMIN"
}
```
- **Response**: "User updated successfully"

### 5.3 Delete User
- **Method**: DELETE
- **URL**: `/users/delete/{id}`
- **Auth Required**: Yes
- **Parameters**: `id` (Long) - User ID
- **Description**: Delete a user
- **Response**: "User deleted successfully"

---

## SUMMARY

| Controller | Total Endpoints |
|-----------|-----------------|
| Authentication | 2 |
| Products | 5 |
| Product Returns | 11 |
| Non-Conformities | 8 |
| Users | 3 |
| **TOTAL** | **29** |

---

## NOTES

1. **Authentication**: All endpoints except `/auth/register` and `/auth/login` require JWT token in the Authorization header
2. **Date Format**: Use YYYY-MM-DD format for date parameters
3. **Base URL**: from the `.env` file (`VITE_API_URL=http://localhost:9000/api` in the current frontend)
4. **Content-Type**: All POST/PUT requests require `Content-Type: application/json`
5. **Authorization Header Format**: `Authorization: Bearer {jwt_token}`

---

## FRONTEND COVERAGE CHECK

The current React app uses these API routes:

- `/auth/login`
- `/auth/register`
- `/produits/getall`
- `/produits/add`
- `/produits/update/{id}`
- `/produits/delete/{id}`
- `/retours/add`
- `/retours/getbyclient/{id}`
- `/users/getall`
- `/users/update/{id}`
- `/users/delete/{id}`

No additional endpoint was found missing from the current frontend scan.

---