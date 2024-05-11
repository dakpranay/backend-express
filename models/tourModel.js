const mongoose = require('mongoose')
const slugify = require('slugify')
const validator=require('validator')


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength:[40,'less or equal 40 characters'],
        validate:[validator.isAlpha,'tour name must only contain character']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'a tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'a tour must have a max group size']
    },
    difficulty: {
        type: String,
        required: [true, 'a tour must have a max difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'difficult is either medium,easy,difficult'
        }
    },
    // rating:Number,
    rating: {
        type: Number,
        default: 4.5,
        min:[1,'rating must be above 0'],
        max:[5,'rating must be less than or equal to 5']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: {
        type:Number,
        validate:{
            validator:function(val){
                //this is only run when it will create not on update the document 
                return val<this.price
            },
            message:'discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'must have summary']
    },
    price: {
        type: Number,
        required: [true, 'provide price']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'required a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

//document middleware run when save and create not when insertMany
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

//query middleware 
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    this.start=Date.now()
    next()
})

tourSchema.post(/^find/, function (docs, next) {
    console.log('Query took'+(Date.now()-this.start))
    next()
})

//aggregation middleware
tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift({match:{secretTour: { $ne: true }}})
    next()
})


const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour