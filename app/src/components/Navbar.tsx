import React, { type ReactElement } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"

const Navbar = (): ReactElement => {
  const navigate = useNavigate()

  return (
    <>
      <div className="Navbar">
        <div className="Navbar-body">
          <div className="Navbar-body-logo">
            <span className="Text-color--purple-1000">Flat</span>
            <span className="Text-color--yellow-1000">Fare</span>
          </div>
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
                navigate("/login") // Redirect after logout
              }}
            >
              Logout
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
