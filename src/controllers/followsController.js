const prisma = require('../db');

// post /follows send a follow request
const sendFollowRequest = async (req, res, next) => {
    try {
        const { followingId } = req.body;

        // cant follow yourself
        if (followingId === req.user.id) {
            return res.redirect('/users');
        }

        // check if a follow record already exists
        const existing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: req.user.id,
                    followingId
                }
            }
        });

        if (!existing) {
            // create new follow request with PENDING status
            await prisma.follow.create({
                data: {
                    followerId: req.user.id,
                    followingId,
                    status: 'ACCEPTED' // for simplicity, auto-accept all follow requests
                }
            });
        }

        res.redirect('/users');
    } catch (err) {
        next(err);
    }
};

// post /follows/:id/accept accept a follow request
const acceptFollowRequest = async (req, res, next) => {
    try {
        await prisma.follow.update({
            where: {
                followerId_followingId: {
                    followerId: req.params.id,
                    followingId: req.user.id
                }
            },
            data: {
                status: 'ACCEPTED'
            }
        });

        res.redirect('/users/requests');
    } catch (err) {
        next(err);
    }
};

// post /follows/:id/reject reject a follow request
const rejectFollowRequest = async (req, res, next) => {
    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: req.params.id,
                    followingId: req.user.id
                }
            }
        });

        res.redirect('/users/requests');
    } catch (err) {
        next(err);
    }
};

// get /users/requests view incoming follow requests
const getFollowRequests = async (req, res, next) => {
    try {
        const requests = await prisma.follow.findMany({
            where: { followingId: req.user.id, status: 'PENDING' },
            include: { follower: true }
        });

        res.render('pages/users/requests', { requests, currentUser: req.user });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    sendFollowRequest,
    acceptFollowRequest,
    rejectFollowRequest,
    getFollowRequests
};
