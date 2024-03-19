const express = require('express')
const fs=require('fs')
const port = 8080


const app = express()

const tours=JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))
app.get('/api/v1/tours',(req,res)=>{
    res.status(200).json({
        status:"success",
        results:tours.length,
        data:{
            tours
        }
    })

})


app.listen(port, () => {
    console.log('server running on port : ' + port)
})