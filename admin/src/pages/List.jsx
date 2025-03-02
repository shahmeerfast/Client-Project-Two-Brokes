import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import axios from 'axios';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    sizes: '',
    bestseller: false,
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const updateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append('id', editingProduct._id);
      formData.append('name', updatedProduct.name);
      formData.append('description', updatedProduct.description);
      formData.append('price', updatedProduct.price);
      formData.append('category', updatedProduct.category);
      formData.append('subCategory', updatedProduct.subCategory);
      formData.append('sizes', updatedProduct.sizes);
      formData.append('bestseller', updatedProduct.bestseller);
  
      // No image fields are appended now
      // formData.append('image1', updatedProduct.image1); // Remove image fields
  
      const response = await axios.put(backendUrl + '/api/product/update', formData, {
        headers: { token },
      });
  
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
        setEditingProduct(null); // Close the edit form
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setUpdatedProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      subCategory: '',
      sizes: '',
      bestseller: false,
      image1: null,
      image2: null,
      image3: null,
      image4: null,
    });
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>
        {/* List Table Header */}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>

        {/* Product List */}
        {list.map((item) => (
          <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={item._id}>
            <img className='w-12' src={item.image[0]} alt="" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{currency}{item.price}</p>
            <div className='text-right md:text-center'>
              <p onClick={() => removeProduct(item._id)} className='cursor-pointer text-lg'>X</p>
              <button 
                onClick={() => {
                  setEditingProduct(item);
                  setUpdatedProduct({
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    subCategory: item.subCategory,
                    sizes: JSON.stringify(item.sizes),
                    bestseller: item.bestseller,
                    image1: null,
                    image2: null,
                    image3: null,
                    image4: null,
                  });
                }} 
                className="ml-2 text-blue-500">Update</button>
            </div>
          </div>
        ))}

        {/* Edit Form (only visible when editingProduct is set) */}
        {editingProduct && (
          <div className="mt-4 p-6 border bg-gray-100 rounded-md shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <input 
                type="text" 
                placeholder="Name" 
                value={updatedProduct.name} 
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
              <input 
                type="text" 
                placeholder="Description" 
                value={updatedProduct.description} 
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
              <input 
                type="number" 
                placeholder="Price" 
                value={updatedProduct.price} 
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
              <input 
                type="text" 
                placeholder="Category" 
                value={updatedProduct.category} 
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: e.target.value })} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
              <input 
                type="text" 
                placeholder="SubCategory" 
                value={updatedProduct.subCategory} 
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, subCategory: e.target.value })} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
              <textarea 
                placeholder="Sizes (JSON format)" 
                value={updatedProduct.sizes} 
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, sizes: e.target.value })} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={updateProduct} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={cancelEdit} 
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default List;
