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

// Initiate Google OAuth
router.get('/auth/google',
  (req, res, next) => {
    console.log('➡️ /auth/google - Initiating Google OAuth');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/auth/google/callback',
  (req, res, next) => {
    console.log('⬅️ /auth/google/callback - Handling Google OAuth callback');
    next();
  },
  passport.authenticate('google', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res) => {
    console.log('✅ Google authentication successful');
    console.log('🔍 Authenticated user:', {
      id: req.user?.id,
      email: req.user?.email,
      is_active: req.user?.is_active
    });

    // Check if user is active
    if (!req.user.is_active) {
      console.log('⛔ User is not active, logging out');
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });
      req.flash('error', 'Your account has been deactivated. Please contact an administrator.');
      return res.redirect('/login');
    }

    console.log('➡️ Redirecting to home page');
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