const User = require('./../Models/Users')
const Role = require('./../Models/Role')
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator')
var path = require('path');
var jwt = require('jsonwebtoken');
const { secret } = require('./config')



const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, { expiresIn: '24h' })
}

class authController {
    async signup(req, res) {
        try {
            /* const errors = validationResult(req)
            if(!errors.isEmpty())
            {
                return res.status(400).json({message: 'Ошибка при регистрации!', errors})
            } */
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
            const candidate = await User.findOne({ username })
            if (candidate) {
                return res.render(path.join(__dirname, '/../../Frontend/Register/registration'), { error_message: 'Пользователь с таким именем уже существует!' });
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({ value: 'USER' })
            const user = new User({ username, password: hashPassword, roles: [userRole.value] })
            await user.save()
            return res.redirect('/signup')
        }
        catch (e) {
            console.log(e)
            res.status(400).json({ message: 'Signup error' })
        }
    }
    async signin(req, res) {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ username })
            if (username == '') {
                return res.render(path.join(__dirname, '/../../Frontend/Login/login'), { error_message: 'Введите имя пользователя!' });
            }
            if (password == '') {
                return res.render(path.join(__dirname, '/../../Frontend/Login/login'), { error_message: 'Введите пароль!' });
            }
            if (!user) {
                /* usernameField.addEventListener("change", validationMessage) */
                return res.render(path.join(__dirname, '/../../Frontend/Login/login'), { error_message: `Пользователь ${username} не найден!` });
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                //res.redirect('/signin')
                return res.render(path.join(__dirname, '/../../Frontend/Login/login'), { error_message: 'Неверный пароль!' });
            }
            const token = generateAccessToken(user._id, user.roles)
            return res.redirect('/')
        }
        catch (e) {
            console.log(e)
            res.status(400).json({ message: 'Singin error' })
        }
    }
    async getUsers(req, res) {
        try {
            const users = await User.find()
            res.json(users)
        }
        catch (e) {
            console.log(e)
            res.status(400).json()
        }
    }
}

module.exports = new authController()