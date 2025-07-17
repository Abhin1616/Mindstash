import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";
import cleanName from "../utils/cleanName.js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;

                const existingUser = await User.findOne({ email });

                if (existingUser) {
                    // ✅ If manually registered (has password hash), block Google login
                    if (existingUser.hash) {
                        return done(
                            null,
                            false,
                            { message: "Email already registered manually. Please use email/password login." }
                        );
                    }

                    // ✅ Allow if already registered via Google
                    return done(null, existingUser);
                }

                // ✅ First-time Google login
                const newUser = new User({
                    name: cleanName(profile.displayName),
                    email,
                    profileCompleted: false,
                });

                await newUser.save();
                return done(null, newUser);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);
