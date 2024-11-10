import React from 'react';
import { API_URL } from '../config';

const LoginButton: React.FC = () => {
    const handleLogin = () => {
        window.location.href = `${API_URL}/login`;
    };

    const handleLogout = () => {
        window.location.href = `${API_URL}/logout`;
    };

    return (
        <div>
            <button onClick={handleLogin}>Log In</button>
            <button onClick={handleLogout}>Log Out</button>
        </div>
    );
};

export default LoginButton;