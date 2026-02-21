const Product = require('../models/product');
const mongoose = require('mongoose');

exports.create = async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;

    if (!name || price == null || stock == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    

    const product = await Product.create({
      name,
      price,
      stock,
      description,
      createdBy: req.user.userId
    });

    res.status(201).json({
      message: 'Product created successfully',
      productId: product._id
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create Product",
      error: error.message
    });
  }
};



exports.getallproducts = async (req, res) => {
  try{
    let products;

    if (req.user.role === 'admin') {
      products = await Product.find();
    } else {
      products = await Product.find({ createdBy: req.user.userId });
    }

    res.status(200).json({products})
  }catch(error){
    console.error("Error fetching expenses:", error);
    res.status(500).json({msg:'Server error'});
  }
}

exports.getproduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    if(mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({msg:"Invalid product ID"});
    }

    let product;

    if(req.user.role === 'admin'){
      product = await Product.findById(productId);
    }else{
      product  = await Product.findOne({
        _id:productId,
        createdBy:req.user.userId
      });
    }

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.status(200).json(product);

  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};