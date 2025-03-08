import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import Product from '../models/Product.js';

// function for add product
const addProduct = async (req, res) => {
    try {
        console.log('=== ADD PRODUCT DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Files received:', req.files);
        console.log('User from token:', req.user);

        const { name, description, price, category, condition, subCategory, sizes, bestseller } = req.body;

        // Validate required fields
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "Name, description, price, and category are required"
            });
        }

        let imagesUrl = [];
        
        // Handle image uploads
        if (req.files && req.files.length > 0) {
            try {
                imagesUrl = await Promise.all(
                    req.files.map(async (file) => {
                        console.log('Processing file:', file.originalname);
                        console.log('File path:', file.path);
                        
                        const result = await cloudinary.uploader.upload(file.path, {
                            resource_type: 'image',
                            folder: 'products'
                        });
                        console.log('Cloudinary result:', result);
                        
                        if (!result || !result.secure_url) {
                            throw new Error('Failed to get secure URL from Cloudinary');
                        }
                        
                        return result.secure_url;
                    })
                );
                console.log('Uploaded image URLs:', imagesUrl);
            } catch (error) {
                console.error('Error uploading images:', error);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading images: " + error.message
                });
            }
        }

        // Use a default image if no images were uploaded or if upload failed
        if (imagesUrl.length === 0) {
            imagesUrl = ['https://via.placeholder.com/300x200?text=No+Image'];
        }

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            condition: condition || 'new',
            subCategory: subCategory || category,
            bestseller: bestseller === "true",
            sizes: sizes ? JSON.parse(sizes) : ['S', 'M', 'L'],
            images: imagesUrl,
            seller: req.user.id,
            approvalStatus: 'pending',
            createdAt: new Date()
        };

        console.log('Creating product with data:', productData);

        const product = new Product(productData);
        await product.save();

        console.log('Product saved successfully:', product);
        console.log('=== END ADD PRODUCT DEBUG ===');

        res.status(201).json({
            success: true,
            message: "Product Added Successfully",
            product
        });

    } catch (error) {
        console.error('Error in addProduct:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error adding product"
        });
    }
};

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// function for updating product
const updateProduct = async (req, res) => {
    try {
      console.log("Request Body: ", req.body);
  
      const { id, name, description, price, category, subCategory, sizes, bestseller } = req.body;
  
      const product = await productModel.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price ? Number(price) : product.price;
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory;
      product.sizes = sizes ? JSON.parse(sizes) : product.sizes;
      product.bestseller = bestseller ? bestseller === 'true' : product.bestseller;
  
      // No image update logic here
      // If you want to add a condition to not touch the image fields, you can remove the code that handles image changes.
  
      await product.save();
      res.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  
  

// Get all products (only approved ones for public view)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ approvalStatus: 'approved' })
      .populate('seller', 'fullName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get pending products (for admin)
const getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ approvalStatus: 'pending' })
      .populate('seller', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Approve or reject product (requires admin authentication)
const updateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.approvalStatus = status;
    product.approvedBy = req.user.id; // From auth middleware
    product.approvalDate = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      product.rejectionReason = rejectionReason;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${status} successfully`,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get seller's products (including pending and rejected)
const getSellerProducts = async (req, res) => {
  try {
    console.log('=== GET SELLER PRODUCTS DEBUG ===');
    console.log('User from token:', req.user);
    console.log('Token:', req.headers.token);
    console.log('Searching for products with seller ID:', req.user.id);
    
    const products = await Product.find({ seller: req.user.id })
      .populate('seller', 'fullName email')
      .sort({ createdAt: -1 });
    
    console.log('Found seller products:', products);
    console.log('=== END DEBUG ===');
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error in getSellerProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update seller's product
const updateSellerProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, condition } = req.body;
    
    const product = await Product.findOne({ _id: productId, seller: req.user.id });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to update it'
      });
    }

    // Update basic fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.condition = condition || product.condition;

    // Update images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      // Ensure image paths are properly formatted
      product.images = req.files.map(file => {
        const path = file.path.replace(/\\/g, '/');
        return path.startsWith('/') ? path : `/${path}`;
      });
    }

    // Set status back to pending if product was previously approved
    if (product.approvalStatus === 'approved') {
      product.approvalStatus = 'pending';
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete seller's product
const deleteSellerProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findOne({ _id: productId, seller: req.user.id });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to delete it'
      });
    }

    await Product.deleteOne({ _id: productId });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export {
    listProducts,
    addProduct,
    removeProduct,
    singleProduct,
    updateProduct,
    getProducts,
    getPendingProducts,
    updateProductStatus,
    getSellerProducts,
    updateSellerProduct,
    deleteSellerProduct
}