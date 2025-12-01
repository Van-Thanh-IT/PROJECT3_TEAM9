
CREATE DATABASE shoe_store_project;
USE shoe_store_project;

-- Bảng roles: Chỉ còn Admin, Staff, User
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,     -- admin, staff, user
    description VARCHAR(255) NULL
);
select * from roles;
-- Bảng permissions: Giữ nguyên để phân quyền cho nhân viên
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
select * from permissions;

-- Bảng users: Bỏ các trường không cần thiết
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NULL,
    provider ENUM('local','google','facebook') DEFAULT 'local',
    provider_id VARCHAR(255) NULL,
    avatar VARCHAR(500) NULL,
    phone VARCHAR(20) NULL,
    gender ENUM('male','female','other') NULL DEFAULT 'other',
    date_of_birth DATE NULL,
    status ENUM('active','inactive','banned') DEFAULT 'active',
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
select * from users;
-- Bảng user_roles & permission_roles: Giữ nguyên logic
CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY(user_id, role_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);
select * from user_roles;

CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY(role_id, permission_id),
    FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY(permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Token reset pass
CREATE TABLE password_reset_tokens (
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  INDEX (`email`)
);

CREATE TABLE user_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,                        -- Người thực hiện
    action VARCHAR(255) NOT NULL,                -- Hành động (login, update,...)
    ip_address VARCHAR(50) NULL,                 -- IP truy cập
    user_agent VARCHAR(255) NULL,                -- Trình duyệt/thiết bị
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

select * from user_logs;
-- =====================================================================
-- 👟 NHÓM 2: SẢN PHẨM (GIÀY DÉP) - QUAN TRỌNG NHẤT
-- =====================================================================

-- 🆕 Bảng brands: Thương hiệu giày (Nike, Adidas, v.v.)
CREATE TABLE brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo VARCHAR(255) NULL,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);
select * from brands;

-- Bảng categories: Danh mục (Giày nam, Giày nữ, Giày chạy bộ...)
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id INT NULL, -- Hỗ trợ đa cấp: Giày Nam -> Giày Sneaker Nam
    description TEXT NULL,
    image VARCHAR(255) NULL,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);
select * from  categories;

-- Bảng products: Đã xóa shop_id, thêm brand_id
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NULL,                   -- 🔗 Liên kết thương hiệu
    category_id INT NULL,                -- 🔗 Liên kết danh mục
    name VARCHAR(255) NOT NULL,          -- Tên giày (vd: Nike Air Force 1)
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,               -- Mô tả chi tiết
    material VARCHAR(255) NULL,          -- Chất liệu (Da, Vải, ...)
    style VARCHAR(100) NULL,             -- Kiểu dáng (Low-top, High-top)
    price DECIMAL(15,2) NOT NULL,        -- Giá gốc
    old_price DECIMAL(15,2) NULL,        -- cần giảm
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);
update products set old_price = 600000 where id = id; 
select * from products;

-- Bảng product_variants: QUAN TRỌNG CHO GIÀY (Size + Màu)
CREATE TABLE product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    color VARCHAR(50) NOT NULL,          -- Màu sắc (Đen, Trắng, Đỏ...)
    size VARCHAR(10) NOT NULL,           -- Size giày (39, 40, 41, 42...)
    sku VARCHAR(100) UNIQUE NOT NULL,    -- Mã kho (vd: NIK-AF1-WHT-40)
    price DECIMAL(15,2) DEFAULT NULL,    -- Giá riêng nếu size hiếm đắt hơn
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	deleted_at DATETIME NULL,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);
select * from product_variants;
-- Bảng product_images: Ảnh chi tiết (Góc nghiêng, đế giày...)
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,    -- Ảnh bìa sản phẩm
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	deleted_at DATETIME NULL,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

select * from product_images;
-- =====================================================================
-- 🛒 NHÓM 3: ĐƠN HÀNG (Đã xóa shop_id)
-- =====================================================================

-- Bảng giỏ hàng
CREATE TABLE carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_key VARCHAR(100) NOT NULL UNIQUE, -- user_id OR uuid guest
    user_id INT NULL,                      -- null nếu guest
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

select * from carts;
-- Bảng chi tiết giỏ hàng
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_variant_id INT NOT NULL,   -- Mua size nào, màu nào
    quantity INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY(product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);
select * from  cart_items;

