<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\VoucherController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\SupportController;

use App\Http\Controllers\Client\CartController;
use App\Http\Controllers\Client\ProfileController;
use App\Http\Controllers\Client\HomeController;
use App\Http\Controllers\Client\GoshipController;

// Auth Routes

Route::prefix("auth")->group(function() {
    // Public routes
    Route::post("/register", [AuthController::class, "register"]);
    Route::post("/login", [AuthController::class, "login"]);
    Route::post("/google/login", [AuthController::class, "loginWithGoogle"]);
    Route::post("/facebook/login", [AuthController::class, "loginWithFacebook"]);
    Route::post("/forgot-password", [AuthController::class, "forgotPassword"]);
    Route::post('/reset-password', [AuthController::class, 'reset'])->name('password.reset');

    // Protected routes
    Route::middleware('auth:jwt')->group(function() {
        Route::post("/logout", [AuthController::class, "logout"]);
        Route::post("/refresh-token", [AuthController::class, "refresh"]);
        Route::post("/me", [AuthController::class, "me"]);
    });
});


// Admin Routes (auth + role: admin)

Route::middleware(["auth:jwt", "check.role:admin"])->prefix("admin")->group(function() {
    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/summary-total', [DashboardController::class, 'summaryTotal']);
        Route::get('/summary', [DashboardController::class, 'summary']);
        Route::get('/revenue', [DashboardController::class, 'revenue']);
        Route::get('/order-status', [DashboardController::class, 'orderStatus']);
        Route::get('/top-products', [DashboardController::class, 'topProducts']);
        Route::get('/inventory-flow', [DashboardController::class, 'inventoryFlow']);
        Route::get('/inventory-value', [DashboardController::class, 'inventoryValue']);
        Route::get('/new-users', [DashboardController::class, 'newUsers']);
        Route::get('/active-users', [DashboardController::class, 'activeUsers']);
        Route::get('/top-customers', [DashboardController::class, 'topCustomers']);
        Route::get('/voucher-usage', [DashboardController::class, 'voucherUsage']);
    });


    // Staff
    Route::prefix("staffs")->group(function() {
        Route::get('/', [StaffController::class, 'index']);
        Route::get('{id}', [StaffController::class, 'show']);
        Route::post('/', [StaffController::class, 'store']);
        Route::put('{id}', [StaffController::class, 'update']);
        Route::patch('{id}/status', [StaffController::class, 'updateStatus']);
    });

    // Users
    Route::prefix("users")->group(function() {
        Route::get("/", [UserController::class, "index"]);
        Route::get("/{id}", [UserController::class, "show"]);
        Route::put("/{id}/status", [UserController::class, "updateStatus"]);
    });

    // Brands
    Route::prefix('brands')->group(function () {
        Route::get('/', [BrandController::class, 'index']);
        Route::get('/trash', [BrandController::class, 'trash']);
        Route::get('/{id}', [BrandController::class, 'show']);
        Route::post('/', [BrandController::class, 'store']);
        Route::put('/{id}', [BrandController::class, 'update']);
        Route::delete('/{id}', [BrandController::class, 'destroy']);
        Route::post('/{id}/restore', [BrandController::class, 'restore']);
    });

    // Categories
    Route::prefix("categories")->group(function(){
        Route::post('/', [CategoryController::class, 'store']);
        Route::get('/{id}', [CategoryController::class, 'show']);
        Route::put('/{id}', [CategoryController::class, 'update']);
        Route::patch('/{id}/toggle', [CategoryController::class, 'toggleStatus']);
    });

    // Products
    Route::prefix("products")->group(function(){
        Route::get("/", [ProductController::class, "index"]);
        Route::get("/{id}", [ProductController::class, "show"]);
        Route::post("/", [ProductController::class, "store"]);
        Route::put("/{id}", [ProductController::class, "update"]);
        Route::patch("/{id}/status", [ProductController::class, "toggleStatus"]);

        // Variants
        Route::post("{id}/variants", [ProductController::class, "variantStore"]);
        Route::put("{id}/variants", [ProductController::class, "updateVariant"]);
        Route::delete("/{id}/variants", [ProductController::class, "softDeleteVariant"]);

        // Images
        Route::post("{id}/images", [ProductController::class, "storeImage"]);
        Route::delete("{id}/images", [ProductController::class, "softDeleteImage"]);
        Route::put('{productId}/images/{imageId}/primary', [ProductController::class, 'setPrimary']);
    });

    // Vouchers
    Route::prefix('vouchers')->group(function () {
        Route::post('/', [VoucherController::class, 'store']);
        Route::put('/{id}', [VoucherController::class, 'update']);
        Route::delete('/{id}', [VoucherController::class, 'destroy']);
    });

    //order
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
    });

    //inventory
    Route::prefix('inventories')->group(function () {
        Route::get('/', [InventoryController::class, 'index']);
        Route::get('/detail/{noteId}', [InventoryController::class, 'getNoteDetail']);
        Route::post('/import', [InventoryController::class, 'importStock']);
        Route::post('/export', [InventoryController::class, 'exportStock']);
        Route::post('/adjust', [InventoryController::class, 'adjustStock']);
        Route::get('/history/{variantId}', [InventoryController::class, 'variantHistory']);   
    });
});


