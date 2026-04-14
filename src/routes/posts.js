const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

const {
    createPost,
    deletePost,
    toggleLike,
    createComment
} = require('../controllers/postController');

router.post('/', isAuthenticated, createPost);
router.post('/:id/delete', isAuthenticated, deletePost);
router.post('/:id/like', isAuthenticated, toggleLike);
router.post('/:id/comments', isAuthenticated, createComment);

module.exports = router;