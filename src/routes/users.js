const express = require('express');
const router = express.Router();
const { getAllUsers, getUserProfile } = require('../controllers/usersController');
const { getFollowRequests } = require('../controllers/followsController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, getAllUsers);
// above so requests doesnt get treated as user id param in getUserProfile route
router.get('/requests', isAuthenticated, getFollowRequests);
router.get('/:id', isAuthenticated, getUserProfile);

module.exports = router;