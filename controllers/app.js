import express from 'express';
import axios from 'axios';
import path from 'path';
import bcrypt from 'bcrypt';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Utility to get __dirname in ES modules
//const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Export functions using CommonJS syntax
export const getCurrencies = async (req, res) => {
    try {
        const response = await axios.get(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json`);
        const currencies = response.data;
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

export const getAppPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/currency.html'));
};

export const getNewUser  = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/new-user.html'));
};

export const getloginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
};

export const getNotesPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/notes.html'));
};

export const getDailyExpensePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/daily.html'));
};

export const getMonthlyExpensePage = (req, res) => {
    res.cookie('isPremium', req.session.isPremium, { httpOnly: false });
    res.sendFile(path.join(__dirname, '../views/monthly.html'));
};

export const getYearlyExpensePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/yearly.html'));
};

// Create User Function
export const createUser  = async (req, res) => {
    try {
        const { email, password, name, purpose, info, account } = req.body;

        const auth = getAuth();
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Optional: Save additional user information in your database here

        res.status(201).json({ message: 'User  added successfully!', uid: user.uid });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Login Function
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const auth = getAuth();
        // Sign in with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        res.json({ message: 'Login successful!', uid: user.uid });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ message: error.message });
    }
};
