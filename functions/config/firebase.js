const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

try {
    const serviceAccount = require("./serviceAccountKey.json");
    const firebaseConfig = require("./firebaseConfig.json");
    
    if (!serviceAccount) {
        throw new Error("Service account key file not found");
    }
    
    initializeApp({
        credential: cert(serviceAccount)
    });
    
    const db = getFirestore();
    const auth = getAuth();
    const FIREBASE_API_KEY = firebaseConfig.apiKey;

    module.exports = { db, auth, FIREBASE_API_KEY };
} catch (error) {
    console.error("Error initializing Firebase configuration:", error);
    throw new Error("Failed to initialize Firebase configuration");
}