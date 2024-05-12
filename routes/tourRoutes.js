const express = require('express')
const router = express.Router()
const tourController = require('../controller/tourController')
const authController=require('../controller/authController')
//to check if a params exists or not in url
// router.param('id',(req,res,next,val)=>{
//     console.log(val)
//     next()
// })

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAllTours)

router
    .route('/toure-stats')
    .get(tourController.getTourStats)

router
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan)

router
    .route('/')
    .get(
        authController.protect,
        tourController.getAllTours
    )
    .post(tourController.createTour)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        tourController.deleteTour
    )

module.exports = router