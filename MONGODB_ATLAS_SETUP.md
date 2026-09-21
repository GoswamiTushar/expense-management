# MongoDB Atlas Free Tier (M0) Setup Guide for Airbnb Expense Management App

This guide explains how to set up your **MongoDB Atlas Free Tier (M0 Sandbox)** cluster and enable direct HTTPS API calls with JWT / API key authentication directly from the mobile app without requiring a custom backend server.

---

## 1. Create Your Free MongoDB Atlas Cluster (M0)

1. Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Click **Create** or **Build a Database**:
   - Choose **M0 Free** (Shared, $0/month forever).
   - Select a Cloud Provider & Region near you (e.g., **AWS / Mumbai `ap-south-1`**).
   - Name your cluster (e.g., `AirbnbCluster`).
   - Click **Create Deployment**.
3. In **Security Quickstart**:
   - Set up a Database User with username and secure password.
   - In **IP Access List**, add `0.0.0.0/0` (Allow Access from Anywhere) since mobile and web clients will connect from different networks and cell towers.

---

## 2. Database & Collections Setup

1. In MongoDB Atlas, click **Browse Collections**.
2. Click **+ Create Database**:
   - **Database name:** `airbnb_expenses`
   - **Collection name:** `properties`
3. Create the additional collections by clicking the **+** button next to `airbnb_expenses`:
   - `expenses`
   - `settlements`
   - `users`

### Sample Schema Overview

#### `properties`
```json
{
  "_id": "prop_vrindavan_01",
  "name": "Vrindavan Villa",
  "location": "Vrindavan, Uttar Pradesh",
  "description": "Airbnb 3BHK Homestay near Prem Mandir",
  "currency": "INR",
  "managers": ["user_1", "user_2", "user_3"],
  "createdBy": "user_1",
  "createdAt": "2026-09-21T00:00:00.000Z"
}
```

#### `expenses`
```json
{
  "_id": "exp_sample_1",
  "propertyId": "prop_vrindavan_01",
  "title": "Monthly Property Rent",
  "amount": 22000,
  "category": "Rent",
  "paidBy": "user_1",
  "splitAmong": ["user_1", "user_2", "user_3"],
  "sharePerPerson": 7333.33,
  "date": "2026-09-21T00:00:00.000Z",
  "notes": "Paid via NetBanking",
  "receiptUrl": "",
  "createdAt": "2026-09-21T00:00:00.000Z"
}
```

#### `settlements`
```json
{
  "_id": "settle_sample_1",
  "propertyId": "prop_vrindavan_01",
  "settledBy": "user_2",
  "paidTo": "user_1",
  "amount": 7333.33,
  "settledAt": "2026-09-21T12:00:00.000Z",
  "notes": "UPI payment reference 891238912",
  "status": "completed"
}
```

#### `users`
```json
{
  "_id": "user_1",
  "name": "Tushar Goswami",
  "email": "tushar@example.com",
  "role": "manager",
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxx]"
}
```

---

## 3. Direct HTTPS API Access (No Custom Backend)

Because client-side mobile apps and browsers cannot open raw TCP sockets (`mongodb://`), MongoDB Atlas provides two native solutions that run directly on Atlas for free:

### Option A: Atlas App Services HTTPS Endpoints (Recommended for Free Tier)
1. In the Atlas top navigation, click **App Services**.
2. Click **Create a New App**:
   - Link your Free M0 `AirbnbCluster`.
   - Name your application (e.g. `airbnb-expense-api`).
3. Under **Authentication** -> **Providers**:
   - Enable **Custom JWT Authentication** or **API Key Authentication**.
4. In the left menu, click **HTTPS Endpoints** -> **Add an Endpoint**:
   - Route: `/data`
   - HTTP Method: `POST`
   - Function: Atlas provides a built-in JavaScript function to perform collection operations (`find`, `insertOne`, `updateOne`).
5. Click **Review & Deploy**.
6. Copy your **App Services URL Endpoint**.

### Option B: Atlas Data API
If the Data API tab is available in your Atlas dashboard:
1. In the left navigation, click **Data API**.
2. Click **Enable Data API** for your cluster.
3. Select your cluster and click **Generate API Key**. Save this key securely.
4. Copy the **URL Endpoint** shown on the Data API page (e.g., `https://data.mongodb-api.com/app/data-abcde/endpoint/data/v1`).

---

## 4. Configuring the App

You can configure the app in two ways:

### Method 1: In-App Database Settings (Zero Rebuild)
1. Open the app on your phone or web browser.
2. Tap the **⚙️ Database Settings** icon in the header.
3. Switch connection mode from **Local Mock** to **Live MongoDB Atlas**.
4. Enter:
   - **Data API / App Services Base URL**
   - **Cluster Name** (e.g., `AirbnbCluster`)
   - **Database Name** (`airbnb_expenses`)
   - **API Key / JWT Token**
5. Tap **Test Connection**. Once confirmed, tap **Save & Connect**.

### Method 2: Environment Variables (`.env`)
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_MONGO_DATA_API_URL=https://data.mongodb-api.com/app/data-abcde/endpoint/data/v1
EXPO_PUBLIC_MONGO_CLUSTER_NAME=AirbnbCluster
EXPO_PUBLIC_MONGO_DATABASE=airbnb_expenses
EXPO_PUBLIC_MONGO_API_KEY=your_atlas_api_key_here
```

---

## 5. Expo Push Notifications Setup

The app automatically integrates with the **Expo Push Notification Service**:
1. When any user opens the app on a physical Android or iOS device, their unique `ExponentPushToken` is registered and saved to their profile in MongoDB.
2. Whenever any manager logs an expense, the app automatically dispatches push notifications to all other onboarded property managers:
   > **Airbnb Expense Alert:**
   > "[User A] added ₹22,000 for Monthly Rent on Vrindavan Villa. Your share to pay is ₹7,333.33."
3. Push notifications require no external server or APNs/FCM credentials when running via Expo Go.
