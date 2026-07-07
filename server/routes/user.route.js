import { Router } from "express";
import { addToCart, toggleWishlist, getCart, getWishlist, removeFromCart } from "../controllers/user.controller.js";
import { userAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// Protected user routes
router.get("/cart", userAuth, getCart);
router.post("/cart", userAuth, addToCart);
router.delete("/cart/:cartItemId", userAuth, removeFromCart);

router.get("/wishlist", userAuth, getWishlist);
router.post("/wishlist", userAuth, toggleWishlist);

export default router;
