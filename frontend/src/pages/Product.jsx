import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from '../config/axios';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProductData = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log('\n=== FETCH PRODUCT DEBUG START ===');
      console.log('Product ID:', productId);
      console.log('Retry count:', retryCount);

      if (!productId || productId.length !== 24) {
        throw new Error(`Invalid product ID: ${productId}`);
      }

      const endpoint = `/api/product/product/${productId}`;
      console.log('Making API request to:', endpoint);
      console.log('Full URL:', axios.defaults.baseURL ? axios.defaults.baseURL + endpoint : endpoint);

      try {
        const response = await axios.get(endpoint);
        console.log('API Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: JSON.stringify(response.data, null, 2)
        });

        if (!response.data) {
          throw new Error('No data received from server');
        }

        // Check if we have debug information
        if (response.data.debug) {
          console.log('Server debug info:', response.data.debug);
        }

        // Handle the case where success is true but product is null
        if (response.data.success && !response.data.product) {
          console.error('Server returned success but no product:', response.data);
          throw new Error(
            response.data.debug 
              ? `Product not found. Debug info: ${JSON.stringify(response.data.debug)}` 
              : 'Product not found in database'
          );
        }

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch product details');
        }

        const product = response.data.product;
        console.log('Raw product data:', JSON.stringify(product, null, 2));

        // Validate required fields
        if (!product._id || !product.name) {
          console.error('Invalid product data:', product);
          throw new Error('Invalid product data: missing required fields');
        }

        // Process images with detailed logging
        console.log('Processing images...');
        console.log('Original images:', product.images);
        const productImages = Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : ['https://via.placeholder.com/400x400?text=No+Image'];
        console.log('Processed images:', productImages);

        // Create processed product data
        const processedProduct = {
          _id: product._id,
          name: product.name,
          description: product.description || 'No description available',
          price: typeof product.price === 'number' ? product.price : 0,
          category: product.category || 'Uncategorized',
          subCategory: product.subCategory || product.category || 'Uncategorized',
          sizes: Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L'],
          bestseller: Boolean(product.bestseller),
          condition: product.condition || 'new',
          approvalStatus: product.approvalStatus || 'pending',
          images: productImages,
          createdAt: product.createdAt || new Date(),
          approvalDate: product.approvalDate,
          approvedBy: product.approvedBy,
          seller: product.seller
        };

        console.log('Processed product data:', JSON.stringify(processedProduct, null, 2));
        
        setProductData(processedProduct);
        setSelectedImage(productImages[0]);
        
        console.log('Product data set successfully');
        console.log('=== FETCH PRODUCT DEBUG END ===\n');
      } catch (axiosError) {
        console.error('Axios error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            baseURL: axiosError.config?.baseURL,
            headers: axiosError.config?.headers
          }
        });
        throw axiosError;
      }
    } catch (error) {
      console.error('\n=== FETCH PRODUCT ERROR ===');
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : undefined
      });
      
      // Only retry on network errors or 5xx server errors
      if (retryCount < 2 && (!error.response || error.response?.status >= 500)) {
        console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchProductData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      let errorMessage = error.message;
      if (error.response?.data?.debug) {
        const debug = error.response.data.debug;
        if (debug.totalProducts !== undefined) {
          errorMessage = `${error.message}. Found ${debug.totalProducts} products in database.`;
          if (debug.availableIds) {
            console.log('Available product IDs:', debug.availableIds);
          }
        }
      }

      toast.error(errorMessage);
      setProductData(null);
      console.error('=== FETCH PRODUCT ERROR END ===\n');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      console.log('Product ID changed, fetching data for:', productId);
      fetchProductData().catch(error => {
        console.error('Error in useEffect:', error);
        setLoading(false);
        setProductData(null);
        toast.error('Failed to load product details');
      });
    } else {
      console.error('No product ID provided');
      setLoading(false);
      setProductData(null);
      toast.error('No product ID provided');
    }
  }, [productId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!productData) {
    return <div className="text-center py-8">Product not found</div>;
  }

  // Ensure sizes is always an array
  const sizes = Array.isArray(productData.sizes) ? productData.sizes : ['S', 'M', 'L'];

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.images.map((image, index) => (
              <img
                onClick={() => setSelectedImage(image)}
                src={image}
                key={index}
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'
                alt={`${productData.name} view ${index + 1}`}
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img 
              className='w-full h-auto' 
              src={selectedImage} 
              alt={productData.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
              }}
            />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
            <p className='pl-2'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              if (!size) {
                toast.warning('Please select a size first');
                return;
              }
              addToCart(productData._id, size);
            }}
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
          >
            ADD TO CART
          </button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product</p>
            <p>Cash on delivery is available</p>
            <p>Easy return and exchange within 7 days</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>{productData.description}</p>
        </div>
      </div>

      {/* --------- display related products ---------- */}
      {productData.category && productData.subCategory && (
        <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
      )}
    </div>
  );
}

export default Product
