const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const initializePassport = require('./Backend/Server/passport-config');
const Users = require('./Backend/Models/Users');
const Roles = require('./Backend/Models/Roles');
const Square = require('./Backend/Models/Square')
const { Workbook } = require('exceljs');
const Carousel = require('./Backend/Models/Carousel')
const path = require('path');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;
require('dotenv').config()

var questionModule_carousels
var startDate_square
var endDate_square

var startDate_carousel
var endDate_carousel

const store = new MongoStore({
    collection: 'Sessions',
    uri: process.env.MONGOBD_URI
});


initializePassport(
    passport,
    async username => await Users.findOne({ username: username }),
    async id => await Users.findOne({ _id: id })
);
app.use(bodyParser.json());
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
        await mongoose.connect(process.env.MONGOBD_URI);
        app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
        const squareData = await Square.findOne({}).exec();
        startDate_square = squareData.startDate;
        endDate_square = squareData.endDate;

        // Получаем данные из базы данных для карусели
        const carouselData = await Carousel.findOne({}).exec();
        startDate_carousel = carouselData.startDate;
        endDate_carousel = carouselData.endDate;
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
app.get('/getDataTable_carousel', checkAuthenticatedLogAndRegAndAdmin, (req, res) => {
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
app.get('/square', checkAuthenticated, async (req, res) => {
    var square = await Square.findOne()
    res.render(createPath('views/square-game'), { topics: square.topics });
});
app.get('/carousel', checkAuthenticated, async (req, res) => {
    questionModule_carousel = await Carousel.findOne()
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
app.get('/upload_square', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const users = await Users.find({}, 'username gameProgress.square');

        // Создание новой книги Excel
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Square_Rating');

        // Заголовки столбцов
        const columns = [];
        columns.push({ header: 'Пользователь', key: 'username', width: 20 });
        columns.push({ header: 'Сумма', key: 'square_score', width: 15 });
        for (let i = 1; i <= 25; i++) {
            columns.push({ header: i, key: `Score${i}`, width: 10 });
        }
        worksheet.columns = columns;

        // Запись данных в файл Excel
        users.forEach(user => {
            const row = {
                username: user.username,
                square_score: user.gameProgress.square.score
            };
            for (let i = 1; i <= 25; i++) {
                row[`Score${i}`] = user.gameProgress.square.values[i - 1] || 0; // Проверяем наличие значения и используем его, иначе 0
            }
            worksheet.addRow(row);
        });

        // Генерация временного имени файла
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0'); // Добавляем ведущий ноль, если число меньше 10
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Добавляем ведущий ноль, если месяц меньше 10
        const year = now.getFullYear();
        const formattedDate = `${day}_${month}_${year}`;
        const fileName = `square_rating_${formattedDate}.xlsx`;

        // Генерация данных Excel в формате база64
        const excelData = await workbook.xlsx.writeBuffer();

        // Отправка данных Excel в ответе
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(excelData);
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).send('Error generating Excel');
    }
});
app.get('/upload_carousel', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    try {
        const users = await Users.find({}, 'username gameProgress.carousel');
        const data_total_questions = await Carousel.findOne({}, 'total_questions')
        const total_questions = data_total_questions.total_questions
        // Создание новой книги Excel
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Carousel_Rating');

        // Заголовки столбцов
        const columns = [];
        columns.push({ header: 'Пользователь', key: 'username', width: 20 });
        columns.push({ header: 'Сумма', key: 'carousel_score', width: 15 });
        for (let i = 1; i <= total_questions; i++) {
            columns.push({ header: i, key: `Score${i}`, width: 10 });
        }
        worksheet.columns = columns;

        // Добавление данных пользователей в таблицу
        users.forEach(user => {
            const row = {
                username: user.username,
                carousel_score: user.gameProgress.carousel.score
            };

            for (let i = 1; i <= total_questions; i++) {
                row[`Score${i}`] = user.gameProgress.carousel.values[i - 1] || 0; // Проверяем наличие значения и используем его, иначе 0
            }
            worksheet.addRow(row);
        });

        // Генерация временного имени файла
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0'); // Добавляем ведущий ноль, если число меньше 10
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Добавляем ведущий ноль, если месяц меньше 10
        const year = now.getFullYear();
        const formattedDate = `${day}_${month}_${year}`;
        const fileName = `carousel_rating_${formattedDate}.xlsx`;

        // Генерация данных Excel в формате база64
        const excelData = await workbook.xlsx.writeBuffer();

        // Отправка данных Excel в ответе
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(excelData);
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).send('Error generating Excel');
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
app.post('/save_question_carousel', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    await Carousel.findOneAndUpdate({
        score_first_question: req.body.score_first_question,
        score_failure: req.body.score_failure,
        score_success: req.body.score_success,
        total_questions: req.body.total_questions,
        questions: req.body.questions
    });
    res.redirect('/question_carousel');
});
app.get('/get_question_carousel', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    const questionsData = await Carousel.findOne({}, 'score_first_question score_failure score_success total_questions questions')
    res.json(questionsData);
});
app.get('/question_carousel', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    res.render(createPath('views/question_carousel'));
});
app.get('/question_square', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    var square = await Square.findOne()
    console.log(square)
    res.render(createPath('views/question_square'), { topics: square.topics });
});
app.post('/save_square', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    await Square.findOneAndUpdate({ topics: req.body.topics })
    res.redirect('/question_square')
});
app.post('/signin', checkAuthenticatedLogAndReg, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}));
app.post('/sendAnswer_Square', checkAuthenticated, async (req, res) => {
    const { rowIndex, cellIndex, inputValue, pointsValue } = req.body
    console.log(rowIndex)
    console.log(cellIndex)
    console.log(inputValue)
    console.log(pointsValue)
    var square = await Square.findOne()
    var answer = (inputValue == square.topics[rowIndex].questions[cellIndex].answer)
    if (answer) {
        req.user.gameProgress.square.values[(rowIndex) * 5 + (cellIndex)] = pointsValue
        req.user.gameProgress.square.score += pointsValue
    }
    else {
        req.user.gameProgress.square.values[(rowIndex) * 5 + (cellIndex)] = 0
    }
    req.user.save()
    res.json(answer)
});
app.post('/sendAnswer_Carousel', checkAuthenticated, (req, res) => {
    const { idxQuestion, answerUser, pointsValue } = req.body
    var answer = answerUser === questionModule_carousel.questions[idxQuestion].answer
    req.user.gameProgress.carousel.values[idxQuestion] = answer ? pointsValue : 0
    req.user.gameProgress.carousel.score += answer ? pointsValue : 0
    req.user.save()
    if (idxQuestion + 1 < questionModule_carousel.total_questions) {
        res.json({
            answer: answer,
            total_questions: questionModule_carousel.total_questions,
            score_failure: questionModule_carousel.score_failure,
            score_success: questionModule_carousel.score_success,
            question: questionModule_carousel.questions[idxQuestion + 1].question
        })
        return
    }
    res.json({
        answer: answer,
        total_questions: questionModule_carousel.total_questions,
        score_failure: questionModule_carousel.score_failure,
        score_success: questionModule_carousel.score_success,
        question: 'Тест закончен'
    })
});
app.get('/getProgress_square', checkAuthenticated, (req, res) => {
    res.json(req.user.gameProgress.square);
});


