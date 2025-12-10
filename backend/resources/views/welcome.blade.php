<a href="{{ route('showLogin') }}" class="btn btn-outline-light btn-sm me-2">Đăng nhập</a>
                    <a href="{{ route('showRegister') }}" class="btn btn-outline-light btn-sm">Đăng ký</a>
            </div>

        </div>
    </div>
</nav>

{{-- ================= CONTENT ================= --}}
<main class="container flex-grow-1 py-4">

    @if (session('error'))
        <div class="alert alert-danger">{{ session('error') }}</div>
    @endif

    @if (session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @yield('content')
</main>


{{-- ================= FOOTER MỚI ================= --}}
<footer class="footer mt-auto">
  <div class="container footer-container">

    <div class="footer-section about">
      <h4 class="text-white mb-3">🐾 Về chúng tôi</h4>
      <p class="text-light">
        PetShop cung cấp sản phẩm thú cưng chất lượng cao cùng dịch vụ tận tâm.
        Sự hài lòng của khách hàng luôn là ưu tiên hàng đầu.
      </p>
    </div>

    <div class="footer-section links">
      <h4 class="text-white mb-3">Liên kết nhanh</h4>
      <ul class="list-unstyled">
        <li><a href="{{ route('home') }}">Trang chủ</a></li>
        <li><a href="{{ route('products.index') }}">Sản phẩm</a></li>
        <li><a href="{{ route('orders.index') }}">Đơn hàng</a></li>
      </ul>
    </div>

    <div class="footer-section contact">
      <h4 class="text-white mb-3">Liên hệ</h4>
      <p class="text-light mb-1">Email: support@petshop.com</p>
      <p class="text-light mb-1">Hotline: 0123 456 789</p>
      <p class="text-light">Địa chỉ: 123 Đường ABC, Hà Nội</p>
    </div>

  </div>

  <div class="footer-bottom text-center mt-3 pb-3">
    <p class="text-light mb-0">© 2025 PetShop. All rights reserved.</p>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>