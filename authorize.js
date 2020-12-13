var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const cred = require('./credentials.json');


// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: 'https://www.googleapis.com/auth/gmail.readonly',
    clientSecret: cred.client_secret,
    callbackURL: "http://localhost:3000/:code"
  },
  function(accessToken, refreshToken, profile, done) {
       User.findOrCreate({ googleId: profile.id }, function (err, user) {
         return done(err, user);
       });
  }
));