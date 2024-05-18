const express=require('express')
const router = express.Router()
const userController=require('../controller/userController')
const authController=require('../controller/authController')


router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPasword)

router.get('/me',authController.protect,userController.getMe,userController.getUser)
router.patch('/updateMyPassword',authController.protect,authController.updatePassword)
router.patch('/updateMe',authController.protect,userController.updateMe)
router.delete('/deleteMe',authController.protect,userController.deleteMe)


router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(authController.protect,userController.deleteUser)


module.exports=router