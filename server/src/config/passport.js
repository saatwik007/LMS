const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

let isGoogleEnabled = false;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this googleId
      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      // Check if user exists with the same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          if (!user.profilePic && profile.photos?.[0]?.value) {
            user.profilePic = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }
      }

      // Create new user
      user = await User.create({
        username: profile.displayName?.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now().toString(36),
        email: email || `${profile.id}@google.oauth`,
        googleId: profile.id,
        profilePic: profile.photos?.[0]?.value || '',
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));
isGoogleEnabled = true;
} else {
  console.warn('Google OAuth credentials not set — Google login disabled.');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
module.exports.isGoogleEnabled = isGoogleEnabled;
