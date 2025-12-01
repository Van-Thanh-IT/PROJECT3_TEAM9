import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, getMe } from "../../../features/auth/authSlice";

// Icons (có thể thay bằng <span> hoặc <img> nếu muốn)
import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const Topbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", height: "60px", borderBottom: "1px solid #ccc", backgroundColor: "#fff", padding: "0 16px" }}>
      
      {/* Mobile separator */}
      <div style={{ width: "1px", height: "24px", backgroundColor: "#ccc", marginRight: "16px" }} />

      <div style={{ display: "flex", flex: 1, justifyContent: "space-between", alignItems: "center" }}>
        
        {/* Search bar */}
        <form style={{ flex: 1, position: "relative" }} onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="search-field" style={{ display: "none" }}>Tìm kiếm</label>
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input
            id="search-field"
            type="search"
            name="search"
            placeholder="Tìm kiếm dữ liệu..."
            style={{ width: "100%", padding: "8px 8px 8px 32px", fontSize: "14px" }}
          />
        </form>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

          {/* Notification button */}
          <button style={{ position: "relative", padding: "8px", cursor: "pointer" }}>
            🔔
            {/* Red dot */}
            <span style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: "50%", backgroundColor: "red" }}></span>
          </button>

          {/* User profile dropdown */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>
              {user?.username || "Không có"} {user?.avatar && <img src={user.avatar} alt="avatar" style={{ width: 24, height: 24, borderRadius: "50%", verticalAlign: "middle" }} />}
            </span>
            <span>▼</span>
            <button onClick={handleLogout} className="ms-z-10 bg-red-600 text-white p-2">Đăng xuất</button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Topbar;