app.get('/getTimer_carousel', checkAuthenticated, (req, res) => {
    res.json({ startDate: startDate_carousel, endDate: endDate_carousel })
})
app.get('/getTimer_square', checkAuthenticated, (req, res) => {
    res.json({ startDate: startDate_square, endDate: endDate_square })
})

app.post('/setTime_square', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    startDate_square = req.body.startTimeSquare;
    endDate_square = req.body.endTimeSquare;
    try {
        // Находим и обновляем игру с указанным названием
        await Square.findOneAndUpdate({ startDate: startDate_square, endDate: endDate_square });
        // После успешного обновления перенаправляем пользователя обратно на страницу администратора
        res.redirect('/admin');
    } catch (error) {
        // Если произошла ошибка, выводим ее и отправляем статус ошибки на клиент
        console.error('Ошибка при обновлении времени для игры:', error);
        res.status(500).send('Ошибка при обновлении времени для игры');
    }
})
app.post('/setTime_carousel', checkAuthenticatedLogAndRegAndAdmin, async (req, res) => {
    startDate_carousel = req.body.startTimeCarousel;
    endDate_carousel = req.body.endTimeCarousel;
    try {
        // Находим и обновляем игру с указанным названием
        await Carousel.findOneAndUpdate({ startDate: startDate_carousel, endDate: endDate_carousel });
        // После успешного обновления перенаправляем пользователя обратно на страницу администратора
        res.redirect('/admin');
    } catch (error) {
        // Если произошла ошибка, выводим ее и отправляем статус ошибки на клиент
        console.error('Ошибка при обновлении времени для игры:', error);
        res.status(500).send('Ошибка при обновлении времени для игры');
    }
})

app.post('/addbonus_square', checkAuthenticated, (req, res) => {
    const { score } = req.body
    req.user.gameProgress.square.score += score
    req.user.save()
})
app.post('/signup', async (req, res) => {
    try {
        const { username, password, confirm_password } = req.body
        if (username == '') {
            return res.render(path.join(__dirname, 'Frontend/views/registration'), { error_message: 'Введите имя пользователя!' });
        }
        if (password == '') {
            return res.render(path.join(__dirname, 'Frontend/views/registration'), { error_message: 'Введите пароль!' });
        }
        if (confirm_password == '') {
            return res.render(path.join(__dirname, 'Frontend/views/registration'), { error_message: 'Введите повторение пароля!' });
        }
        if (password != confirm_password) {
            return res.render(path.join(__dirname, 'Frontend/views/registration'), { error_message: 'Пароли не совпадают!' });
        }
        const candidate = await Users.findOne({ username })
        if (candidate) {
            return res.render(path.join(__dirname, 'Frontend/views/registration'), { error_message: 'Пользователь с таким именем уже существует!' });
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
app.delete('/logout', checkAuthenticated, (req, res) => {
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
