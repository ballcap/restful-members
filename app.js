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
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/style.css" />
        <title>MyPage | Error</title>
      </head>
      <body>
        <section>
            <div>
              <p>Invalid username or password.</p>
              <p>Click <a href="/">here</a> to try again.</p>
            </div>
        </section>
      <footer>
        <p>Tired of bad works? Check out our work</p>
        <p>&copy; MakiAmaa Works 2025. All rights reserved</p>
      </footer>
      </body>
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

//Serve Forgot Password page
app.get('/forgot_password', (req, res) => {
  res.send(`
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/style.css" />
      <title>Forgot Password</title>
    </head>
    <body>
      <section>
        <form method="post" action="/reset_password">
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link.</p>
          <label>
            <span>Email</span>
            <input type="email" name="email" placeholder="Email" required />
          </label>
          <button type="submit">Send Reset Link</button>
        </form>
      </section>
      <footer>
        <p>Tired of bad works? Check out our work</p>
        <p>&copy; MakiAmaa Works 2025. All rights reserved</p>
      </footer>
    </body>
  `);
});

// Reset Password Route
app.post('/reset_password', async (req, res) => {
  const { email } = req.body;
  try {
    // Placeholder logic to handle reset password
    // TODO: Implement email sending logic for reset link
    console.log(`Password reset request received for email: ${email}`);
    res.send(`
      <p>If an account exists with the provided email, a reset link has been sent.</p>
      <p>Click <a href="/">here</a> to return to the login page.</p>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing request');
  }
});

app.listen(3000, () => { });
