const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const groupController = require('../controllers/groupController');
const expenseController = require('../controllers/expenseController');
const balanceController = require('../controllers/balanceController');

// User Routes
router.post('/users', userController.createUser);
router.get('/users', userController.getUsers);

// Group Routes
router.post('/groups', groupController.createGroup);
router.get('/groups/:id', groupController.getGroup);
router.get('/users/:userId/groups', groupController.getUserGroups);

// Expense Routes
router.post('/expenses', expenseController.createExpense);
router.get('/groups/:groupId/expenses', expenseController.getGroupExpenses);

// Balance Routes
router.get('/groups/:groupId/balances', balanceController.getGroupBalances);

module.exports = router;
