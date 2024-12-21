import express from 'express';
import axios from 'axios';
import path from 'path';
import bcrypt from 'bcrypt';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, addDoc, doc, getDoc, getFirestore, setDoc, query, where, getDocs, orderBy, limit, startAfter} from 'firebase/firestore'; // Ensure this is imported
import { db } from '../firebaseconfig.js';
import { admin, database } from '../firebaseAdminConfig.js';

dotenv.config({ path: 'D:/Git/firebase-1/.env' });
console.log(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_SECRET_KEY);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
const jwtSecret = process.env.JWT_SECRET; // Accessing the JWT secret

// Utility to get __dirname in ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const getAboutPage = (req, res) => {
    const filePath = path.join(__dirname, 'public', 'about.html'); // Adjust the path as necessary
    console.log('Serving About page:', filePath); // Log the file path
    res.sendFile(filePath);
};

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
    res.sendFile(path.join(__dirname, '../public/index.html'));
};

export const getNewUser  = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/new-user.html'));
};

export const getloginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
};

export const getNotesPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/notes.html'));
};

export const getDailyExpensePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/daily.html'));
};

export const getMonthlyExpensePage = (req, res) => {
    res.cookie('isPremium', req.session.isPremium, { httpOnly: false });
    res.sendFile(path.join(__dirname, '../public/monthly.html'));
};

export const getYearlyExpensePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/yearly.html'));
};

