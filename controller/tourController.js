const multer=require('multer')
const sharp=require('sharp')
const Tour = require('../models/tourModel')
const APIFeatures=require('../utils/apiFeatures')
const catchAsync =require('../utils/catchAsync')
const AppError=require('../utils/appError')
const factory=require('./handlerFactory')

const multerStorage=multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload an image file.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages=upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
])


// if want to upload only images 
// upload.array('images',5)

exports.resizeTourImages=catchAsync(async(req,res,next)=>{
    //cover image
    if(!req.files.imageCover || !req.files.images) return next()

    req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${req.body.imageCover}`);

    //Images
    req.body.images=[]

    await Promise.all(req.files.images.map(async(file,i)=>{
        const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`
        await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename)
    }))
    console.log(req.body.images)

    next()
})

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
        return new AppError('Please provide latitude and logitude in the foramt lat,lng',400)
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

exports.getDistances = catchAsync(async(req,res,next)=>{
    const {latlng,unit}=req.params
    const [lat,lng]=latlng.split(',')

    const multiplier=unit==='mi'?0.000621371:0.001;

    if(!lat || !lng){
        return new AppError('Please provide latitude and logitude in the foramt lat,lng',400)
    }

    const distances=await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[lng*1,lat*1]
                },
                distanceField:'distance',
                distanceMultiplier: multiplier
            },
            
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ])

    res.status(200).json({
        status:"success",
        data:{
            data:distances
        }
    })


})