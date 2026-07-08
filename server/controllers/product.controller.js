import Product from "../models/productModel.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      images,
      quantity,
      availableQuantity,
      securityDeposit,
      status,
      pricing
    } = req.body;

    // Validate required fields based on model schema (assuming basic validation)
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and Category are required fields."
      });
    }

    const newProduct = new Product({
      name,
      description,
      category,
      owner: req.userId, // Assigned by userAuth middleware
      images: images || [],
      quantity: quantity || 0,
      availableQuantity: availableQuantity ?? quantity ?? 0,
      securityDeposit: securityDeposit || 0,
      status: status || "available",
      pricing: pricing || {}
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the product",
      error: error.message
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { type = 'daily', min, max, search, sort } = req.query;
    
    let filter = {};
    if (min !== undefined) {
      filter[`pricing.${type}`] = { $gte: Number(min) };
      if (max !== undefined) {
        filter[`pricing.${type}`].$lte = Number(max);
      }
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    let sortQuery = {};
    if (sort === 'price_asc') {
      sortQuery[`pricing.${type}`] = 1;
    } else if (sort === 'price_desc') {
      sortQuery[`pricing.${type}`] = -1;
    } else {
      sortQuery.createdAt = -1; // Newest first by default
    }

    const products = await Product.find(filter).populate("category").sort(sortQuery);
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching products",
      error: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("owner", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the product",
      error: error.message
    });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.userId }).populate("category").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Error fetching my products:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching products",
      error: error.message
    });
  }
};
