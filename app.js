import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import path from "path";
import productsRouterFunction from "./routes/products.js";

dotenv.config();

const app = express();

// Robust CORS: Allows all origins and methods for development/test
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse JSON
app.use(express.json());

// Firebase Service Account (ensure your .env and file path are correct)
const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();
app.locals.db = db;

// Use dynamic product router
app.use("/api/products", productsRouterFunction());

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
