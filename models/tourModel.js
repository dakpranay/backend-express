const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
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
        required: [true, 'a tour must have a max difficulty']
    },
    // rating:Number,
    rating: {
        type: Number,
        default: 4.5,
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: Number,
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
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date]

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
})

const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour