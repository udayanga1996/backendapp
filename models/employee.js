const mongoose = require('mongoose')

const Schema = mongoose.Schema
const userSchema = new Schema({
    fname: String,
    lname: String,
    email: String,
    mobileno: String,
    password: String,
    rating:String,
    comments:String,
    invoice:String,
    worktype:String, 
})
module.exports = mongoose.model('employee',userSchema,'Employee')