const prisma = require('../db');

// get home feed
const getFeed = async (req, res, next) => {
    try {
        // get ids of users the current user follows
        const following = await prisma.follow.findMany({
            where: { followerId: req.user.id, status: 'ACCEPTED' },
            select: { followingId: true }
        });

        const followingIds = following.map(f => f.followingId);

        // include users own posts too
        const authorIds = [...followingIds, req.user.id];

        const posts = await prisma.post.findMany({
            where: { authorId: { in: authorIds } },
            orderBy: { createdAt: 'desc' },
            include: {
                author: true,
                likes: true,
                comments: {
                    include: { author: true },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        res.render('pages/feed', { posts, currentUser: req.user });
    } catch (err) {
        next(err);
    }
};

// /posts create a new post
const createPost = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.redirect('/'); // or you could flash an error message
        }

        await prisma.post.create({
            data: {
                content: content.trim(),
                authorId: req.user.id
            }
        });

        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

// /posts/:id/delete delete a post
const deletePost = async (req, res, next) => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: req.params.id }
        });

        // only author can delete their post
        if (!post || post.authorId !== req.user.id) {
            return res.status(403).send('Forbidden');
        }

        // delete likes and comments first
        await prisma.like.deleteMany({ where: { postId: post.id } });
        await prisma.comment.deleteMany({ where: { postId: post.id } });
        await prisma.post.delete({ where: { id: post.id } });

        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

// /posts/:id/like toggle like on a post
const toggleLike = async (req, res, next) => {
    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: req.user.id,
                    postId: req.params.id
                }
            }
        });

        if (existingLike) {
            // if like exists, remove it (unlike)
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
        } else {
            // if no like, create it
            await prisma.like.create({
                data: {
                    userId: req.user.id,
                    postId: req.params.id
                }
            });
        }

        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

// /posts/:id/comments add a comment to a post
const createComment = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.redirect('/'); 
        }

        await prisma.comment.create({
            data: {
                content: content.trim(),
                authorId: req.user.id,
                postId: req.params.id
            }
        });

        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getFeed,
    createPost,
    deletePost,
    toggleLike,
    createComment
};