CREATE TABLE addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng vouchers: Mã giảm giá (Của cửa hàng bạn tạo)
CREATE TABLE vouchers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percent', 'fixed') NOT NULL, -- Giảm % hay giảm tiền mặt
    discount_value DECIMAL(15,2) NOT NULL,
    min_order_value DECIMAL(15,2) DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    usage_limit INT DEFAULT 0,           -- Giới hạn số lần dùng
    used_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,    -- Mã đơn hàng (vd: ORD-2024-001)
    user_id INT NOT NULL,
    address_id INT NOT NULL,
    voucher_id INT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.0,
    final_amount DECIMAL(15,2) NOT NULL, -- Số tiền thực trả
    status ENUM('pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'canceled', 'returned' ) DEFAULT 'pending',
    note TEXT NULL,                      -- Ghi chú của khách
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL, -- Giữ đơn hàng kể cả khi user bị xóa (để báo cáo)
    FOREIGN KEY(address_id) REFERENCES addresses(id),
    FOREIGN KEY(voucher_id) REFERENCES vouchers(id)
);


CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_variant_id INT NULL,         -- Lưu variant để biết size/màu
    product_name VARCHAR(255) NOT NULL,  -- ⚠️ Lưu cứng tên SP tại thời điểm mua (tránh SP bị sửa tên sau này)
    color VARCHAR(50) NOT NULL,          -- ⚠️ Lưu cứng màu
    size VARCHAR(50) NOT NULL,           -- ⚠️ Lưu cứng size
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    method ENUM('COD','VNPAY','MOMO','BANK') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
    transaction_code VARCHAR(100) NULL,
    provider_response TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);


-- =====================================================================
-- 📦 NHÓM 4: QUẢN LÝ KHO (ĐƠN GIẢN HÓA)
-- =====================================================================
-- Nếu bạn chỉ có 1 kho hàng duy nhất, có thể quản lý số lượng tồn ngay tại bảng `product_variants`.
-- Tuy nhiên, giữ bảng nhập kho này để quản lý lịch sử nhập hàng (Import)

/* ================================================================
   📦 BẢNG TỒN KHO: Lưu số lượng tồn hiện tại của từng biến thể SP
   ================================================================ */
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,

    product_variant_id INT NOT NULL,         -- ID của size + màu sản phẩm
    stock INT NOT NULL DEFAULT 0,            -- Tồn kho hiện tại của biến thể

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,         -- Tự update khi tồn thay đổi

    FOREIGN KEY(product_variant_id) REFERENCES product_variants(id)
);


/* ================================================================
   📥 PHIẾU NHẬP KHO: Lưu các lần nhập hàng vào kho
   ================================================================ */
CREATE TABLE goods_receipts (
    id INT PRIMARY KEY AUTO_INCREMENT,

    supplier_name VARCHAR(255) NULL,         -- Tên nhà cung cấp (Nike VN,...)
    user_id INT NULL,                         -- Nhân viên tạo phiếu nhập

    input_date DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Thời gian nhập
    note TEXT NULL,                            -- Ghi chú: nhập đợt mới, test,...

    FOREIGN KEY(user_id) REFERENCES users(id)
);


/* ================================================================
   📥 CHI TIẾT PHIẾU NHẬP: Từng sản phẩm được nhập
   ================================================================ */
CREATE TABLE goods_receipt_details (
    id INT PRIMARY KEY AUTO_INCREMENT,

    receipt_id INT NOT NULL,                  -- Liên kết phiếu nhập
    product_variant_id INT NOT NULL,          -- Biến thể giày (màu + size)

    quantity INT NOT NULL,                    -- Số lượng nhập
    import_price DECIMAL(15,2) NOT NULL,      -- Giá vốn nhập (vnd)

    FOREIGN KEY(receipt_id) REFERENCES goods_receipts(id) ON DELETE CASCADE,
    FOREIGN KEY(product_variant_id) REFERENCES product_variants(id)
);


/* ================================================================
   📤 PHIẾU XUẤT KHO: Xuất kho cho mục đích khác bán hàng
   ================================================================ */
CREATE TABLE goods_issues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reason VARCHAR(255) NOT NULL,             -- Lý do: hư hỏng / điều chỉnh kho
    user_id INT NULL,                         -- Nhân viên thực hiện
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,   -- Thời gian xuất
    note TEXT NULL,                            -- Ghi chú thêm
    FOREIGN KEY(user_id) REFERENCES users(id)
);
/* ================================================================
   📤 CHI TIẾT PHIẾU XUẤT: Từng biến thể SP bị xuất khỏi kho
   ================================================================ */
