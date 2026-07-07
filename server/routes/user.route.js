import { Router } from "express";
import { addToCart, toggleWishlist, getCart, getWishlist, removeFromCart } from "../controllers/user.controller.js";
import { verifyJWT } from "../Middleware/authMiddleware.js";

const router = Router();

// Protected user routes
router.get("/cart", verifyJWT, getCart);
router.post("/cart", verifyJWT, addToCart);
router.delete("/cart/:cartItemId", verifyJWT, removeFromCart);

router.get("/wishlist", verifyJWT, getWishlist);
router.post("/wishlist", verifyJWT, toggleWishlist);

export default router;
