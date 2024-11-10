import React, { useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"

const Middle = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const createUserInBackend = async () => {
      if (isAuthenticated && user) {
        try {
          await api.post(`/api/create-user`, {
            user_id: user.sub,
            email: user.email,
            nickname: user.nickname || user.name,
          })

          console.log("User creation successful")

          // Navigate to the dashboard after user creation
          navigate("/dashboard")
        } catch (err) {
          console.error("Error creating user in backend:", err)
        }
      }
    }

    createUserInBackend()
  }, [isAuthenticated, user, getAccessTokenSilently, navigate])

  return (
    <>
      <div className="Background"></div>
      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__fadeInDown">
          <div className="FormWidget-body-logo"></div>
          <div className="Block">
            <div className="Block-header">We are creating your account!</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Middle
