import React, { useState } from 'react';

const LoginButton: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        const auth0Domain = 'dev-ye2pqjx7tc2od0kv.us.auth0.com';
        const clientId = 'l3ctHCmborIvDkJbXMghAe54sLL0WjGq';
        const redirectUri = 'https://flat-fair-csac.vercel.app/callback';
        
        const loginUrl = `https://${auth0Domain}/authorize?` +
            `response_type=code&` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=openid%20profile%20email`;

        console.log('Redirecting to:', loginUrl);
        window.location.href = loginUrl;
    };

    if (isLoading) {
        return <div>Redirecting to login...</div>;
    }

    return (
        <div className="login-container" style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Welcome to FlatFair</h2>
            <div className="button-group">
                <button 
                    onClick={handleLogin} 
                    className="login-button"
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        margin: '10px',
                        cursor: 'pointer'
                    }}
                >
                    Login with Auth0
                </button>
            </div>
        </div>
    );
};

export default LoginButton;