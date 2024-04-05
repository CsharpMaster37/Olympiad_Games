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
const questionModule_square = require('./data-square');
const questionModule_carousel = require('./data-carousel');
const app = express();
const PORT = 3000;
const MONGOBD_URI = 'mongodb+srv://admin:admin@olympiadcluster.xubd4ua.mongodb.net/OlympiadDB?retryWrites=true&w=majority&appName=OlympiadCluster';
var topics = questionModule_square.getTopics();

var startDate_square;
var endDate_square;

var startDate_carousel;
var endDate_carousel;

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
app.get('/getDataTable_carousel', (req, res) => {
    var questions = questionModule_carousel.questions.map(questions => questions.question);
    res.json({
        total_questions: questionModule_carousel.total_questions,
        score_first_question: questionModule_carousel.score_first_question,
        questions: questions,
        gameProgress: req.user.gameProgress.carousel,
        score_failure: questionModule_carousel.score_failure,
        score_success: questionModule_carousel.score_success
    });
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
        const users = await Users.find({}, 'username role');
        res.render(createPath('views/admin'), { users: users });
    } catch (err) {
        console.error('Ошибка при получении списка пользователей:', err);
        res.status(500).send('Ошибка при загрузке пользователей.');
    }
});
app.get('/admin/:id/user_delete', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        await Users.findByIdAndDelete(userId);
        res.redirect('/admin');
    } catch (err) {
        console.error('Ошибка при удалении пользователя:', err);
        res.status(500).send('Ошибка при удалении пользователя.');
    }
});
app.get('/admin/:id/progress_delete_square', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Users.findById(userId)
        user.gameProgress.square.values = []
        user.gameProgress.square.score = 0
        await user.save();
        res.redirect('/admin');
    } catch (err) {
        console.error('Ошибка при удалении прогресса:', err);
        res.status(500).send('Ошибка при удалении прогресса.');
    }
});
app.get('/admin/:id/progress_delete_carousel', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Users.findById(userId)
        user.gameProgress.carousel.values = []
        user.gameProgress.carousel.score = 0
        await user.save();
        res.redirect('/admin');
    } catch (err) {
        console.error('Ошибка при удалении прогресса:', err);
        res.status(500).send('Ошибка при удалении прогресса.');
    }
});
app.get('/admin/progress_delete_carousel_all', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    const users = await Users.find();
    users.forEach(user => {
        user.gameProgress.carousel.values = []
        user.gameProgress.carousel.score = 0
        user.save()
    });
    res.redirect('/admin');
})
app.get('/admin/progress_delete_square_all', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    const users = await Users.find();
    users.forEach(user => {
        user.gameProgress.square.values = []
        user.gameProgress.square.score = 0
        user.save()
    });
    res.redirect('/admin');
})
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
app.get('/upload_results_all', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {

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
app.get('/rating_square', checkAuthenticated, async (req, res) => {
    try {
        const users = await Users.find({}, 'username gameProgress.square');
        const progress = users.map(user => ({ username: user.username, squareProgress: user.gameProgress.square }));
        // Сортировка по squareProgress в порядке убывания
        progress.sort((a, b) => b.squareProgress.score - a.squareProgress.score);
        res.render(createPath('views/rating_square'), { progress: progress, href: 'rating_square' });
    } catch (err) {
        console.error('Ошибка при получении прогресса квадрата для всех пользователей:', err);
        res.status(500).send('Ошибка при получении прогресса квадрата для всех пользователей.');
    }
});
app.get('/rating_carousel', checkAuthenticated, async (req, res) => {
    try {
        const users = await Users.find({}, 'username gameProgress.carousel'); // Находим всех пользователей и выбираем только их имена и прогресс игр
        const progress = users.map(user => ({ username: user.username, carouselProgress: user.gameProgress.carousel })); // Формируем массив объектов с именем пользователя и их прогрессом       
        // Сортировка по carouselProgressScore в порядке убывания
        progress.sort((a, b) => b.carouselProgress.score - a.carouselProgress.score);
        res.render(createPath('views/rating_carousel'), { progress: progress, href: 'rating_carousel', count: questionModule_carousel.total_questions });
    } catch (err) {
        console.error('Ошибка при получении прогресса квадрата для всех пользователей:', err);
        res.status(500).send('Ошибка при получении прогресса квадрата для всех пользователей.');
    }
});
app.get('/rating_all', checkAuthenticated, async (req, res) => {
    try {
        const users = await Users.find({}, 'username gameProgress.square.score gameProgress.carousel.score'); // Находим всех пользователей и выбираем только их имена и прогресс игр
        const progress = users.map(user => ({
            username: user.username,
            squareProgressScore: user.gameProgress.square.score,
            carouselProgressScore: user.gameProgress.carousel.score,
            totalProgressScore: user.gameProgress.square.score + user.gameProgress.carousel.score
        })); // Формируем массив объектов с именем пользователя и их прогрессом      
        // Сортировка по totalProgressScore в порядке убывания
        progress.sort((a, b) => b.totalProgressScore - a.totalProgressScore);
        res.render(createPath('views/rating_all'), { progress: progress, href: 'rating_all' });
    } catch (err) {
        console.error('Ошибка при получении прогресса квадрата для всех пользователей:', err);
        res.status(500).send('Ошибка при получении прогресса квадрата для всех пользователей.');
    }
});
app.get('/question_carousel', checkAuthenticated, (req, res) => {
    res.render(createPath('views/question_carousel'));
});
app.get('/question_square', checkAuthenticated, (req, res) => {
    res.render(createPath('views/question_square'));
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
app.post('/sendAnswer_Carousel', (req, res) => {
    const { idxQuestion, answerUser, pointsValue } = req.body
    var answer = answerUser === questionModule_carousel.questions[idxQuestion].answer
    req.user.gameProgress.carousel.values[idxQuestion] = answer ? pointsValue : 0
    req.user.gameProgress.carousel.score += answer ? pointsValue : 0
    req.user.save()
    res.json({
        answer: answer,
        total_questions: questionModule_carousel.total_questions,
        score_failure: questionModule_carousel.score_failure,
        score_success: questionModule_carousel.score_success,
        question: questionModule_carousel.questions[idxQuestion + 1].question
    })
});
app.get('/getProgress_square', (req, res) => {
    res.json(req.user.gameProgress.square);
});


app.get('/getTimer_carousel', (req, res) => {
    res.json({ startDate: startDate_carousel, endDate: endDate_carousel })
})
app.get('/getTimer_square', (req, res) => {
    res.json({ startDate: startDate_square, endDate: endDate_square })
})

app.post('/setTime_square', (req, res) => {
    startDate_square = req.body.startTimeSquare;
    endDate_square = req.body.endTimeSquare;
    res.redirect('/admin')
})
app.post('/setTime_carousel', (req, res) => {
    startDate_carousel = req.body.startTimeCarousel;
    endDate_carousel = req.body.endTimeCarousel;
    res.redirect('/admin')
})

app.post('/addbonus_square', (req, res) => {
    const { score } = req.body
    req.user.gameProgress.square.score += score
    req.user.save()
})
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
