const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    product: {
        type:mongoose.Schema.ObjectId,
        ref:'Product',
        required: true
    },
    name : String,
    price : Number,
    quantity: Number,
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});



const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[OrderItemSchema],
    totalPrice:{
        type:Number,
        required:true
    },
    orderStatus :{
        type: String,
        enum:['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default:'pending'
    },
    paymentStatus:{
        type:String,
        enum:['pending', 'paid', 'failed'],
        default:'pending'
    },
    shippingAddress:{
        type:String,
        required:true
    }
}, {timestamps:true});



module.exports = mongoose.model('Order', orderSchema);
