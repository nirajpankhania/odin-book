const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

const {
    sendFollowRequest,
    acceptFollowRequest,
    rejectFollowRequest,
} = require('../controllers/followsController');

router.post('/', isAuthenticated, sendFollowRequest);
router.post('/:id/accept', isAuthenticated, acceptFollowRequest);
router.post('/:id/reject', isAuthenticated, rejectFollowRequest);

module.exports = router;