const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    User_ID: String,
    Employee_name: String,
    Basic_charge: String,
    Cost: String,
    Total_Cost: String,
    email: String,
    mobile: String,
})
module.exports = mongoose.model("invoice", userSchema, "Invoice");