// Create User Function
export const createUser  = async (req, res) => {
    try {
        const { email, password, name, purpose, info, account } = req.body;

        const db  = getFirestore();
        const auth = getAuth();
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional user information in Firestore
        const userRef = doc(db, 'users', user.uid); // Replace 'users' with your desired collection name
        await setDoc(userRef, {
            uid: user.uid,
            name,
            email,
            password,
            purpose,
            info,
            account,
            createdAt: new Date() // Optional: Add a timestamp
        });
      //  console.log("User  document created in Firestore:", user.uid);

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

        const db  = getFirestore();
        const auth = getAuth();
        // Sign in with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
        console.log('Generated Token:', token); 

       // console.log("User  signed in:", user);
        // Check if the user exists in Firestore
        const userDocRef = doc(db, 'users', user.uid); // Reference to the user's document
        const userDoc = await getDoc(userDocRef);
        //console.log("User  document exists:", userDoc.exists());
        if (!userDoc.exists()) {
            // User not found in Firestore
            return res.status(401).json({ message: 'User  not registered.' });
        }

        // If user exists in Firestore, proceed with login
        res.json({ 
            message: 'Login successful!', 
            token,
            uid: user.uid,
            redirectUrl: '/note' // URL to redirect to
        });
    } catch (error) {
        console.error('Error logging in:', error.code, error.message);
        res.status(401).json({ message: error.message });
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received email for password reset:', email); // Log the received email

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);
        
        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Error sending password reset link:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const createNote = async (req, res) => {
    console.log('Create Note Function Hit');
    try {
      const token = req.header('Authorization').replace('Bearer ', '');
      console.log('Authorization Header:', req.header('Authorization'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      console.log('User  ID from token:', userId); 
  
      const noteData = req.body;
      console.log('Request body:', noteData); 
  
      // Validate noteData
      if (!noteData.title || !noteData.text || !noteData.date) {
        return res.status(400).send({ error: 'Title, text, and date are required' });
    }

    const db = getFirestore();
      const note = {
        title: noteData.title,
        text: noteData.text,
        date: noteData.date,
        userId: userId, // Associate note with user
        createdAt: new Date() // Optional: Add a timestamp
      };
  
      // Save the note to Firestore
      await addDoc(collection(db, 'users', userId, 'notes'), note);
      res.status(201).send(note);
    } catch (error) {
        console.error('Error creating note:', error); 
      res.status(400).send({ error: 'Error creating note' });
    }
  }
  
  // Get Notes Function
  export const getNotes = async (req, res) => {
    console.log('Get Notes Function Hit');
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const db = getFirestore();
        const notesRef = collection(db, 'users', userId, 'notes');

        // Get pagination parameters from the query
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limitValue = parseInt(req.query.limit) || 10; // Default to 10 notes per page

        // Calculate the starting point for the query
        let q;

        if (page === 1) {
            // For the first page, just limit the results
            q = query(notesRef, orderBy('date'), limit(limitValue));
        } else {
            // For subsequent pages, we need to find the last document of the previous page
            const lastVisibleDoc = await getLastVisibleDoc(notesRef, page - 1, limitValue);
            if (!lastVisibleDoc) {
                return res.status(404).json({ message: 'No more notes available.' });
            }
            q = query(notesRef, orderBy('date'), startAfter(lastVisibleDoc), limit(limitValue));
        }

        const querySnapshot = await getDocs(q);
        const notes = [];
        querySnapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() });
        });

        // Get total count of notes for pagination
        const totalNotesSnapshot = await getDocs(notesRef);
        const totalNotes = totalNotesSnapshot.size;
        const totalPages = Math.ceil(totalNotes / limitValue);

        res.json({ notes, totalPages });
    } catch (error) {
        console.error('Error getting notes:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Helper function to get the last visible document for pagination
async function getLastVisibleDoc(notesRef, page, limitValue) {
    const q = query(notesRef, orderBy('date'), limit(limitValue * page));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null; // Return the last document of the previous page
}

export const addTransaction = async (req, res) => {
    try {
        const user  = req.user; // Assuming user is set in middleware
        console.log('User  object:', req.user);
        const transactionData = req.body;
        const formattedDate = moment(transactionData.date).format('YYYY-MM-DD');
        console.log(user); // Check if user is defined
        console.log(user.userId); // Check if uid is defined

        let transactions = [];
        let totalIncome = 0;
        let totalExpense = 0;

        // Check if income data is provided
        if (transactionData.income) {
            const { text, amount, description } = transactionData.income;
            transactions.push({
                id: uuidv4(),
                date: formattedDate,
                type: 'income',
                text: text,
                amount: parseFloat(amount) || 0,
                description: description,
            });
            totalIncome += parseFloat(amount) || 0;
        }

        // Check if expense data is provided
        if (transactionData.expense) {
            const { text, amount, description } = transactionData.expense;
            transactions.push({
                id: uuidv4(),
                date: formattedDate,
                type: 'expense',
                text: text,
                amount: parseFloat(amount) || 0,
                description: description,
            });
            totalExpense += parseFloat(amount) || 0;
        }

        // Reference to the user's transaction document
        const transactionRef = doc(db, 'users', user.userId);

        // Get the current transactions
        const docSnap = await getDoc(transactionRef);
        if (docSnap.exists()) {
            const existingData = docSnap.data();
            transactions = [...(existingData.transactions || []), ...transactions]; 
            totalIncome += parseFloat(existingData.totalIncome) || 0; // Ensure existing totalIncome is a number
            totalExpense += parseFloat(existingData.totalExpense) || 0; 
        } //else {
            // If the document does not exist, initialize the transactions array
            //transactions = [...transactions];
        //}

        // Update the document with new transactions
        await setDoc(transactionRef, {
            transactions: transactions,
            totalIncome: totalIncome,
            totalExpense: totalExpense,
        }, { merge: true }); 

        res.status(200).json({ 
            message: 'Transaction added successfully!', 
            totalIncome: totalIncome, // Return updated total income
            totalExpense: totalExpense, // Return updated total expense
            transactions 
        });
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
};

export const getDailyExpenses = async (req, res) => {
    try {
        const userId = req.user.userId; // Use userId from the authenticated user
        const transactionRef = doc(db, 'users', userId); // Reference to the user's document
        const transactionDoc = await getDoc(transactionRef);

        if (!transactionDoc.exists()) {
            // If the document does not exist, return default values
            return res.json({
                dailyExpenses: {
                    income: 0,
                    expense: 0,
                },
                transactions: [],
            });
        }

        const existingData = transactionDoc.data();
        const transactions = existingData.transactions || []; // Ensure transactions is an array
        const dailyExpenses = {
            income: 0,
            expense: 0,
        };

        transactions.forEach((transaction) => {
            if (transaction.type === 'income') {
                dailyExpenses.income += parseFloat(transaction.amount) || 0; // Handle NaN
            } else {
                dailyExpenses.expense += parseFloat(transaction.amount) || 0; // Handle NaN
            }
        });

        res.json({
            dailyExpenses,
            transactions,
        });
    } catch (error) {
        console.error('Error fetching daily expenses:', error);
        res.status(500).json({ message: 'Error fetching daily expenses' });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const transactionId = req.params.transactionId;
        const userId = req.user.userId; // Use userId from the authenticated user
        const transactionRef = doc(db, 'users', userId); // Reference to the user's document
        const transactionDoc = await getDoc(transactionRef);

        if (!transactionDoc.exists()) {
            return res.status(404).json({ message: 'User  not found or not authorized to delete' });
        }

        const transactions = transactionDoc.data().transactions || []; // Ensure transactions is an array
        const index = transactions.findIndex((transaction) => transaction.id === transactionId);

        if (index === -1) {
            return res.status(404).json({ message: 'Transaction not found or not authorized to delete' });
        }

        const amount = transactions[index].amount;
        const type = transactions[index].type;

        transactions.splice(index, 1); // Remove the transaction

        let totalIncome = transactionDoc.data().totalIncome || 0; // Handle undefined
        let totalExpense = transactionDoc.data().totalExpense || 0; // Handle undefined

        if (type === 'income') {
            totalIncome -= amount;
        } else if (type === 'expense') {
            totalExpense -= amount;
        }

        await setDoc(transactionRef, {
            transactions: transactions,
            totalIncome: totalIncome,
            totalExpense: totalExpense,
        });

        res.status(200).json({ message: 'Transaction deleted successfully!' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Error deleting transaction' });
    }
};

export const buyPremiumMembership = async (req, res) => {
  try {
    const options = {
      amount: 10000, // Amount in paise (100 INR)
      currency: 'INR',
      receipt: uuidv4(), // Unique receipt ID
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

export const handlePaymentResponse = async (req, res) => {
  try {
    const paymentId = req.body.razorpay_payment_id;
    const orderId = req.body.razorpay_order_id; // Get the order ID from the response

    // Save payment details to Firestore
    const userId = req.user.userId; // Assuming user ID is set in middleware
    const userRef = doc(db, 'users', userId);

    // Update user's premium status
    await setDoc(userRef, { isPremium: true }, { merge: true });

    // Optionally, you can store the payment details in a separate collection
    await setDoc(doc(db, 'orders', orderId), {
      userId,
      paymentId,
      orderId,
      status: 'paid',
      createdAt: new Date(),
    });

    res.cookie('premiumStatus', 'true', { maxAge: 31536000000, httpOnly: true }); // Set cookie for 1 year
    res.json({ message: 'Premium membership purchased successfully!' });
    // Inside handlePaymentResponse after updating the user's premium status
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
};

export const checkPremiumStatus = async (req, res) => {
  try {
    const userId = req.user.userId; // The user should already be set by the `authenticate` middleware
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.json({ isPremium: false }); // User not found
    }

    const isPremium = userDoc.data().isPremium || false; // Check premium status
    res.json({ isPremium });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to check premium status' });
  }
};

export const getLeaderboard = async (req, res) => {
    const userId = req.user.userId; // Assuming you have user ID from the request (e.g., from JWT)
  
    try {
        // Fetch user data from Firestore to check if the user is premium
        const userRef = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userRef); // Use getDoc to fetch the document
        
        if (!userSnapshot.exists()) {
            return res.status(404).json({ message: 'User  not found' });
        }
  
        const userData = userSnapshot.data();
        
        // Check if the user is a premium user
        if (!userData.isPremium) {
            return res.status(403).json({ message: 'Access denied. Premium users only.' });
        }
  
        // Fetch leaderboard data from Firestore
        const leaderboardSnapshot = await getDocs(query(collection(db, 'users'), orderBy('totalExpense', 'desc'), limit(10)));
  
        const leaderboard = leaderboardSnapshot.docs.map(doc => {
            const data = doc.data();
            const totalIncome = parseFloat(data.totalIncome) || 0; // Ensure totalIncome is a number
            const totalExpense = parseFloat(data.totalExpense) || 0; // Ensure totalExpense is a number
            
            return {
                id: doc.id,
                name: data.name || 'Unknown',
                totalIncome,
                totalExpense,
                currency: data.account || 'USD'
            }; 
        });
  
        const formattedLeaderboard = leaderboard.map(profile => ({
            name: profile.name,
            totalIncome: `${profile.currency} ${profile.totalIncome.toFixed(2)}`,
            totalExpense: `${profile.currency} ${profile.totalExpense.toFixed(2)}`
        }));
  
        res.status(200).json(formattedLeaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({ message: 'Failed to fetch leaderboard data' });
    }
};

export const createMonthlyExpense = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from the request
        const expenseData = req.body;

        // Create a new monthly expense object
        const monthlyExpense = {
            income: parseFloat(expenseData.income) || 0,
            expense: parseFloat(expenseData.expense) || 0,
            balance: parseFloat(expenseData.balance) || 0,
            description: expenseData.description,
            createdAt: new Date(), // Add a timestamp
        };

        // Reference to the user's monthly expenses collection
        const monthlyExpensesRef = collection(db, 'users', userId, 'monthlyExpenses');

        // Add the monthly expense to Firestore
        await addDoc(monthlyExpensesRef, monthlyExpense);

        res.status(201).json({
            message: 'Monthly expense added successfully',
        });
    } catch (error) {
        console.error('Error creating monthly expense:', error);
        res.status(500).json({ message: 'Error creating monthly expense' });
    }
};

export const getMonthlyExpenses = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from the request
        const monthlyExpensesRef = collection(db, 'users', userId, 'monthlyExpenses');

        // Get all monthly expenses for the user
        const querySnapshot = await getDocs(monthlyExpensesRef);

        if (querySnapshot.empty) {
            return res.status(404).json({ message: 'No monthly expense data found' });
        }

        let totalIncome = 0;
        let totalExpense = 0;
        let totalBalance = 0;
        let latestDescription = '';

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            totalIncome += parseFloat(data.income) || 0;
            totalExpense += parseFloat(data.expense) || 0;
            totalBalance += parseFloat(data.balance) || 0;
            latestDescription = data.description; // Get the latest description
        });

        totalIncome = totalIncome.toFixed(2);
        totalExpense = totalExpense.toFixed(2);
        totalBalance = totalBalance.toFixed(2);

        const monthlyExpenses = {
            income: totalIncome,
            expense: totalExpense,
            balance: totalBalance,
            description: latestDescription,
        };

        res.json(monthlyExpenses);
    } catch (error) {
        console.error('Error fetching monthly expenses:', error);
        res.status(500).json({ message: 'Error fetching monthly expenses' });
    }
};

export const createYearlyExpense = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from the request
        const expenseData = req.body;

        // Create a new yearly expense object
        const yearlyExpense = {
            income: parseFloat(expenseData.income) || 0,
            expense: parseFloat(expenseData.expense) || 0,
            balance: parseFloat(expenseData.balance) || 0,
            description: expenseData.description,
            createdAt: new Date(), // Add a timestamp
        };

        // Reference to the user's yearly expenses collection
        const yearlyExpensesRef = collection(db, 'users', userId, 'yearlyExpenses');

        // Add the yearly expense to Firestore
        await addDoc(yearlyExpensesRef, yearlyExpense);

        res.status(201).json({
            message: 'Yearly expense added successfully',
        });
    } catch (error) {
        console.error('Error creating yearly expense:', error);
        res.status(500).json({ message: 'Error creating yearly expense' });
    }
};