//Client Routes
Route::prefix("client")->group(function () {

    // Products
    Route::get("/products", [HomeController::class, "getProductHome"]);
    Route::get("/products/selling", [HomeController::class, "getBestSellingProduct"]);
    Route::get('/products/reviews', [HomeController::class, 'getProductReviewsForHome']);
    Route::get("/products/search", [HomeController::class, "search"]);
    Route::get("/products/{slug}", [HomeController::class, "getProductDetail"]);
    Route::get('/categories/{slug}/products', [HomeController::class, 'getProductsByCategorySlug']);
   
    
    
    
    // Order & Payment
    Route::post("/pay", [HomeController::class, "payment"]);
    Route::post("/order", [HomeController::class, "createOrder"]);
    Route::post('/apply-voucher', [HomeController::class, 'apply']);
    Route::get('/vouchers', [VoucherController::class, 'index']);

    // Cart
    Route::prefix("carts")->group(function () {
        Route::post("/add", [CartController::class, "addItems"]);
        Route::get("/", [CartController::class, "getCart"]);
        Route::delete("/removeItem/{id}", [CartController::class, "removeItem"]);
        Route::patch("/item/{id}", [CartController::class, "updateItemQuantity"]);
    });

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
});

//User Routes (auth + role: user, admin)
Route::middleware(["auth:jwt", "check.role:user,admin"])->prefix("users")->group(function(){
        Route::put("/me/update", [ProfileController::class, "update"]);
        Route::get("/me/orders", [ProfileController::class, "getOrdersByUser"]);
        Route::get("/me/orders/{id}", [ProfileController::class, "getOrderDetail"]);
        Route::post("/me/reviews", [ProfileController::class, "rateOrder"]);
        Route::delete("/me/orders/{id}/cancel", [ProfileController::class, "cancelOrder"]);
});

//Goship Routes
Route::prefix('goship')->group(function () {
    Route::get('/cities', [GoshipController::class, 'cities']);
    Route::get('/cities/{cityCode}/districts', [GoshipController::class, 'districts']);
    Route::get('/districts/{districtCode}/wards', [GoshipController::class, 'wards']);
    Route::post("/shipping-fee", [GoshipController::class, "shippingFee"]);
    Route::post('/webhook', [GoshipController::class, 'webhook']);
});


Route::middleware('auth:jwt')->prefix('support')->group(function () {
    Route::post('/ticket', [SupportController::class, 'createTicket']);
    Route::get('/tickets', [SupportController::class, 'listTickets']);
    Route::get('/messages/{id}', [SupportController::class, 'getMessages']);
    Route::post('/send', [SupportController::class, 'sendMessage']);
});