CREATE TABLE goods_issue_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    issue_id INT NOT NULL,                    -- Liên kết phiếu xuất
    product_variant_id INT NOT NULL,          -- Size + màu cụ thể
    quantity INT NOT NULL,                    -- Số lượng xuất
    FOREIGN KEY(issue_id) REFERENCES goods_issues(id) ON DELETE CASCADE,
    FOREIGN KEY(product_variant_id) REFERENCES product_variants(id)
);

/* ================================================================
   🔄 BẢNG LỊCH SỬ GIAO DỊCH KHO (IMPORT, EXPORT, ORDER, CANCEL, RETURN)
   ================================================================ */
CREATE TABLE inventory_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_variant_id INT NOT NULL,         -- Size + màu
    change_type ENUM('import','export','order','cancel','return') NOT NULL, 
                                              -- Loại giao dịch kho:
                                              -- import = nhập
                                              -- export = xuất
                                              -- order  = đặt hàng (giảm tồn)
                                              -- cancel = hủy đơn (tăng tồn)
                                              -- return = trả hàng (tăng tồn)
    quantity INT NOT NULL,                   -- SL tăng/giảm
    reference_id INT NULL,                   -- ID phiếu nhập / xuất / đơn hàng
    note VARCHAR(255) NULL,                  -- Ghi chú thêm
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Thời gian thực hiện
    FOREIGN KEY(product_variant_id) REFERENCES product_variants(id)
);

-- =====================================================================
-- 💬 NHÓM 5: TƯƠNG TÁC (REVIEWS & SUPPORT)
-- =====================================================================

CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT NULL,
    images VARCHAR(1000) NULL,           -- Ảnh khách feedback (lưu chuỗi JSON hoặc link)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
select * from reviews;
INSERT INTO reviews (product_id, user_id, rating, comment, images) VALUES
(11, 10, 5, 'Giày rất đẹp, mang êm chân, form chuẩn. Shop giao nhanh!',
 '["https://images.unsplash.com/photo-1606813902915-60aa4e912509?auto=format&w=600&q=80"]'),

(16,11, 4, 'Form đẹp nhưng hơi cứng lúc đầu, đi vài hôm sẽ mềm hơn.',
 '["https://images.unsplash.com/photo-1595950658287-7046c7d37c3e?auto=format&w=600&q=80"]'),

(21, 12, 5, 'Rất hài lòng! Màu sắc giống hình, chất liệu xịn.',
 '["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&w=600&q=80"]'),

(22, 13, 3, 'Giày ổn nhưng giao hàng hơi chậm, hộp bị móp nhẹ.',
 '["https://images.unsplash.com/photo-1528701800489-20be0fbb28dc?auto=format&w=600&q=80"]'),

(23, 14, 4, 'Đi thể thao ổn, đế bám tốt, thoáng khí.',
 '["https://images.unsplash.com/photo-1518226203301-8e5a5dd8c7f0?auto=format&w=600&q=80"]');
-- Sinh 100 review cho product_id = 11 với user_id = 1
INSERT INTO reviews (product_id, user_id, rating, comment, images)
SELECT 
    16 AS product_id,
    1 AS user_id, -- user cố định
    FLOOR(RAND() * 5) + 1 AS rating, -- rating từ 1 → 5
    CONCAT('Đánh giá mẫu số ', seq) AS comment,
    '["https://via.placeholder.com/150"]' AS images
FROM (
    SELECT 1 AS seq UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
) t1
CROSS JOIN (
    SELECT 0 AS n UNION ALL SELECT 10 UNION ALL SELECT 20 UNION ALL SELECT 30 UNION ALL SELECT 40
    UNION ALL SELECT 50 UNION ALL SELECT 60 UNION ALL SELECT 70 UNION ALL SELECT 80 UNION ALL SELECT 90
) t2
LIMIT 100;


-- Thay messages bằng contact_requests (Khách gửi yêu cầu hỗ trợ)
CREATE TABLE support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,                    -- Có thể là khách vãng lai
    email VARCHAR(100) NULL,             -- Nếu chưa đăng nhập
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'processing', 'resolved') DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);