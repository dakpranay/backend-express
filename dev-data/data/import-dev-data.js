const mongoose = require('mongoose')
const fs=require('fs')
const Tour=require('../../models/tourModel')
const Review=require('../../models/reviewModel')
const User=require('../../models/userModel')

const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)


mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((con)=>{
    console.log('database connected successfully')
}).catch(err=>{
    console.log(err)
})

//Read json file
const tours=JSON.parse(fs.readFileSync(`${__dirname }/tours.json`,'utf-8'));
const users=JSON.parse(fs.readFileSync(`${__dirname }/users.json`,'utf-8'));
const reviews=JSON.parse(fs.readFileSync(`${__dirname }/reviews.json`,'utf-8'));

const importData= async()=>{
    try{
        await Tour.create(tours)
        await User.create(users,{validateBeforeSave:false})
        await Review.create(reviews)
        console.log('data upload seuccessfully')
    }catch(err){
        console.log(err)
    }
    process.exit()
}

const deleteData=async()=>{
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('data delete seuccessfully')
    }catch(err){
        console.log(err)
    }
    process.exit()

}

if(process.argv[2]==='--import'){
    importData()
}else if(process.argv[2]==='--delete'){
    deleteData()
}

