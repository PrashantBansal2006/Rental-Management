import Product from "../src/models/product.model.js";

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
      owner: req.user?._id, // Assuming auth middleware attaches user to req
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
