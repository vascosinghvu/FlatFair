import React, { type ReactElement } from "react"
import { useNavigate } from "react-router-dom"
// import { useAuth0 } from "@auth0/auth0-react"

const Logout = (): ReactElement => {
  const navigate = useNavigate()

  return (
    <>
      <div className="Background"></div>
      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__fadeInDown">
          <div className="FormWidget-body-logo"></div>
          <div className="Block">
            <div className="Block-header">Logout Success!</div>
            You have been successfully logged out. See you soon.
            <div
              onClick={() => {
                navigate("/login")
              }}
              className="Button Button-color--yellow-1000 Margin-top--30"
            >
              Login
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Logout
