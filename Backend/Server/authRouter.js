const Router = require('express')
const router = new Router()
const controller = require('./authController')
const {check} = require('express-validator')

router.post('/signup',[
    check('username', 'Имя пользователя не может быть пустым!').notEmpty(),
    check('password', 'Пароль не может быть менее 6 символов!').isLength({min:6})
], controller.signup)
router.post('/signin', controller.signin)
router.get('/users', controller.getUsers)

module.exports = router