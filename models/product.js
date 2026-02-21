const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    name: {type:String, required:true},
    productImg:{type:String},
    price:{type:Number, required:true},
    stock:{type:Number, required:true, default:0},
    description:{type:String},
    isActive:{type:Boolean, default:true},
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{
    timestamps:true
})


module.exports = mongoose.model('Product', productSchema);