import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { useProduct } from '../context/ProductContext';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Collection = () => {

  const { products , search , showSearch } = useContext(ShopContext);
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState([]);
  const [subCategory,setSubCategory] = useState([]);
  const [sortType,setSortType] = useState('relavent')
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { products: productContextProducts } = useProduct();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: {
      Men: false,
      Women: false,
      kids: false
    },
    types: {
      Topwear: false,
      Bottomwear: false,
      Winterwear: false
    }
  });

  const toggleCategory = (e) => {

    if (category.includes(e.target.value)) {
        setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setCategory(prev => [...prev,e.target.value])
    }

  }

  const toggleSubCategory = (e) => {

    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setSubCategory(prev => [...prev,e.target.value])
    }
  }

  const applyFilter = () => {

    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0 ) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }

    setFilterProducts(productsCopy)

  }

  const sortProduct = () => {

    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
        break;

      default:
        applyFilter();
        break;
    }

  }

  useEffect(()=>{
      applyFilter();
  },[category,subCategory,search,showSearch,products])

  useEffect(()=>{
    sortProduct();
  },[sortType])

  const categories = [
    'All',
    'Clothing',
    'Farm Products',
    'Home Appliances',
    'Electronics',
    'Cars',
    'Properties',
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? productContextProducts 
    : productContextProducts.filter(product => product.category === selectedCategory);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Get only approved products
      const response = await axios.get('/api/product/list');
      let filteredProducts = response.data.products || [];

      // Filter only approved products
      filteredProducts = filteredProducts.filter(product => product.approvalStatus === 'approved');

      // Apply category filter
      if (selectedCategory !== 'All') {
        filteredProducts = filteredProducts.filter(product => 
          product.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      // Special handling for Clothing category
      if (selectedCategory === 'Clothing') {
        filteredProducts = filteredProducts.filter(product => 
          ['Men', 'Women', 'Kids', 'Topwear', 'Bottomwear', 'Winterwear'].includes(product.category) ||
          ['Men', 'Women', 'Kids', 'Topwear', 'Bottomwear', 'Winterwear'].includes(product.subCategory)
        );
      }

      // Apply other filters
      const activeCategories = Object.entries(filters.categories)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const activeTypes = Object.entries(filters.types)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      if (activeCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          activeCategories.some(cat => 
            product.category.toLowerCase() === cat.toLowerCase() ||
            product.subCategory.toLowerCase() === cat.toLowerCase()
          )
        );
      }

      if (activeTypes.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          activeTypes.some(type => 
            product.type?.toLowerCase() === type.toLowerCase() ||
            product.subCategory?.toLowerCase() === type.toLowerCase()
          )
        );
      }

      // Apply sorting
      switch (sortType) {
        case 'low-high':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'high-low':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          // Default sorting (Relevant)
          break;
      }

      setFilterProducts(filteredProducts);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, filters, sortType]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // Reset other filters when changing main category
    setFilters({
      categories: {
        Men: false,
        Women: false,
        kids: false
      },
      types: {
        Topwear: false,
        Bottomwear: false,
        Winterwear: false
      }
    });
  };

  const handleFilterChange = (section, key) => {
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      
      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>
        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Men'} onChange={toggleCategory}/> Men
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Women'} onChange={toggleCategory}/> Women
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Kids'} onChange={toggleCategory}/> kids
            </p>
          </div>
        </div>
        {/* SubCategory Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Topwear'} onChange={toggleSubCategory}/> Topwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory}/> Bottomwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Winterwear'} onChange={toggleSubCategory}/> Winterwear
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={'ALL'} text2={'COLLECTIONS'} />
            {/* Porduct Sort */}
            <select 
              onChange={(e)=>setSortType(e.target.value)} 
              className='border-2 border-gray-300 text-sm px-2'
            >
              <option value="relavent">Sort by: Relavent</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
              <option value="newest">Sort by: Newest First</option>
            </select>
        </div>

        {/* Categories Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-md ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filterProducts.length === 0 ? (
            <div className="text-center py-8">No products found</div>
          ) : (
            filterProducts.map((item) => (
              <div key={item._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <img 
                  src={item.images[0]} 
                  alt={item.name} 
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                <p className="text-black font-bold mb-2">₹{item.price}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{item.category}</span>
                  <span>{item.condition}</span>
                </div>
                <Link 
                  to={`/product/${item._id}`}
                  className="mt-4 inline-block w-full bg-black text-white px-4 py-2 rounded text-center hover:bg-gray-800 transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}

export default Collection
