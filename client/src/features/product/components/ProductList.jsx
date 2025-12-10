import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductHome } from "../productThunks"; // Đảm bảo đúng đường dẫn
import ProductCard from "./ProductCard";
import { LeftOutlined, RightOutlined } from "@ant-design/icons"; // Dùng icon nếu có ant-design, hoặc dùng text < >
import { useRef } from "react";



const ProductList = () => {
  const dispatch = useDispatch();
  const listRef = useRef(null);
  
  // Lấy danh sách sản phẩm VÀ thông tin phân trang
  const { productHome, homePagination, status } = useSelector((state) => state.product);

  // Gọi API lần đầu (trang 1)
  useEffect(() => {
    dispatch(fetchProductHome(1));
  }, [dispatch]);

  // Hàm chuyển trang
const handlePageChange = (page) => {
  if (page >= 1 && page <= homePagination.lastPage && page !== homePagination.currentPage) {
    dispatch(fetchProductHome(page));
    listRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
};


  const renderPaginationButtons = () => {
    const pages = [];
    for (let i = 1; i <= homePagination.lastPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 mx-1 rounded-lg font-medium transition-colors duration-200 
            ${i === homePagination.currentPage 
              ? "bg-black text-white shadow-lg" // Style trang hiện tại
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100" // Style trang khác
            }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const shouldRenderProducts = Array.isArray(productHome) && productHome.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sản phẩm mới nhất</h2>

      {/* --- DANH SÁCH SẢN PHẨM --- */}
      <div ref={listRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[400px]">
        {status === 'loading' ? (
           // Skeleton Loading hoặc Text loading đơn giản
           <div className="col-span-full text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
        ) : shouldRenderProducts ? (
          productHome.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetail={(p) => console.log("Xem:", p)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-500">Không có sản phẩm nào.</div>
        )}
      </div>

      {/* --- PHÂN TRANG (PAGINATION) --- */}
      {homePagination.lastPage > 1 && (
        <div className="flex justify-center items-center mt-10 space-x-2">
          {/* Nút Previous */}
          <button
            onClick={() => handlePageChange(homePagination.currentPage - 1)}
            disabled={homePagination.currentPage === 1}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors
              ${homePagination.currentPage === 1 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"}`}
          >
            <LeftOutlined /> Trước
          </button>

          {/* Các nút số trang */}
          <div className="hidden sm:flex">
             {renderPaginationButtons()}
          </div>
          
          {/* Hiển thị dạng text trên mobile cho gọn: "Trang 1 / 5" */}
          <div className="sm:hidden text-gray-600 font-medium px-2">
             {homePagination.currentPage} / {homePagination.lastPage}
          </div>

          {/* Nút Next */}
          <button
            onClick={() => handlePageChange(homePagination.currentPage + 1)}
            disabled={homePagination.currentPage === homePagination.lastPage}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors
              ${homePagination.currentPage === homePagination.lastPage
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"}`}
          >
            Sau <RightOutlined />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;