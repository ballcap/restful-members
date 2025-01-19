const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
<<<<<<< HEAD
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: 'postgresql://postgre_g7aq_user:JpDqj0nTwtC2A8YuGUFAch5tXJazBrP3@dpg-cu6hp3lumphs73cufok0-a.singapore-postgres.render.com/postgre_g7aq',
  ssl: { rejectUnauthorized: false },
});
=======
const app = express();
>>>>>>> 4bff4f39d0ea1fe06c4f83f61966359d29709113

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

<<<<<<< HEAD
=======
// Hardcoded users
const users = {
  admin: { username: 'Admin', password: 'pass', role: 'vip' },
  maki: { username: 'Maki', password: '0000', role: 'vip' },
  noname: { username: 'No Name', password: 'basic', role: 'basic' },
};

>>>>>>> 4bff4f39d0ea1fe06c4f83f61966359d29709113
// Session configuration
app.use(session({
  secret: 'secure-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

<<<<<<< HEAD
// Serve static files from the public directory
=======
//Serve static files from the public directory
>>>>>>> 4bff4f39d0ea1fe06c4f83f61966359d29709113
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to protect routes
function requireAuth(role) {
<<<<<<< HEAD
  return async (req, res, next) => {
    if (req.session.user) {
      const { username } = req.session.user;
      const query = 'SELECT role FROM users WHERE username = $1';
      const result = await pool.query(query, [username]);

      if (result.rows.length > 0 && result.rows[0].role === role) {
        return next();
      }
    }
    res.status(403).send('Access Denied');
=======
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      next();
    } else {
      res.status(403).send('Access Denied');
    }
>>>>>>> 4bff4f39d0ea1fe06c4f83f61966359d29709113
  };
}

// Login route
<<<<<<< HEAD
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      if (user.password === password) { // For simplicity; use hashed passwords in production
        req.session.user = { username: user.username, role: user.role };
        const redirectPage = user.role === 'vip' ? '/member?vip=true' : '/member?vip=false';
        return res.redirect(redirectPage);
      }
    }
    res.status(403).send('Invalid username or password');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)';
    await pool.query(query, [username, password, 'basic']);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(400).send('Error registering user. Username might already be taken.');
=======
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username].password === password) {
    req.session.user = users[username]; // Store user in session
    res.redirect('/member'); // Redirect to the dynamic member page
  } else {
    res.status(403).send('Invalid username or password');
>>>>>>> 4bff4f39d0ea1fe06c4f83f61966359d29709113
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

<<<<<<< HEAD
// Serve member page
app.get('/member', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  const { username, role } = req.session.user;
  res.render('member', { username, role });
=======
app.get('/member', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('member', { username: req.session.user.username, role: req.session.user.role });
>>>>>>> 4bff4f39d0ea1fe06c4f83f61966359d29709113
});

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});