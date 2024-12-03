import { app } from '../firebaseconfig';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
const axios = require('axios');
const path = require('path');
const buffer = require('buffer');
const bcrypt = require('bcrypt');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');

exports.getCurrencies = async (req, res) => {
    try {
      const response = await axios.get(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json`);
      const currencies = response.data;
      //console.log('Currencies:', currencies);
      if (!currencies) {
        throw new Error('No currencies found');
      }
  
      const entries = Object.entries(currencies);
      const filteredEntries = entries.filter(([key, value]) => {
        return key.toLowerCase().includes(req.query.searchTerm.toLowerCase()) ||
          value.toLowerCase().includes(req.query.searchTerm.toLowerCase());
      });
  
      const currenciesArray = filteredEntries.map(([key, value]) => {
        return {
          name: value,
          code: key,
          country: ''
        };
      });
  
      res.json(currenciesArray);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error fetching currencies');
    }
  };

  exports.getAppPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/currency.html'));
  };
  
  exports.getNewUser = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/new-user.html'));
  };
  
  exports.getloginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
  };
  
  exports.getNotesPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/notes.html'))
  }
  
  exports.getDailyExpensePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/daily.html'))
  }
  
  exports.getMonthlyExpensePage = (req, res) => {
    res.cookie('isPremium', req.session.isPremium, { httpOnly: false });
    res.sendFile(path.join(__dirname, '../views/monthly.html'))
  }
  
  exports.getYearlyExpensePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/yearly.html'))
  }

  // Create User Function
exports.createUser  = async (req, res) => {
  try {
    const { email, password, name, purpose, info, account } = req.body;

    const auth = getAuth();
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optional: Save additional user information in your database here
    // e.g., save name, purpose, info, account to Firestore or Realtime Database

    res.status(201).json({ message: 'User  added successfully!', uid: user.uid });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message }); // Send back the error message from Firebase
  }
};

// Login Function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const auth = getAuth();
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Generate token or any additional logic can be done here
    // Note: Firebase Auth automatically manages user sessions with JWT tokens

    res.json({ message: 'Login successful!', uid: user.uid });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({ message: error.message }); // Send back the error message from Firebase
  }
};
