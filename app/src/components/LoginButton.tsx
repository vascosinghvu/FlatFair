import React from 'react';

const LoginButton: React.FC = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:8000/login';
    };

    const handleLogout = () => {
        window.location.href = 'http://localhost:8000/logout';
    };

    return (
        <div>
            <button onClick={handleLogin}>Log In</button>
            <button onClick={handleLogout}>Log Out</button>
        </div>
    );
};

export default LoginButton;