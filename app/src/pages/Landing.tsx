import React, { useEffect, type ReactElement } from "react"
import { useNavigate } from "react-router-dom"

const Landing = (): ReactElement => {
  const navigate = useNavigate()
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
                navigate("/login")
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
