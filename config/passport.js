// config/passport.js - Passport configuration
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://shouhindata.onrender.com/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('🔐 Google Strategy invoked');
  try {
    const email = profile.emails[0].value;
    console.log('📧 Extracted email:', email);

    // Check if email is from farmage.co.jp domain
    if (!email.endsWith('@farmage.co.jp')) {
      console.log('❌ Email domain not allowed:', email);
      return done(null, false, { message: 'Only @farmage.co.jp emails are allowed' });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email: email } });
    console.log(user ? '👤 Existing user found' : '🆕 No user found, creating new one');

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
      console.log('✅ Updated existing user:', user.email);
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
      console.log('🆕 Created new user:', user.email);
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
  console.log('🗂️ Serializing user with ID:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log('🔍 Deserializing user with ID:', id);
  try {
    const user = await User.findByPk(id);
    console.log(user ? '✅ User deserialized successfully' : '❌ User not found');
    done(null, user);
  } catch (error) {
    console.error('❌ Error during deserialization:', error.message);
    done(error, null);
  }
});

module.exports = passport;
