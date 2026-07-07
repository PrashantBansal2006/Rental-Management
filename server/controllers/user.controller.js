import User from "../models/user.model.js";

// Add or remove product from wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      // Add to wishlist
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({ success: true, message: "Added to wishlist", wishlist: user.wishlist });
    } else {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
      await user.save();
      return res.status(200).json({ success: true, message: "Removed from wishlist", wishlist: user.wishlist });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling wishlist", error: error.message });
  }
};

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, duration, durationType, totalPrice } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.cart.push({
      product: productId,
      quantity,
      duration,
      durationType,
      totalPrice
    });

    await user.save();
    return res.status(200).json({ success: true, message: "Added to cart successfully", cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding to cart", error: error.message });
  }
};

// Get Wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    return res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching wishlist", error: error.message });
  }
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    return res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching cart", error: error.message });
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.cart = user.cart.filter(item => item._id.toString() !== cartItemId);
    await user.save();

    // Re-populate to send back updated cart
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    return res.status(200).json({ success: true, message: "Item removed", cart: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing from cart", error: error.message });
  }
};
