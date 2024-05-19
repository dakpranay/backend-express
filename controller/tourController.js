const Tour = require('../models/tourModel')
const APIFeatures=require('../utils/apiFeatures')
const catchAsync =require('../utils/catchAsync')
const AppError=require('../utils/appError')
const factory=require('./handlerFactory')

exports.aliasTopTour=(req,res,next)=>{
    req.query.limit='5'
    req.query.sort='-ratingAverage,price'
    req.query.fields='name,price,ratingAverage'
    next()
}


exports.getAllTours =factory.getAll(Tour)
exports.getTour = factory.getOne(Tour,{path:'reviews',select:''})
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour=factory.deleteOne(Tour)


exports.getTourStats= catchAsync(async(req,res,next)=>{
        const stats=await Tour.aggregate([
            {
                $match:{
                    ratingsAverage:{$gte:4.5}
                }
            },
            {
                $group: {
                    // _id: '$difficulty',
                    // _id:null
                    _id:{$toUpper:'$difficulty'},
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' }, // Corrected field name
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort:{avgPrice:-1}
            }
        ])

        res.status(200).json({
            status: "success",
            data: stats
        })
})

exports.getMonthlyPlan=catchAsync(async(req,res,next)=>{
        const year=req.params.year*1
        const plan=await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    newTourStarts:{$sum:1},
                    tours:{$push:'$name'}
                }
            },
            {
                $addFields:{month:'$_id'}

            },
            {
                $project:{
                    _id:0
                }
            },
            {
                $sort: {newTourStarts:-1}
            },
            {
                $limit:2
            }
        ])

        res.status(200).json({
            status: "success",
            data: plan
        })
})


exports.getTourWithin=catchAsync(async (req,res,next)=>{
    const {distance,latlng,unit}=req.params
    const [lat,lng]=latlng.split(',')

    // 3963.2 is radius of earth in mi && 6378.1 in km 
    const radius= unit==='mi'? distance/3963.2 : distance/6378.1;

    if(!lat || !lng){
        return new AppError('Please provide latitude and logitude in the foramt lat,lng')
    }

    const tours=await Tour.find(
        {startLocation: {$geoWithin:{$centerSphere:[[lng,lat],radius]}}
    })

    res.status(200).json({
        status:"success",
        results:tours.length,
        data:{
            data:tours
        }
    })

})