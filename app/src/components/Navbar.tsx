import React, { type ReactElement } from "react"
import { useNavigate } from "react-router-dom"

const Navbar = (): ReactElement => {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem("token") // Simple check for a token

  // check if user is logged in with the jwt token

  return (
    <>
      <div className="Navbar">
        <div className="Navbar-body">
          <div className="Navbar-body-logo">
            <span className="Text-color--purple-1000">Flat</span>
            <span className="Text-color--yellow-1000">Fare</span>
          </div>
          {isLoggedIn && (
            <div className="Flex-row Margin-left--auto">
              <div
                className="Navbar-body-link Margin-right--20"
                onClick={() => {
                  navigate("/dashboard")
                }}
              >
                Home
              </div>
              <div
                className="Navbar-body-link Margin-right--20"
                onClick={() => {
                  navigate("/logout") // Redirect after logout
                }}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar
