import React, { useEffect, type ReactElement } from "react"
import { useAuth0 } from "@auth0/auth0-react"

const Landing = (): ReactElement => {
  const { loginWithRedirect } = useAuth0()

  return (
    <>
      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__fadeInDown">
          <div className="FormWidget-body-logo"></div>
          <div className="Block">
            <div className="Block-header">Welcome to FlatFair</div>
            Login or create an account to get started.
            <div
              onClick={() => {
                loginWithRedirect()
              }}
              className="Button Button-color--yellow-1000 Margin-top--30"
            >
              Get Started
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Landing
