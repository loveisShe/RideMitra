import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prismaClient.js";
import { generateToken } from "../services/userService.js";

passport.use(
    new GoogleStrategy(
        {
            clientID:     process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:  process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email   = profile.emails?.[0]?.value;
                const name    = profile.displayName;
                const picture = profile.photos?.[0]?.value;

                if (!email) return done(null, false, { message: "No email from Google" });

                let user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            name,
                            email,
                            password:       "",
                            role:           "Passenger",
                            profilePicture: picture || null
                        }
                    });
                }

                user._jwt = generateToken(user.id);
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: { id: true, name: true, email: true, role: true, profilePicture: true }
        });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;
