const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const initializePassport = require('./passport-config');
const Users = require('../Models/Users');
const Roles = require('../Models/Roles');
const path = require('path');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const questionModule = require('./data');
const app = express();
const PORT = 3000;
const MONGOBD_URI = 'mongodb+srv://admin:admin@olympiadcluster.xubd4ua.mongodb.net/OlympiadDB?retryWrites=true&w=majority&appName=OlympiadCluster';
var topics = questionModule.getTopics();
const store = new MongoStore({
    collection: 'Sessions',
    uri: MONGOBD_URI
});


initializePassport(
    passport,
    async username => await Users.findOne({ username: username }),
    async id => await Users.findOne({ _id: id })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'some_secret_key',
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(flash());
app.set('view engine', 'ejs');
const start = async () => {
    try {
        await mongoose.connect(MONGOBD_URI);
        app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
    } catch (e) {
        console.error("Ошибка при запуске сервера:", e);
    }
};
start();
app.use(express.static('Frontend'));
const createPath = (page) => path.resolve('Frontend', `${page}.ejs`);
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.username = req.user ? req.user.username : 'Guest';
    res.locals.role = req.user ? req.user.role : null;
    next();
});
app.get('/topics_square', (req, res) => {
    res.json(topics);
});
app.get('/', (req, res) => {
    res.render(createPath('views/main'));
});
app.get('/square', checkAuthenticated, (req, res) => {
    res.render(createPath('views/square-game'), { topics: topics });
});
app.get('/carousel', checkAuthenticated, (req, res) => {
    res.render(createPath('views/carousel-game'));
});
app.get('/signup', checkAuthenticatedLogAndReg, (req, res) => {
    res.render(createPath('views/registration'), { error_message: null });
});
app.get('/signin', checkAuthenticatedLogAndReg, (req, res) => {
    res.render(createPath('views/login'), { error_message: null });
});
app.get('/admin', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const users = await Users.find();
        res.render(createPath('views/admin'), { users: users });
    } catch (err) {
        console.error('Ошибка при получении списка пользователей:', err);
        res.status(500).send('Ошибка при загрузке пользователей.');
    }
});
app.get('/admin/:id/delete', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        await Users.findByIdAndDelete(userId);
        res.redirect('/admin');
    } catch (err) {
        console.error('Ошибка при удалении пользователя:', err);
        res.status(500).send('Ошибка при удалении пользователя.');
    }
});
app.get('/:id/edit', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Users.findById(userId);
        res.render(createPath('views/admin_edit_user'), { user: user });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования пользователя:', err);
        res.status(500).send('Ошибка при загрузке формы редактирования пользователя.');
    }
});
app.post('/admin/:id/update', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 7);
        await Users.findByIdAndUpdate(userId, { username: username, password: hashedPassword });
        res.redirect('/admin');
    } catch (err) {
        console.error('Ошибка при сохранении изменений пользователя:', err);
        res.status(500).send('Ошибка при сохранении изменений пользователя.');
    }
});
app.get('/admin/add', checkAuthenticatedLogAndRegAndAdmin, (req, res) => {
    res.render(createPath('views/admin_add_user'));
});
app.post('/admin/add', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await Users.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Пользователь с таким именем уже существует');
        }
        const hashedPassword = await bcrypt.hash(password, 7);
        const newUser = new Users({ username, password: hashedPassword, role: 'USER' });
        await newUser.save();
        res.redirect('/admin');
    } catch (err) {
        console.error('Ошибка при добавлении нового пользователя:', err);
        res.status(500).send('Ошибка при добавлении нового пользователя.');
    }
});
app.get('/rating', checkAuthenticated, (req, res) => {
    res.render(createPath('views/rating'));
});
app.post('/signin', checkAuthenticatedLogAndReg, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}));
app.post('/sendAnswer_Square', (req, res) => {
    const { rowIndex, cellIndex, inputValue, pointsValue } = req.body
    var answer = (inputValue == topics[rowIndex - 1].questions[cellIndex - 1].answer)
    if (answer) {
        req.user.gameProgress.square.values[(rowIndex - 1) * 5 + (cellIndex - 1)] = pointsValue
        req.user.gameProgress.square.score += pointsValue
    }
    else {
        req.user.gameProgress.square.values[(rowIndex - 1) * 5 + (cellIndex - 1)] = 0
    }
    req.user.save()
    res.json(answer)
});
app.get('/getProgress_square', (req, res) => {
    res.json(req.user.gameProgress.square);
});
app.post('/signup', async (req, res) => {
    try {
        const { username, password, confirm_password } = req.body
        if (username == '') {
            return res.render(path.join(__dirname, '/../../Frontend/views/registration'), { error_message: 'Введите имя пользователя!' });
        }
        if (password == '') {
            return res.render(path.join(__dirname, '/../../Frontend/views/registration'), { error_message: 'Введите пароль!' });
        }
        if (confirm_password == '') {
            return res.render(path.join(__dirname, '/../../Frontend/views/registration'), { error_message: 'Введите повторение пароля!' });
        }
        if (password != confirm_password) {
            return res.render(path.join(__dirname, '/../../Frontend/views/registration'), { error_message: 'Пароли не совпадают!' });
        }
        const candidate = await Users.findOne({ username })
        if (candidate) {
            return res.render(path.join(__dirname, '/../../Frontend/views/registration'), { error_message: 'Пользователь с таким именем уже существует!' });
        }
        const hashPassword = bcrypt.hashSync(password, 7);
        const user = new Users({ username, password: hashPassword, role: 'USER' })
        await user.save()
        return res.redirect('/')
    }
    catch (e) {
        console.log(e)
        res.status(400).json({ message: 'Signup error' })
    }
});
app.delete('/logout', (req, res) => {
    const sessionId = req.sessionID;
    store.destroy(sessionId, (error) => {
        if (error) {
            console.error('Ошибка при удалении сеанса из базы данных:', error);
        }
        res.redirect('/');
    });
});
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/signin')
}
function checkAuthenticatedLogAndReg(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    return next()
}
function checkNotAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/signin')
    }
    next()
}
function checkAuthenticatedLogAndRegAndAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role != 'ADMIN') {
        return res.redirect('/')
    }
    return next()
}
module.exports = {
    checkAuthenticated: checkAuthenticated,
    checkNotAuthenticated: checkNotAuthenticated
};
