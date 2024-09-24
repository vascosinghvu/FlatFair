import React, { type ReactElement } from "react"
import Navbar from "../components/Navbar"
import AsyncSubmit from "../components/AsyncSubmit"
import { api } from "../api"
import { useNavigate } from "react-router-dom"

const Home = (): ReactElement => {
  // const [isLoading, setIsLoading] = React.useState<boolean>(false)
  // const [isModal, setIsModal] = React.useState<boolean>(false)
  const navigate = useNavigate()

  // const ButtonClick = async () => {
  //   setIsLoading(true)
  //   console.log("Button Clicked")

  //   // Example POST request
  //   try {
  //     const response = await api.post("/test", { key: "value" })
  //     console.log("Response: ", response)
  //   } catch (error) {
  //     console.error("Error: ", error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <div>
      <Navbar />
      <h1>Home</h1>
      <div
        onClick={() => {
          navigate("/create-group")
        }}
        className="Button Button-color--dark-1000"
      >
        Create Group
      </div>
    </div>
  )
}

export default Home
