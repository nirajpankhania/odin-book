const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const passport = require('./src/config/passport');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const postRoutes = require('./src/routes/posts');
const { isAuthenticated } = require('./src/middleware/auth');
const { getFeed } = require('./src/controllers/postController');

const app = express();

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: true,
}));

//passport
app.use(passport.initialize());
app.use(passport.session());

// make current user available in all views
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    next();
});

//routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('pages/login');
});

app.get('/', isAuthenticated, getFeed);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});