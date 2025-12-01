// src/components/layout/AuthLayout.jsx
import React from 'react';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
           <img src="/logo.png" alt="Logo" className="auth-logo" />
           <h1 className="auth-title">{title}</h1>
        </div>
        
        <div className="auth-content">
           {children} 
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;