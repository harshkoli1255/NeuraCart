const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
            try {
                const user = await User.findOne({ email: email });

                if (!user) {
                    return done(null, false, { message: "That email is not registered" });
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Password incorrect" });
                }
            } catch (error) {
                return done(error);
            }
        })
    );

    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
                callbackURL: '/auth/google/callback'
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ googleId: profile.id });
                    if (user) return done(null, user);

                    user = await User.findOne({ email: profile.emails[0].value });
                    if (user) {
                        user.googleId = profile.id;
                        if (!user.avatar && profile.photos && profile.photos[0]) {
                            user.avatar = profile.photos[0].value;
                        }
                        await user.save();
                        return done(null, user);
                    }

                    const newUser = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : ''
                    });

                    await newUser.save();
                    done(null, newUser);
                } catch (err) {
                    console.error(err);
                    done(err, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
