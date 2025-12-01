import React from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Topbar />
        <div className="p-5 bg-gray-100 min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
