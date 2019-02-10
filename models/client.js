const mongoose = require('mongoose')

const Schema = mongoose.Schema
const userSchema = new Schema({
    fname: String,
    lname: String,
    address:String,
    email: String,
    mobileno: String,
    password: String,
    rating:String,
    comments:String,
    image:String 
        
})
module.exports = mongoose.model('client',userSchema,'Client')