import express from 'express';
const router = express.Router();
import * as controllers from '../controllers/app.js';// This imports all named exports as an object

router.get('/', controllers.getAppPage);
router.get('/currencies', controllers.getCurrencies);
router.get('/login', controllers.getloginPage);
router.post('/login', controllers.login);
router.get('/new-user', controllers.getNewUser );
router.post('/users', controllers.createUser );

export default router;// Export the router