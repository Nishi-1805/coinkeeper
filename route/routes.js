const express = require('express');
const router = express.Router();
const controllers = require('../controllers/app');

router.get('/', controllers.getAppPage);
router.get('/currencies', controllers.getCurrencies);
router.get('/login', controllers.getloginPage);
router.post('/login',controllers.login);
router.get('/new-user', controllers.getNewUser);
router.post('/users', controllers.createUser);

module.exports = router;
