import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToHash from "./ScrollToHash"; 

const MainLayout = () => {
  return (
    <div>
      <Header />
      <ScrollToHash />
      <main className="min-h-screen pt-25">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
