import { Router } from "express";
import { createProduct } from "../controllers/product.controller.js";
import { userAuth } from "../Middleware/authMiddleware.js"; 

const router = Router();

// Assuming you want the user to be authenticated to create a product
router.use(userAuth);

// Get single product by ID (Public route)
router.get("/:id", getProductById);

// Create a new product (Protected route)
router.post("/", userAuth, createProduct);

export default router;
