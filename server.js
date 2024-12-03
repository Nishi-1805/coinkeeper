const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./route/routes');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

import {app} from './firebaseConfig';

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

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/currency.html'));
  });
  
  app.get('/new-user', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/new-user.html'));
  });
  
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/login.html'));
  });
  
  app.get('/note', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/notes.html'));
  });
  
  app.get('/daily', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/daily.html'));
  });
  
  app.get('/monthly', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/monthly.html'));
  });
  
  app.get('/yearly', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/yearly.html'));
  });
  
  app.get('/reset-password/:forgotPasswordRequestId', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/reset_pw.html'));
  });
  
  app.use('/api', routes);

  app.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on port 3000');
  });