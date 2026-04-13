const express = require('express');
const router = express.Router();
const { getAllUsers, getUserProfile } = require('../controllers/usersController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, getAllUsers);
router.get('/:id', isAuthenticated, getUserProfile);

module.exports = router;