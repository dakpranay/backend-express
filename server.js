const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const app = require('./app')
//we can set enviornmental variable using terminal by writting 
//NODE_ENV=development x=20 nodemon server.js

const port = process.env.PORT || 8080

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)


mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((con)=>{
    console.log('database connected successfully')
}).catch(err=>{
    console.log(err)
})

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

const testTour=new Tour({
    name:'pranay',
    rating:5,
    price:200
})

testTour.save().then(doc=>{
    console.log(doc)
}).catch(err=>{
    console.log('Error ',err)
})



app.listen(port, () => {
    console.log('server running on port : ' + port)
})
