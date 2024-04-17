const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

async function initialize(passport, getUserByUsername, getUserById) {
    const authenticateUsers = async (username, password, done) => {
        try {
            const user = await getUserByUsername(username.toUpperCase());
            if (!user) {
                return done(null, false, { message: 'Пользователь не найден!' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Пароль неверный!' });
            }
        } catch (error) {
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUsers));

    passport.serializeUser((user, done) => {
        done(null, { id: user._id, username: user.username });
    });

    passport.deserializeUser(async (data, done) => {
        try {
            const user = await getUserById(data.id);
            if (!user) {
                return done(null, false, { message: 'Пользователь не найден!' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    });
}


module.exports = initialize