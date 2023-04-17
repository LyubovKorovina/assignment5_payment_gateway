
const mongoose  = require("mongoose");

const OrderSchema = new mongoose.Schema({
    
    PaymentIntenId : {
        type: String,
        required: true
    },
    Amount : {
        type : String,
        default:"N/A"
    },
    Quantity: {
        type : Number,
        default : 1
    },
    PaymentMethod : {
        type: String
    },
    IsCaptured : {
        type : Boolean,
        default : false
    }

})

module.exports = mongoose.model("orderModel", OrderSchema)