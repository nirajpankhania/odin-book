const express = require('express');
const router = express.Router();
const passport = require('passport');

//redirect to github for auth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

//github redirects back here after auth
router.get('/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/'); //redirect to home after successful login
    }
);

//logout route
router.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login'); //redirect to home after logout
    });
});

module.exports = router;