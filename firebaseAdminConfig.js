// firebaseAdminConfig.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path to the service account key
const serviceAccountPath = path.resolve('D:/Git/fir-1-94c78-firebase-adminsdk-5nme9-50a9b7545b.json');

// Read the service account JSON file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const database = admin.firestore(); // Ensure this is defined

// Export the admin and db objects
export { admin, database }; // Ensure you are exporting db as well