import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

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
  
  

export { listProducts, addProduct, removeProduct, singleProduct,updateProduct }