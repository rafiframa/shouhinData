// config/passport.js - Passport configuration
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // Check if email is from farmage.co.jp domain
    if (!email.endsWith('@farmage.co.jp')) {
      return done(null, false, { message: 'Only @farmage.co.jp emails are allowed' });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email: email } });

    if (user) {
      // Update existing user
      user = await user.update({
        google_id: profile.id,
        profile_picture: profile.photos[0]?.value,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: new Date(Date.now() + 36000000), // 10 hour from now
        last_login_at: new Date()
      });
    } else {
      // Create new user with default role 'regular'
      user = await User.create({
        google_id: profile.id,
        email: email,
        name: profile.displayName ?? email.split('@')[0],
        profile_picture: profile.photos[0]?.value,
        role: 'regular',
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: new Date(Date.now() + 3600000),
        is_active: true,
        last_login_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return done(null, user);
  } catch (error) {
    const email = profile?.emails?.[0]?.value || 'unknown';
    console.error('❌ Error in Google Strategy:', {
      error: error.message,
      stack: error.stack,
      email: email,
      profileId: profile?.id
    });
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;