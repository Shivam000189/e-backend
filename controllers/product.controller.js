const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');
const Review = require('../models/review');
const mongoose = require('mongoose');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toPositiveInt = (value, fallback, max) => {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
};

const ownsProductFilter = (req, productId) => {
  const filter = { _id: productId };
  if (req.user.role !== 'admin') filter.createdBy = req.user.userId;
  return filter;
};

const validateCategories = async (categories) => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return false;
  }

  const validCategories = await Category.find({
    _id: { $in: categories },
    isActive: true
  }).select('_id');

  return validCategories.length === categories.length;
};

exports.create = async (req, res) => {
  try {
    const { name, productImg, price, stock, description, categories } = req.body;

    const hasValidCategories = await validateCategories(categories);
    if (!hasValidCategories) {
      return res.status(400).json({ message: 'Invalid categories provided' });
    }

    const product = await Product.create({
      name,
      productImg,
      price,
      stock,
      description,
      categories,
      createdBy: req.user.userId
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create Product',
      error: error.message
    });
  }
};

exports.getallproducts = async (req, res) => {
  try {
    return exports.searchProduct(req, res);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getproduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: 'Invalid product ID' });
    }

    const product = await Product.findOne({ _id: productId, isActive: true })
      .populate('categories', 'name')
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, productImg, price, stock, description, categories, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: 'Invalid product ID' });
    }

    if (categories !== undefined) {
      const hasValidCategories = await validateCategories(categories);
      if (!hasValidCategories) {
        return res.status(400).json({ message: 'Invalid categories provided' });
      }
    }

    const product = await Product.findOne(ownsProductFilter(req, productId));

    if (!product) return res.status(404).json({ msg: 'Product not found' });

    if (name !== undefined) product.name = name;
    if (productImg !== undefined) product.productImg = productImg;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (description !== undefined) product.description = description;
    if (categories !== undefined) product.categories = categories;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update Product'
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: 'Invalid product ID' });
    }

    const product = await Product.findOne(ownsProductFilter(req, productId));

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      msg: 'Product deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.searchProduct = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = toPositiveInt(req.query.limit, 10, 50);
    const search = escapeRegex(req.query.search || '');
    const minPrice = Number.isFinite(Number(req.query.minPrice)) ? Number(req.query.minPrice) : 0;
    const maxPrice = Number.isFinite(Number(req.query.maxPrice)) ? Number(req.query.maxPrice) : Number.MAX_VALUE;
    const minRating = Number.isFinite(Number(req.query.minRating)) ? Number(req.query.minRating) : 0;
    const sort = req.query.sort || 'createdAt';
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1;
    const category = req.query.category;

    const skip = (page - 1) * limit;

    const filter = {
      isActive: true,
      price: { $gte: minPrice, $lte: maxPrice },
      rating: { $gte: minRating }
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ msg: 'Invalid category ID' });
      }
      filter.categories = category;
    } else {
      const activeCategories = await Category.find({ isActive: true }).select('_id');
      filter.categories = { $in: activeCategories.map(cat => cat._id) };
    }

    const allowedSortFields = ['price', 'createdAt', 'rating', 'stock', 'name'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';

    const products = await Product.find(filter)
      .populate('categories', 'name')
      .populate('createdBy', 'name')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = toPositiveInt(req.query.limit, 10, 50);
    const skip = (page - 1) * limit;
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user.userId };

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const products = await Product.find(filter)
      .populate('categories', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getInventorySummary = async (req, res) => {
  try {
    const threshold = toPositiveInt(req.query.threshold, 5);
    const ownerFilter = req.user.role === 'admin' ? {} : { createdBy: new mongoose.Types.ObjectId(req.user.userId) };

    const [summary] = await Product.aggregate([
      { $match: ownerFilter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveProducts: { $sum: { $cond: ['$isActive', 0, 1] } },
          totalStock: { $sum: '$stock' },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ['$stock', threshold] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      threshold,
      summary: summary || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        totalStock: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0
      }
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = toPositiveInt(req.query.threshold, 5);
    const filter = {
      stock: { $lte: threshold },
      isActive: true
    };

    if (req.user.role !== 'admin') {
      filter.createdBy = req.user.userId;
    }

    const products = await Product.find(filter)
      .populate('categories', 'name')
      .sort({ stock: 1, updatedAt: -1 });

    res.status(200).json({ threshold, products });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { stock } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: 'Invalid product ID' });
    }

    const product = await Product.findOne(ownsProductFilter(req, productId));
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product.stock = stock;
    await product.save();

    res.status(200).json({ msg: 'Stock updated', product });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getProductRecommendations = async (req, res) => {
  try {
    const productId = req.params.productId;
    const limit = toPositiveInt(req.query.limit, 8, 20);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: 'Invalid product ID' });
    }

    const baseProduct = await Product.findOne({ _id: productId, isActive: true });
    if (!baseProduct) return res.status(404).json({ msg: 'Product not found' });

    const orders = await Order.find({ 'items.product': productId }).select('items.product');
    const counts = new Map();

    orders.forEach(order => {
      order.items.forEach(item => {
        const otherProductId = item.product.toString();
        if (otherProductId !== productId) {
          counts.set(otherProductId, (counts.get(otherProductId) || 0) + item.quantity);
        }
      });
    });

    const rankedIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, limit);

    const recommended = rankedIds.length
      ? await Product.find({ _id: { $in: rankedIds }, isActive: true }).populate('categories', 'name')
      : [];

    const orderedRecommendations = rankedIds
      .map(id => recommended.find(product => product._id.toString() === id))
      .filter(Boolean);

    if (orderedRecommendations.length < limit) {
      const fallback = await Product.find({
        _id: { $nin: [productId, ...orderedRecommendations.map(product => product._id)] },
        isActive: true,
        categories: { $in: baseProduct.categories }
      })
        .populate('categories', 'name')
        .sort({ rating: -1, numReviews: -1, createdAt: -1 })
        .limit(limit - orderedRecommendations.length);

      orderedRecommendations.push(...fallback);
    }

    res.status(200).json({ recommendations: orderedRecommendations });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const limit = toPositiveInt(req.query.limit, 8, 20);
    const orders = await Order.find({ user: req.user.userId }).select('items.product');
    const reviews = await Review.find({ user: req.user.userId, rating: { $gte: 4 } }).select('product');

    const seenIds = new Set();
    orders.forEach(order => order.items.forEach(item => seenIds.add(item.product.toString())));
    reviews.forEach(review => seenIds.add(review.product.toString()));

    const similarUserOrders = seenIds.size
      ? await Order.find({ 'items.product': { $in: [...seenIds] }, user: { $ne: req.user.userId } }).select('items.product')
      : [];

    const counts = new Map();
    similarUserOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.toString();
        if (!seenIds.has(productId)) {
          counts.set(productId, (counts.get(productId) || 0) + item.quantity);
        }
      });
    });

    const rankedIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, limit);

    let recommendations = rankedIds.length
      ? await Product.find({ _id: { $in: rankedIds }, isActive: true }).populate('categories', 'name')
      : [];

    recommendations = rankedIds
      .map(id => recommendations.find(product => product._id.toString() === id))
      .filter(Boolean);

    if (recommendations.length < limit) {
      const fallback = await Product.find({
        _id: { $nin: [...seenIds, ...recommendations.map(product => product._id)] },
        isActive: true
      })
        .populate('categories', 'name')
        .sort({ rating: -1, numReviews: -1, createdAt: -1 })
        .limit(limit - recommendations.length);

      recommendations.push(...fallback);
    }

    res.status(200).json({ recommendations });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};
