import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import productsRouterFunction from "./routes/products.js";

dotenv.config();

const app = express();

// ✅ CORS setup (you can restrict to your Vercel domain later)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 🔥 Secure Firebase initialization for Render + Local
let serviceAccount = null;

// 1️⃣ Try loading from environment variable (Render)
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.log("✅ Loaded Firebase credentials from environment variable");
  } catch (err) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err);
  }
}

// 2️⃣ Fallback: Local file (for development)
if (!serviceAccount) {
  const localPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
    "./keys/firebase-service-account.json";

  try {
    const jsonData = fs.readFileSync(localPath, "utf8");
    serviceAccount = JSON.parse(jsonData);
    console.log("✅ Loaded Firebase credentials from local file");
  } catch (err) {
    console.error("❌ Firebase key file not found:", localPath);
  }
}

// Initialize Firebase if credentials found
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
  });
  console.log("🔥 Firebase initialized successfully");
} else {
  console.error("❌ No Firebase credentials found. Exiting...");
  process.exit(1);
}

const db = admin.database();
app.locals.db = db;

// Routers
app.use("/api/products", productsRouterFunction());

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
