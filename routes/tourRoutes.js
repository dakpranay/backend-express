const express = require('express')
const router = express.Router()
const tourController = require('../controller/tourController')
const authController=require('../controller/authController')
// const reviewController=require('../controller/reviewController')
const reviewRouter=require('./../routes/reviewRoutes')

//to check if a params exists or not in url
// router.param('id',(req,res,next,val)=>{
//     console.log(val)
//     next()
// })

router.use('/:tourId/reviews',reviewRouter)

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAllTours)

router
    .route('/toure-stats')
    .get(tourController.getTourStats)

router
    .route('/monthly-plan/:year')
    .get(authController.protect,
        authController.restrictTo('admin','lead-guide','guide'),
        tourController.getMonthlyPlan
    )

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.createTour
    )

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin'),
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        tourController.deleteTour
    )



module.exports = router