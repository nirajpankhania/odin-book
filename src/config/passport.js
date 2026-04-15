const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const prisma = require('../db');

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || "http://localhost:3000/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        //check if user already exists
        let user = await prisma.user.findUnique({
            where: { githubId: profile.id.toString() }
        });
        
        if (!user) {
            //create new user from github profile
            user = await prisma.user.create({
                data: {
                    githubId: profile.id.toString(),
                    username: profile.username,
                    displayName: profile.displayName || profile.username,
                    avatarUrl: profile.photos[0]?.value || null
                }
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

//store user id in session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//retrieve full user from db on each request
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;

