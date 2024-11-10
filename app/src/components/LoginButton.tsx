import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const LoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = () => {
    setIsLoading(true)
    navigate("/login")
  }

  useEffect(() => {
    // Log the API URL when component mounts
    console.log("Current API_URL:", process.env.REACT_APP_API_URL)
  }, [])

  if (isLoading) {
    return <div>Redirecting to login...</div>
  }

  return (
    <div
      className="login-container"
      style={{ textAlign: "center", padding: "20px" }}
    >
      <h2>Welcome to FlatFair</h2>
      <div className="button-group">
        <button
          onClick={handleLogin}
          className="login-button"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            margin: "10px",
            cursor: "pointer",
          }}
        >
          Login with Auth0
        </button>
      </div>
    </div>
  )
}

export default LoginButton
