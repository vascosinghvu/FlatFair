import React from 'react';
import { API_URL } from '../config';

const LoginButton: React.FC = () => {
    const handleLogin = async () => {
        try {
            console.log('Attempting login with API URL:', API_URL);
            window.location.href = `${API_URL}/login`;
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleLogout = async () => {
        try {
            console.log('Attempting logout');
            window.location.href = `${API_URL}/logout`;
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="login-container">
            <h2>Welcome to FlatFair</h2>
            <div className="button-group">
                <button onClick={handleLogin} className="login-button">Log In</button>
                <button onClick={handleLogout} className="logout-button">Log Out</button>
            </div>
        </div>
    );
};

export default LoginButton;