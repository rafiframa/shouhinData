// routes/authRoutes.js - Authentication routes
const express = require('express');
const passport = require('../config/passport');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  const error = req.flash('error')[0];
  res.render('login', { 
    title: 'Login',
    error: error
  });
});

// Google OAuth
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    failureFlash: true 
  }),
  (req, res) => {
    // Check if user is active
    if (!req.user.is_active) {
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });
      req.flash('error', 'Your account has been deactivated. Please contact an administrator.');
      return res.redirect('/login');
    }
    
    res.redirect('/');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;