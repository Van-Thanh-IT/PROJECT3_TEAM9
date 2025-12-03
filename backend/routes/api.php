<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\ProductController;


use App\Http\Controllers\Client\CartController;
use App\Http\Controllers\Client\ProfileController;
use App\Http\Controllers\Client\HomeController;

// nhóm auth
Route::prefix("auth")->group(function(){
    // public routes
    Route::post("/register", [AuthController::class, "register"]);
    Route::post("/login", [AuthController::class, "login"]);
    Route::post("/google/login", [AuthController::class, "loginWithGoogle"]);
    Route::post("/facebook/login", [AuthController::class, "loginWithFacebook"]);
    Route::post("/forgot-password", [AuthController::class, "forgotPassword"]);
    Route::post('/reset-password', [AuthController::class, 'reset'])->name('password.reset');
     
    //protected routes
    Route::middleware('auth:jwt')->group(function(){
        Route::post("/logout", [AuthController::class, "logout"]);
        Route::post("/refresh-token", [AuthController::class, "refresh"]);
        Route::post("/me", [AuthController::class, "me"]);
    });  
});


// chỉ admin có quyền
Route::middleware(["auth:jwt", "check.role:admin"])->prefix("admin")->group(function(){

    Route::prefix("staffs")->group(function(){
        Route::get('/', [StaffController::class, 'index']);        
        Route::get('{id}', [StaffController::class, 'show']);      
        Route::post('/', [StaffController::class, 'store']);        
        Route::put('{id}', [StaffController::class, 'update']);      
        Route::patch('{id}/status', [StaffController::class, 'updateStatus']);
    });

    Route::prefix("users")->group(function(){
        Route::get("/", [UserController::class, "index"]);
        Route::get("/{id}", [UserController::class, "show"]);
        Route::put("/{id}/status", [UserController::class, "updateStatus"]);
    });

   
    Route::prefix('brands')->group(function () {
        Route::get('/', [BrandController::class, 'index']);
        Route::get('/trash', [BrandController::class, 'trash']);          
        Route::get('/{id}', [BrandController::class, 'show']);    
        Route::post('/', [BrandController::class, 'store']);       
        Route::put('/{id}', [BrandController::class, 'update']);    
        Route::delete('/{id}', [BrandController::class, 'destroy']); 
        Route::post('/{id}/restore', [BrandController::class, 'restore']);
    });
   

    Route::prefix("categories")->group(function(){
        Route::post('/', [CategoryController::class, 'store']);
        Route::get('/{id}', [CategoryController::class, 'show']);
        Route::put('/{id}', [CategoryController::class, 'update']);
        Route::patch('/{id}/toggle', [CategoryController::class, 'toggleStatus']);
    });

    Route::prefix("products")->group(function(){
        Route::get("/", [ProductController::class, "index"]);
        Route::get("/{id}",[ProductController::class, "show"]);
        Route::post("/", [ProductController::class, "store"]);
        Route::put("/{id}",[ProductController::class, "update"]);
        Route::patch("/{id}/status", [ProductController::class, "toggleStatus"]);

        Route::post("{id}/variants", [ProductController::class, "variantStore"]);
        Route::put("{id}/variants", [ProductController::class, "updateVariant"]);
        Route::delete("/{id}/variants",[ProductController::class, "softDeleteVariant"]);

        Route::post("{id}/images",[ProductController::class, "storeImage"]);
        Route::delete("{id}/images",[ProductController::class, "softDeleteImage"]);
        Route::put('{productId}/images/{imageId}/primary', [ProductController::class, 'setPrimary']);
       
   });
});

Route::prefix("client")->group(function () {
    Route::get("/products", [HomeController::class, "getProductHome"]);

    Route::get("/products/search", [HomeController::class, "search"]);
    
    Route::get("/products/{slug}", [HomeController::class, "getProductDetail"]);
    Route::get('/categories/{slug}/products', [HomeController::class, 'getProductsByCategorySlug']);
    Route::post("/pay", [HomeController::class, "payment"]);
    
    Route::prefix("carts")->group(function () {
        Route::post("/add", [CartController::class, "addItems"]);
        Route::post("/merge", [CartController::class, "merge"]);
        Route::get("/", [CartController::class, "getCart"]);
        Route::delete("/removeItem/{id}", [CartController::class, "removeItem"]);
        Route::delete("/removeOrderedItems", [CartController::class, "removeOrderedItems"]); 
        Route::patch("/item/{id}", [CartController::class, "updateItemQuantity"]);
    });

    Route::get('/categories', [CategoryController::class, 'index']);


   

});

Route::middleware(["auth:jwt", "check.role:user,admin"])->prefix("user")->group(function(){
    Route::get("/profile", [ProfileController::class, "index"]);
    Route::put("/profile/{id}", [ProfileController::class, "update"]);
});
