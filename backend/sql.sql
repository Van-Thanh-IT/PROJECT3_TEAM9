
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
    user_id INT NOT NULL,                        -- Người thực hiện
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Bảng product_variants: QUAN TRỌNG CHO GIÀY (Size + Màu)
CREATE TABLE product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    color VARCHAR(50) NOT NULL,          -- Màu sắc (Đen, Trắng, Đỏ...)
    size VARCHAR(10) NOT NULL,           -- Size giày (39, 40, 41, 42...)
    sku VARCHAR(100) UNIQUE NOT NULL,    -- Mã kho (vd: NIK-AF1-WHT-40)
    price DECIMAL(15,2) DEFAULT NULL,    -- Giá riêng nếu size hiếm đắt hơn
    stock_quantity INT DEFAULT 0,        -- ⚡ Đưa tồn kho vào đây cho đơn giản (hoặc dùng bảng inventory riêng nếu kho phức tạp)
    image VARCHAR(255) NULL,             -- Ảnh đại diện cho biến thể này
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng product_images: Ảnh chi tiết (Góc nghiêng, đế giày...)
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,    -- Ảnh bìa sản phẩm
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =====================================================================
-- 🛒 NHÓM 3: ĐƠN HÀNG (Đã xóa shop_id)
-- =====================================================================

CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_variant_id INT NOT NULL,     -- Mua size nào, màu nào
    quantity INT DEFAULT 1,
    FOREIGN KEY(cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY(product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

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
    payment_method ENUM('COD','VNPAY','MOMO','BANK') DEFAULT 'COD',
    payment_status ENUM('pending','completed','failed') DEFAULT 'pending',
    status ENUM('pending','confirmed','shipping','delivered','canceled','returned') DEFAULT 'pending',
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

-- =====================================================================
-- 📦 NHÓM 4: QUẢN LÝ KHO (ĐƠN GIẢN HÓA)
-- =====================================================================
-- Nếu bạn chỉ có 1 kho hàng duy nhất, có thể quản lý số lượng tồn ngay tại bảng `product_variants`.
-- Tuy nhiên, giữ bảng nhập kho này để quản lý lịch sử nhập hàng (Import)

CREATE TABLE goods_receipts ( -- Phiếu nhập hàng
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(255) NULL,     -- Nhập từ đâu (Nike Distributor...)
    input_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_cost DECIMAL(15,2) DEFAULT 0,
    note TEXT NULL
);

CREATE TABLE goods_receipt_details ( -- Chi tiết nhập
    id INT PRIMARY KEY AUTO_INCREMENT,
    receipt_id INT NOT NULL,
    product_variant_id INT NOT NULL,
    quantity INT NOT NULL,
    import_price DECIMAL(15,2) NOT NULL, -- Giá vốn
    FOREIGN KEY(receipt_id) REFERENCES goods_receipts(id) ON DELETE CASCADE,
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