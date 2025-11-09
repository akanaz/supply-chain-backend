import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import productsRouterFunction from "./routes/products.js";

dotenv.config();
const app = express();

/* -----------------------------------------------------------
   ✅ FIXED CORS CONFIGURATION (handles Vercel + OPTIONS requests)
------------------------------------------------------------ */

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://supply-chain-kzdi.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // <-- Respond immediately to preflight
  }
  next();
});

// or alternatively you can use cors() below:
app.use(
  cors({
    origin: "https://supply-chain-kzdi.vercel.app", // your deployed frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());

/* -----------------------------------------------------------
   🔥 Firebase Initialization (same as before)
------------------------------------------------------------ */

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.log("✅ Loaded Firebase credentials from environment variable");
  } catch (err) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err);
  }
}

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

/* -----------------------------------------------------------
   🧩 ROUTES
------------------------------------------------------------ */

app.get("/", (req, res) => {
  res.send("✅ Backend is live and connected to Firebase!");
});

app.use("/api/products", productsRouterFunction());

/* -----------------------------------------------------------
   🚀 START SERVER
------------------------------------------------------------ */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
