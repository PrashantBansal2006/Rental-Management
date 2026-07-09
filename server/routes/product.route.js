import { Router } from "express";
import { createProduct, getAllProducts, getProductById } from "../controllers/product.controller.js";
import { userAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// Get all products (Public route)
router.get("/", getAllProducts);

// Get single product by ID (Public route)
router.get("/:id", getProductById);

// Create a new product (Protected route)
router.post("/", userAuth, createProduct);

export default router;
