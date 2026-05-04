const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const mongoose = require('mongoose');

// exports.createOrder = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const userId = req.user.userId;
//     const { shippingAddress } = req.body;

//     if (!shippingAddress) {
//       return res.status(400).json({ msg: "Shipping address required" });
//     }

//     const cart = await Cart.findOne({ user: userId }).populate('items.product');

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ msg: "Cart is empty" });
//     }

//     let totalPrice = 0;
//     const orderItems = [];

//     for (const item of cart.items) {
//       const product = item.product;

//       if (!product || !product.isActive) {
//         throw new Error("Product unavailable");
//       }

//       if (product.stock < item.quantity) {
//         throw new Error("Insufficient stock");
//       }

//       product.stock -= item.quantity;
//       await product.save({ session });

//       totalPrice += product.price * item.quantity;

//       orderItems.push({
//         product: product._id,
//         name: product.name,
//         price: product.price,
//         quantity: item.quantity
//       });
//     }

//     const order = await Order.create([{
//       user: userId,
//       items: orderItems,
//       totalPrice,
//       shippingAddress
//     }], { session });

//     cart.items = [];
//     await cart.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({
//       msg: "Order placed successfully",
//       order: order[0]
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     res.status(500).json({ msg: error.message });
//   }
// };


exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ msg: "Shipping address required" });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({ msg: "Product unavailable" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: "Insufficient stock" });
      }

      product.stock -= item.quantity;
      await product.save();

      totalPrice += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        seller: product.createdBy,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalPrice,
      shippingAddress
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({
      msg: "Order placed successfully",
      order
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


exports.getMyOrder = async (req, res) => {
  try{
    const orders = await Order.find({user : req.user.userId})
      .sort({createdAt: -1});
    
      res.status(200).json({orders});
  }catch(error){
    res.status(500).json({msg:"Server Error"});
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'user') {
      filter.user = req.user.userId;
    }

    const order = await Order.findOne(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name productImg createdBy')
      .populate('items.seller', 'name email');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    if (req.user.role === 'seller') {
      const sellerHasItem = order.items.some(item => {
        const sellerId = item.seller?._id || item.product?.createdBy;
        return sellerId?.toString() === req.user.userId;
      });

      if (!sellerHasItem) {
        return res.status(404).json({ msg: 'Order not found' });
      }
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
}


exports.getAllOrders = async (req, res) => {
  try{
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({createdAt: -1});


    res.status(200).json({orders});
  }catch(error){
    res.status(500).json({msg:"Server error"});
  }
}

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const orders = await Order.find({
      $or: [
        { 'items.seller': sellerId },
        { 'items.seller': { $exists: false } }
      ]
    })
      .populate('user', 'name email')
      .populate('items.product', 'name productImg createdBy')
      .sort({ createdAt: -1 });

    const sellerOrders = orders
      .map(order => {
        const sellerItems = order.items.filter(item => {
          const ownerId = item.seller || item.product?.createdBy;
          return ownerId?.toString() === sellerId;
        });

        if (sellerItems.length === 0) return null;

        const sellerTotal = sellerItems.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
        );

        const orderObject = order.toObject();
        orderObject.items = sellerItems;
        orderObject.sellerTotal = sellerTotal;
        return orderObject;
      })
      .filter(Boolean);

    res.status(200).json({ orders: sellerOrders });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
}


exports.cancelOrder = async (req, res) => {
  try{
    const orderId = req.params.id;

    const order = await Order.findOne({
      _id:orderId,
      user:req.user.userId
    });

    if(!order){
      return res.status(404).json({msg:"Order not found"});
    };

    if(order.orderStatus !== 'pending'){
      return res.status(400).json({msg:"Only pending orders can be cancelled"});
    };

    for(const item of order.items){
      const product = await Product.findById(item.product);

      if(product){
        product.stock += item.quantity;
        await product.save();
      }
    }


    order.orderStatus = 'cancelled';

    await order.save();

    res.status(200).json({msg:"Order cancelled successfully"});
  }catch(error){
    res.status(500).json({msg:"Server error"});
  }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        order.orderStatus = status;
        await order.save();

        res.status(200).json({ msg: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'paid', 'failed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid payment status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        order.paymentStatus = status;
        await order.save();

        res.status(200).json({ msg: 'Payment status updated', order });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};
