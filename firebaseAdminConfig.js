// firebaseAdminConfig.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path to the service account key
//const serviceAccountPath = path.resolve('D:/Git/fir-1-94c78-firebase-adminsdk-5nme9-082a3d3dd7.json');

// Read the service account JSON file
//const serviceAccountPath = path.resolve('D:/Git/fir-1-94c78-firebase-adminsdk-5nme9-082a3d3dd7.json');
//const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const database = admin.firestore(); // Ensure this is defined

// Export the admin and db objects
export { admin, database }; // Ensure you are exporting db as well