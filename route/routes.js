import express from 'express';
const router = express.Router();
import * as controllers from '../controllers/app.js';// This imports all named exports as an object
import authenticateToken from '../middleware/authenticateToken.js';

router.get('/', controllers.getAppPage);
router.get('/about', controllers.getAboutPage);
router.get('/currencies', controllers.getCurrencies);
router.get('/login', controllers.getloginPage);
router.post('/login', controllers.login);
router.get('/new-user', controllers.getNewUser );
router.post('/users', controllers.createUser );
router.post('/password/forgotpassword', controllers.forgotPassword);
router.get('/note', controllers.getNotesPage);
router.post('/notes',authenticateToken,  controllers.createNote);
router.get('/notes',authenticateToken, controllers.getNotes);
router.get('/daily', authenticateToken, controllers.getDailyExpensePage);
router.get('/buy-premium', authenticateToken, controllers.buyPremiumMembership);
router.get('/check-premium', authenticateToken, controllers.checkPremiumStatus);
router.post('/buy-premium', authenticateToken, controllers.handlePaymentResponse);
router.get('/leaderboard', authenticateToken, controllers.getLeaderboard);
router.get('/transactions', authenticateToken, controllers.getDailyExpenses);
router.post('/transactions', authenticateToken, controllers.addTransaction);
router.delete('/transactions/:transactionId', authenticateToken, controllers.deleteTransaction);
router.get('/monthly',authenticateToken, controllers.getMonthlyExpensePage);
router.post('/monthly', authenticateToken, controllers.createMonthlyExpense);
router.get('/monthly-summary', authenticateToken, controllers.getMonthlyExpenses);
router.get('/download', authenticateToken, controllers.downloadallexpense);
router.get('/yearly',authenticateToken, controllers.getYearlyExpensePage);
router.post('/yearly', authenticateToken, controllers.createYearlyExpense);
router.get('/yearly-summary', authenticateToken, controllers.getYearlyExpenses);

export default router;// Export the router