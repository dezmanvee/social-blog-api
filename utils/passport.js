import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { User } from "../models/User/User.js";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import { Strategy as GoogleOAuth2Strategy } from "passport-google-oauth20";

//! Configure passport for Local Strategy

passport.use(
  new LocalStrategy(
    {
      usernameField: "username", // either email or username
    },
    async (username, password, done) => {
      try {
        // check if user exist
        const user = await User.findOne({ username });

        if (!user) {
          return done(null, false, { message: "Invalid login details" });
        }

        //check the correctness of password
        const match = await bcrypt.compare(password, user.password);

        if (match) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid login details" });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

//! Configure passport for JWT Strategy

//options for JWT config
const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      let authToken = null;
      if (req && req.cookies) {
        authToken = req.cookies["authToken"];
        
        return authToken;
      }
    },
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async(jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

//! Configure passport for Google OAuth Strategy

passport.use(
  new GoogleOAuth2Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL

    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //check if user exists
        let user = await User.findOne({
          googleId: profile.id,
        });
        // Grab the properties of the profile data
        const { id, displayName, name, _json: { picture }, } = profile;

        //If email is available
        let email = "";
        if (Array.isArray(profile?.emails) && profile?.emails.length > 0) {
          email = profile?.emails[0].value;
        }

        //if user doesn't exist, create one
        if (!user) {
          user = await User.create({
            googleId: id,
            username: displayName,
            profilePicture: picture,
            email: email,
            authMethod: "google",
          });
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);
export default passport;
