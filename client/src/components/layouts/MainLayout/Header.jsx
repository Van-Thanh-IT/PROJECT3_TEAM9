import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, getMe } from '../../../features/auth/authSlice';
import { useEffect } from 'react';


const Header = () => {
    const {isLoggedIn, user} = useSelector(state => state.auth);
    const dispatch = useDispatch();

     useEffect(() => {
       dispatch(getMe());
     }, [dispatch]);
   

    const handleLogout = () => {
        dispatch(logout());
    }

    return (
        <>
            <header>
                <nav>
                   <Link to="/">Trang chủ</Link>
                   <Link to="/product">Trang sản phẩm</Link> 
                   <Link to="/register">Đăng ký</Link>
                   <Link to="/login">Đăng nhập</Link>

                   {isLoggedIn && <Link to="/user/profile">Trang cá nhân</Link>}
                   {isLoggedIn && 
                   <div className='p-5'>     
                        <p>Xin chào{user?.username}</p>
                        <img src={user?.avatar} alt="ảnh" />
                        <button onClick={handleLogout}>Đăng xuất</button>
                   </div>
                   }
             
                </nav>

                
            </header>
        </>
    );
}

export default Header;
