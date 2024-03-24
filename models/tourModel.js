const mongoose =require('mongoose')

const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    // rating:Number,
    rating:{
        type:Number,
        default:4.5,
    },
    price:{
        type:Number,
        required:[true,'provide price']
    }

})
const Tour=mongoose.model('Tour',tourSchema)
module.exports=Tour