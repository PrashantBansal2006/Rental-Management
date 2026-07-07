import { Router } from "express";
import { createProduct } from "../controllers/product.controller.js";
import { userAuth } from "../Middleware/authMiddleware.js"; 

const router = Router();

// Assuming you want the user to be authenticated to create a product
router.use(userAuth);

// Create a new product
router.post("/", createProduct);

export default router;
