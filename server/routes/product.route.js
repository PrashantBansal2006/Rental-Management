import { Router } from "express";
import { createProduct, getAllProducts, getProductById, getMyProducts } from "../controllers/product.controller.js";
import { adminAuth, userAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// Get all products (Public route)
router.get("/", getAllProducts);

// Get single product by ID (Public route)
router.get("/:id", getProductById);

// Create a new product (Protected route)
router.post("/", userAuth, adminAuth, createProduct);

// Get products created by logged in staff (Protected route)
router.get("/my-products", userAuth, adminAuth, getMyProducts);

export default router;
