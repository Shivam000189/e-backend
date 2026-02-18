const Product = require('../models/product');


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
