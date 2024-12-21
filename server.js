<<<<<<< HEAD
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './route/routes.js'; // Ensure to add .js extension
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import {firebaseApp, db} from './firebaseconfig.js';
import { collection, addDoc } from 'firebase/firestore';
import jwt from 'jsonwebtoken'

dotenv.config();
console.log('JWT Secret:', process.env.JWT_SECRET);

// Utility to get __dirname in ES modules
const __dirname = path.resolve();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors()); 

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Serve HTML files
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/new-user', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'new-user.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/login', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'login.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/note', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'notes.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/daily', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'daily.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/monthly', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'monthly.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/yearly', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'yearly.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/password/forgotpassword', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'reset_pw.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/about', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'about.html'); // Adjust the path as necessary
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.use('/api', routes);

//import crypto from 'crypto';
//const secretKey = crypto.randomBytes(32).toString('hex');
//console.log(secretKey);

app.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on port 3000');
=======
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './route/routes.js'; // Ensure to add .js extension
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import firebaseApp from './firebaseconfig.js';

// Utility to get __dirname in ES modules
const __dirname = path.resolve();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors()); 
dotenv.config();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Serve HTML files
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'currency.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/new-user', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'new-user.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/login', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'login.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/note', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'notes.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/daily', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'daily.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/monthly', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'monthly.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/yearly', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'yearly.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.get('/reset-password/:forgotPasswordRequestId', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'reset_pw.html');
    console.log('Serving file:', filePath); // Log the file path
    res.sendFile(filePath);
});

app.use('/api', routes);

app.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on port 3000');
>>>>>>> origin/main
});