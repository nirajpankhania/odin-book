const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

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

//test route
app.get('/', (req, res) => {
    res.send('odin book is alive');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});