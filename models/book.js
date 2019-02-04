const mongoose = require('mongoose')

const Schema = mongoose.Schema
const booking = new Schema({
    Bookingid: String,
    Employee_name: String,
    Employee_name: String,
    Client_name: String,
    Client_address: String,
    Work_type: String,
    Booking_status: String,
    Date: String


})
module.exports = mongoose.model('booking', booking, 'Booking')