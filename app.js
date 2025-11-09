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
   ✅ CORS SETUP (Secure for Production + Local Development)
------------------------------------------------------------ */

const allowedOrigins = [
  "https://supply-chain-kzdi-msg2ky5gi-aks-projects-5385a6ca.vercel.app", // your live frontend on Vercel
  "http://localhost:3000" // for local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ CORS blocked request from:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());

/* -----------------------------------------------------------
   🔥 FIREBASE INITIALIZATION (Works for Render + Local)
------------------------------------------------------------ */

let serviceAccount = null;

// 1️⃣ Try loading from Render environment variable
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.log("✅ Loaded Firebase credentials from environment variable");
  } catch (err) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err);
  }
}

// 2️⃣ Fallback: Local file for development
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

// 3️⃣ Initialize Firebase if credentials are valid
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
