const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Hardcoded users
const users = {
  admin: { username: 'Admin', password: 'pass', role: 'vip' },
  maki: { username: 'Maki', password: '0000', role: 'vip' },
  noname: { username: 'No Name', password: 'basic', role: 'basic' },
};

// Session configuration
app.use(session({
  secret: 'secure-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

//Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to protect routes
function requireAuth(role) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      next();
    } else {
      res.status(403).send('Access Denied');
    }
  };
}

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username].password === password) {
    req.session.user = users[username]; // Store user in session
    res.redirect('/member'); // Redirect to the dynamic member page
  } else {
    res.status(403).send('Invalid username or password');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/member', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('member', { username: req.session.user.username, role: req.session.user.role });
});

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});