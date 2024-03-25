const express=require('express')
const router = express.Router()
const tourController=require('../controller/tourController')

//to check if a params exists or not in url
// router.param('id',(req,res,next,val)=>{
//     console.log(val)
//     next()
// })

router.route('/top-5-cheap').get(tourController.aliasTopTour,tourController.getAllTours)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports=router