import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, getMe } from '../../../features/auth/authSlice';
import { fetchCategories } from '../../../features/Category/categoryThunks';
// Import axios instance của bạn
import axios from 'axios'; 
import { FaSearch } from "react-icons/fa"; 

// --- HOOK DEBOUNCE ---
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const Header = () => {
    const { isLoggedIn, user } = useSelector(state => state.auth);
    const { categories } = useSelector((state) => state.category);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // --- STATE CHO TÌM KIẾM ---
    const [keyword, setKeyword] = useState("");
    const [suggestions, setSuggestions] = useState([]); 
    const [showSuggestions, setShowSuggestions] = useState(false); 
    const [isLoadingSuggest, setIsLoadingSuggest] = useState(false);
    
    const debouncedKeyword = useDebounce(keyword, 500);
    const searchRef = useRef(null);

    useEffect(() => {
        dispatch(getMe());
        dispatch(fetchCategories());
    }, [dispatch]);

    // --- LOGIC GỌI API GỢI Ý ---
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedKeyword.trim()) {
                setSuggestions([]);
                return;
            }
            setIsLoadingSuggest(true);
            try {
                // Sửa lại URL API của bạn cho đúng
                const response = await axios.get(`http://127.0.0.1:8000/api/client/products/search?q=${debouncedKeyword}`);
                const data = response.data.data || response.data; 
                setSuggestions(data.slice(0, 5)); 
                setShowSuggestions(true);
            } catch (error) {
                console.error("Lỗi gợi ý:", error);
                setSuggestions([]);
            } finally {
                setIsLoadingSuggest(false);
            }
        };
        fetchSuggestions();
    }, [debouncedKeyword]);

    // --- XỬ LÝ CLICK OUTSIDE ---
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault(); 
        setShowSuggestions(false); 
        if (keyword.trim()) {
            navigate(`/search?q=${encodeURIComponent(keyword)}`);
            setKeyword("");
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };


    return (
        <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            
            {/* --- HÀNG 1: QUAN TRỌNG: Thêm 'relative z-50' để đè lên Hàng 2 --- */}
            <div className="border-b border-gray-200 relative z-50 bg-white">
                <nav className="container mx-auto flex items-center justify-between py-3 px-4 md:px-6 gap-4">
                    
                    {/* 1. LOGO */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tighter hover:opacity-80">
                            MyShop
                        </Link>
                    </div>

                    {/* 2. THANH TÌM KIẾM (CÓ GỢI Ý) */}
                    <div className="flex-1 max-w-xl hidden md:block relative" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative group">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={keyword}
                                onChange={(e) => {
                                    setKeyword(e.target.value);
                                    if(e.target.value.length > 0) setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    if(suggestions.length > 0) setShowSuggestions(true);
                                }}
                                className="w-full py-2 pl-5 pr-12 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                            />
                            <button 
                                type="submit" 
                                className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center rounded-r-full"
                            >
                                <FaSearch className="text-lg" />
                            </button>
                        </form>

                        {/* --- DROPDOWN GỢI Ý (SỬA LẠI Z-INDEX) --- */}
                        {showSuggestions && keyword.trim().length > 0 && (
                            // QUAN TRỌNG: z-[100] để chắc chắn nó nổi lên trên cùng
                            <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-[100] animate-fade-in">
                                {isLoadingSuggest ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">Đang tìm kiếm...</div>
                                ) : suggestions.length > 0 ? (
                                    <ul>
                                        <li className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Sản phẩm gợi ý
                                        </li>
                                        {suggestions.map((product) => (
                                            <li key={product.id}>
                                                <Link 
                                                    to={`/product/${product.slug}`} 
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-none"
                                                    onClick={() => setShowSuggestions(false)}
                                                >
                                                    <div className="w-10 h-10 flex-shrink-0 bg-white border border-gray-200 rounded overflow-hidden">
                                                        <img 
                                                            src={product.image || "https://via.placeholder.com/40"} 
                                                            alt={product.name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-800 truncate">
                                                            {product.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-red-600 font-bold">
                                                                {formatPrice(product.price)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                        <li>
                                            <Link 
                                                to={`/search?q=${encodeURIComponent(keyword)}`}
                                                className="block text-center py-2 text-sm text-blue-600 font-medium hover:underline bg-gray-50"
                                                onClick={() => setShowSuggestions(false)}
                                            >
                                                Xem tất cả kết quả
                                            </Link>
                                        </li>
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        Không tìm thấy sản phẩm nào.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3. MENU LINK & AUTH */}
                    <div className="flex items-center gap-4 lg:gap-6 text-sm font-semibold flex-shrink-0">
                        {/* Giữ nguyên phần Auth của bạn */}
                        <div className="hidden lg:flex items-center gap-5 text-gray-600">
                            <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
                            <Link to="/product" className="hover:text-blue-600 transition-colors">Sản phẩm</Link>
                            <Link to="/cart" className="hover:text-blue-600 transition-colors">Giỏ hàng</Link>
                        </div>
                        <div className="border-l pl-4 border-gray-300">
                            {!isLoggedIn ? (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">Đăng nhập</Link>
                                    <Link to="/register" className="bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition shadow-sm">Đăng ký</Link>
                                </div>
                            ) : (
                                <div className='flex items-center gap-3'>
                                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-full pr-3 transition">
                                        <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                                        <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate hidden xl:block">{user?.username}</span>
                                    </div>
                                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition">Đăng xuất</button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </div>

            {/* --- HÀNG 2: DANH MỤC SẢN PHẨM --- */}
            {/* QUAN TRỌNG: Giảm z-index xuống thấp hơn Hàng 1 (z-40 < z-50) */}
            <div className="bg-white shadow-sm border-b border-gray-100 relative z-40">
                <div className="container mx-auto px-4 md:px-6">
                    <ul className="flex flex-wrap items-center gap-1 list-none m-0 p-0 text-sm">
                        {categories.map((parentCat) => (
                            <li key={parentCat.id} className="group relative">
                                <Link 
                                    to={`/category/${parentCat.slug}`} 
                                    className="flex items-center gap-2 px-3 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 font-medium transition-all rounded-md"
                                >
                                    {parentCat.image && <img src={parentCat.image} alt={parentCat.name} className="w-5 h-5 object-contain" />}
                                    <span>{parentCat.name}</span>
                                    {parentCat.children.length > 0 && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                                </Link>
                                
                                {parentCat.children.length > 0 && (
                                    <div className="absolute top-full left-0 pt-2 w-64 hidden group-hover:block z-[999]">
                                        <div className="bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden">
                                            <ul className="list-none m-0 py-2 bg-white relative">
                                                {parentCat.children.map((childCat) => (
                                                    <li key={childCat.id}>
                                                        <Link to={`/category/${childCat.slug}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition">
                                                            {childCat.image ? <img src={childCat.image} className="w-8 h-8 rounded border" /> : <span className="text-xs">IMG</span>}
                                                            <span className="text-sm">{childCat.name}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </header>
    );
}

export default Header;