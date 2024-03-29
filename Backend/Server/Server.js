const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session)
const passport = require('passport');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const initializePassport = require('./passport-config');
const Users = require('../Models/Users');
const Roles = require('../Models/Roles');
const path = require('path');
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const questionModule = require('./data');
var topics = questionModule.getTopics()
const MONGOBD_URI = 'mongodb+srv://admin:admin@olympiadcluster.xubd4ua.mongodb.net/OlympiadDB?retryWrites=true&w=majority&appName=OlympiadCluster'

const app = express();
const PORT = 3000;

const store = new MongoStore({
    collection: 'Sessions',
    uri: MONGOBD_URI
})

initializePassport(
    passport,
    async username => await Users.findOne({ username: username }),
    async id => await Users.findOne({ _id: id })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'somen_secret_key', // Секретный ключ для подписи идентификатора сеанса
    resave: false, // Не сохранять сеанс, если он не был изменен
    saveUninitialized: false, // Не сохранять новые, но не измененные сеансы
    store: store
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))
app.use(flash());
app.set('view engine', 'ejs');


// Подключение к базе данных и запуск сервера
const start = async () => {
    try {
        await mongoose.connect(MONGOBD_URI);
        app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
    } catch (e) {
        console.error("Ошибка при запуске сервера:", e);
    }
};

start();

// Подключение статических файлов
const staticPaths = [
    'Frontend',
    'Frontend/Rating',
    'Frontend/Common_Elements',
    'Frontend/Square_game',
    'Frontend/Carousel_game',
    'Frontend/Register',
    'Frontend/Login',
    'Frontend/Main',
    'Frontend/AdminPanel',
];
staticPaths.forEach(path => {
    app.use(express.static(path));
});

// Определение маршрутов
const createPath = (page) => path.resolve('Frontend', `${page}.ejs`);

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.username = req.user ? req.user.username : 'Guest';
    res.locals.role = req.user ? req.user.role : null;
    next();
});


app.get('/topics_square', (req, res) => {
    res.json(topics); // Отправляем массив topics в виде JSON
});

// При обработке маршрутов, не нужно передавать isAuthenticated в каждом вызове res.render
app.get('/', (req, res) => {
    res.render(createPath('Main/index'));
});

app.get('/square', checkAuthenticated, (req, res) => {
    res.render(createPath('Square_game/game_index'), { topics: topics });
});

app.get('/carousel', checkAuthenticated, (req, res) => {
    res.render(createPath('Carousel_game/index_MathematicalCarousel'));
});

app.get('/signup', checkAuthenticatedLogAndReg, (req, res) => {
    res.render(createPath('Register/registration'), { error_message: null });
});

app.get('/signin', checkAuthenticatedLogAndReg, (req, res) => {
    res.render(createPath('Login/login'), { error_message: null });
});

app.get('/admin', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const users = await Users.find({}, 'username'); // Получаем список пользователей с их именами
        res.render(createPath('AdminPanel/admin'), { users: users });
    } catch (err) {
        console.error('Ошибка при получении списка пользователей:', err);
        res.status(500).send('Ошибка при загрузке пользователей.');
    }
});

// Обработка запроса на удаление пользователя
app.delete('/admin/:id', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        await Users.findByIdAndDelete(userId); // Удаляем пользователя по ID
        res.redirect('/admin');
    } catch (err) {
        console.error('Ошибка при удалении пользователя:', err);
        res.status(500).send('Ошибка при удалении пользователя.');
    }
});

// Обработка запроса на редактирование пользователя (показ формы редактирования)
app.get('/admin/:id/edit', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Users.findById(userId); // Находим пользователя по ID
        res.render(createPath('AdminPanel/admin_edit_user'), { user: user });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования пользователя:', err);
        res.status(500).send('Ошибка при загрузке формы редактирования пользователя.');
    }
});

// Обработка запроса на сохранение изменений пользователя
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

// Маршрут для отображения формы добавления нового пользователя
app.get('/admin/add', checkAuthenticatedLogAndRegAndAdmin, (req, res) => {
    res.render(createPath('AdminPanel/admin_add_user'));
});

// Обработка запроса на добавление нового пользователя
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
    res.render(createPath('Rating/rating'));
});

app.post('/signin', checkAuthenticatedLogAndReg, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}))

app.post('/sendAnswer_Square', (req, res) => {
    const { rowIndex, cellIndex, inputValue } = req.body
    var answer = (inputValue == topics[rowIndex - 1].questions[cellIndex - 1].answer)
    res.json(answer)
})

app.post('/signup', async (req, res) => {
    try {
        const { username, password, confirm_password } = req.body
        if (username == '') {
            return res.render(path.join(__dirname, '/../../Frontend/Register/registration'), { error_message: 'Введите имя пользователя!' });
        }
        if (password == '') {
            return res.render(path.join(__dirname, '/../../Frontend/Register/registration'), { error_message: 'Введите пароль!' });
        }
        if (confirm_password == '') {
            return res.render(path.join(__dirname, '/../../Frontend/Register/registration'), { error_message: 'Введите повторение пароля!' });
        }
        if (password != confirm_password) {
            return res.render(path.join(__dirname, '/../../Frontend/Register/registration'), { error_message: 'Пароли не совпадают!' });
        }
        const candidate = await Users.findOne({ username })
        if (candidate) {
            return res.render(path.join(__dirname, '/../../Frontend/Register/registration'), { error_message: 'Пользователь с таким именем уже существует!' });
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
