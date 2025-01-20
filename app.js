const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();

// Set up PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgre_g7aq_user:JpDqj0nTwtC2A8YuGUFAch5tXJazBrP3@dpg-cu6hp3lumphs73cufok0-a.singapore-postgres.render.com/postgre_g7aq',
  ssl: { rejectUnauthorized: false },
});

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: 'secure-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to protect routes
function requireAuth(role) {
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
  };
}

// Registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database with the hashed password
    const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)';
    await pool.query(query, [username, hashedPassword, 'basic']);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(400).send('Error registering user. Username might already be taken.');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Compare hashed password with entered password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        req.session.user = { username: user.username, role: user.role };
        const redirectPage = user.role === 'vip' ? '/member?vip=true' : '/member?vip=false';
        return res.redirect(redirectPage);
      }
    }
    //res.status(403).send('Invalid username or password');
    res.status(403).send(`
      <h1>Welcomeq and all</h1>
      <p>to your doom</p>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Serve member page
app.get('/member', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  const { username, role } = req.session.user;
  res.render('member', { username, role });
});

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => { });
