import React, { useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"

const Middle = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0() // Get user, isAuthenticated, and isLoading
  const navigate = useNavigate()

  useEffect(() => {
    const createUserInBackend = async () => {
      if (!isLoading && isAuthenticated && user) {
        console.log(user)
        try {
          const response = await api.post(`/user/create-user`, {
            user_id: user.sub,
            email: user.email,
            nickname: user.nickname || user.name,
          })

          if (response.status === 201) {
            console.log("User creation successful")
            // Navigate to the dashboard after successful user creation
            navigate("/dashboard")
          } else {
            console.error("Unexpected response status:", response.status)
          }
        } catch (err) {
          console.error("Error creating user in backend:", err)
        }
      }
    }

    createUserInBackend()
  }, [isLoading, isAuthenticated, user, navigate]) // Dependencies include isLoading, isAuthenticated, and user

  return (
    <>
      <div className="Background"></div>
      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__fadeInDown">
          <div className="FormWidget-body-logo"></div>
          <div className="Block">
            <div className="Block-header">We are creating your account!</div>
          </div>
          <div
            className="Navbar-body-link Margin-right--20"
            onClick={() => {
              logout() // Log out of Auth0
              navigate("/login") // Redirect after logout
            }}
          >
            Logout
          </div>
        </div>
      </div>
    </>
  )
}

export default Middle