export const getYearlyExpenses = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from the request
        const yearlyExpensesRef = collection(db, 'users', userId, 'yearlyExpenses');

        // Get all yearly expenses for the user
        const querySnapshot = await getDocs(yearlyExpensesRef);

        if (querySnapshot.empty) {
            return res.status(404).json({ message: 'No yearly expense data found' });
        }

        let totalIncome = 0;
        let totalExpense = 0;
        let totalBalance = 0;
        let latestDescription = '';

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            totalIncome += parseFloat(data.income) || 0;
            totalExpense += parseFloat(data.expense) || 0;
            totalBalance += parseFloat(data.balance) || 0;
            latestDescription = data.description; // Get the latest description
        });

        totalIncome = totalIncome.toFixed(2);
        totalExpense = totalExpense.toFixed(2);
        totalBalance = totalBalance.toFixed(2);

        const yearlyExpenses = {
            income: totalIncome,
            expense: totalExpense,
            balance: totalBalance,
            description: latestDescription,
        };

        res.json(yearlyExpenses);
    } catch (error) {
        console.error('Error fetching yearly expenses:', error);
        res.status(500).json({ message: 'Error fetching yearly expenses' });
    }
};

export const downloadallexpense = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming user ID is set in the request

        // Reference to the user's document
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return res.status(404).json({ error: 'User  not found' });
        }

        // Get daily expenses from the transactions array
        const userData = userDoc.data(); // Get the user data
        const dailyExpenses = userData.transactions || []; 
        console.log("Daily Expenses:", dailyExpenses); 

        // Map daily expenses to the desired format
        const formattedDailyExpenses = dailyExpenses.map(expense => {
            return {
                id: expense.id || 'N/A', // Use the 'id' field
                amount: expense.amount || 0, // Use the 'amount' field
                description: expense.description || 'N/A', 
                type: expense.type || 'daily', // Set a type for clarity
                date: expense.date || new Date() // Use the 'date' field
            };
        });

        // Fetch monthly expenses
        const monthlyExpensesRef = collection(db, 'users', userId, 'monthlyExpenses');
        const monthlyExpensesSnapshot = await getDocs(monthlyExpensesRef);
        const monthlyExpenses = monthlyExpensesSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                amount: data.expense || 0, // Use the 'expense' field
                description: data.description || 'N/A', 
                type: 'monthly', // Set a type for clarity
                date: data.createdAt || new Date() 
            };
        });

        // Fetch yearly expenses
        const yearlyExpensesRef = collection(db, 'users', userId, 'yearlyExpenses');
        const yearlyExpensesSnapshot = await getDocs(yearlyExpensesRef);
        const yearlyExpenses = yearlyExpensesSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                amount: data.expense || 0, // Use the 'expense' field
                description: data.description || 'N/A', 
                type: 'yearly', // Set a type for clarity
                date: data.createdAt || new Date() 
            };
        });

        // Combine all expenses
        const allExpenses = [...formattedDailyExpenses, ...monthlyExpenses, ...yearlyExpenses];
        console.log("All Expenses:", allExpenses);
        // Prepare the data for download
        const expensesData = allExpenses.map(expense => {
            const dateValue = expense.date; // Use the date field
            let date;

            if (dateValue) {
                // If it's a Firestore Timestamp, convert it to a Date object
                if (typeof dateValue === 'string') {
                    date = new Date(dateValue); // Directly use the string date
                } else if (dateValue.seconds !== undefined) {
                    date = new Date(dateValue.seconds * 1000); // Convert seconds to milliseconds
                } else {
                    date = new Date(dateValue); // Try to create a Date object directly
                }
            }

            const formattedDate = date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : 'N/A'; // Format date
            const type = expense.type || 'N/A'; // Ensure type is set
            const amount = expense.amount !== undefined ? expense.amount : 0; // Ensure amount is set
            const description = expense.description || 'N/A'; // Ensure description is set

            return `Type: ${type}, Amount: ${amount}, Description: ${description}, Date: ${formattedDate}`;
        }).join('\n');

        // Set the response headers to indicate a file download
        res.setHeader('Content-disposition', `attachment; filename=AllExpenses_${userId}_${new Date().toISOString().replace(/:/g, '-')}.txt`);
        res.setHeader('Content-Type', 'text/plain');

        // Send the expenses data as the response
        res.send(expensesData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to download expenses', details: err.message });
    }
};
