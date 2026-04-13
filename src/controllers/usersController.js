const prisma = require('../db');

// get /users and list all users
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                NOT: { id: req.user.id } //exclude current user
            },
            include: {
                followers: true,
            }
        });

        const usersWithStatus = users.map(user => {
            const followerRecord = user.followers.find(
                f => f.followerId === req.user.id
            );
            return {
                ...user,
                followStatus: followerRecord ? followerRecord.status : null
            };
        });

        res.render('pages/users/index', {
            users: usersWithStatus,
            currentUser: req.user
        });
    
    } catch (err) {
        next(err);
    }
};

// get /users/:id and show user profile
const getUserProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                posts: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        likes: true,
                        comments: {
                            include: { author: true }
                        }
                    }
                },
                followers: true,
                following: true
            }
        });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // determine follow status for current user and this profile
        const followerRecord = user.followers.find(
            f => f.followerId === req.user.id
        );
        const followStatus = followerRecord ? followerRecord.status : null;

        res.render('pages/users/profile', {
            profileUser: user,
            currentUser: req.user,
            followStatus,
            followerCount: user.followers.filter(f => f.status === 'ACCEPTED').length,
            followingCount: user.following.filter(f => f.status === 'ACCEPTED').length
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllUsers,
    getUserProfile
};