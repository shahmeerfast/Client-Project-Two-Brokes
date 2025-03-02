import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const AddProduct = () => {
    const navigate = useNavigate();
    const { addProduct } = useShopContext();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        image: null,
        imagePreview: null
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'image' && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            
            reader.onloadend = () => {
                console.log('Image loaded:', reader.result.substring(0, 100) + '...'); // Debug log
                setFormData(prev => ({
                    ...prev,
                    image: reader.result, // Store the base64 string directly
                    imagePreview: reader.result
                }));
            };
            
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const productData = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                category: formData.category,
                image: formData.image // Use the stored base64 string
            };

            console.log('Submitting product with image:', productData.image ? 'Image present' : 'No image'); // Debug log
            
            await addProduct(productData);
            toast.success('Product added successfully!');
            navigate('/seller/dashboard');
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Failed to add product: ' + error.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Preview */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Product Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        {formData.imagePreview ? (
                            <div className="space-y-1 text-center">
                                <img
                                    src={formData.imagePreview}
                                    alt="Preview"
                                    className="mx-auto h-64 w-64 object-cover rounded-md"
                                />
                                <div className="flex text-sm text-gray-600">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                        <span>Change image</span>
                                        <input
                                            type="file"
                                            name="image"
                                            className="sr-only"
                                            onChange={handleChange}
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                        <span>Upload a file</span>
                                        <input
                                            type="file"
                                            name="image"
                                            className="sr-only"
                                            onChange={handleChange}
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Product Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Price
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Category
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="books">Books</option>
                        <option value="home">Home & Garden</option>
                        <option value="sports">Sports & Outdoors</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/seller/dashboard')}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                        Add Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct; 