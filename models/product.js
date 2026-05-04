const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {type:String, required:true},
    productImg:{type:String},
    price:{type:Number, required:true},
    stock:{type:Number, required:true, default:0},
    description:{type:String},
    isActive:{type:Boolean, default:true},
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        }
        ],
    rating:{type:Number, default:0},
    numReviews:{type:Number, default:0},
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{
    timestamps:true
})

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ categories: 1, isActive: 1 });
productSchema.index({ createdBy: 1, stock: 1 });
productSchema.index({ price: 1, rating: -1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
