import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductHome } from "../productThunks"; // Đường dẫn thunk của bạn
import ProductCard from "./ProductCard";

const ProductList = () => {
  const dispatch = useDispatch();
  const { productHome } = useSelector((state) => state.product);
  useEffect(() => {
    dispatch(fetchProductHome());
  }, [dispatch]);

  const shouldRenderProducts = Array.isArray(productHome) && productHome.length > 0;
  return (
    <div className="container mx-auto ">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sản phẩm mới nhất</h2>

      {/* --- QUAN TRỌNG: KHUNG LƯỚI CHIA CỘT --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {shouldRenderProducts ? (
          productHome.map((product) => (
         
            <ProductCard
              key={product.id}
              product={product}
              onViewDetail={(p) => console.log("Xem:", p)}
            />
          ))
        ) : (
          <p>Đang tải sản phẩm...</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;