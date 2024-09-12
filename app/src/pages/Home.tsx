import React, { type ReactElement } from "react"
import Navbar from "../components/Navbar"
import AsyncSubmit from "../components/AsyncSubmit"
import { api } from "../api"

const Home = (): ReactElement => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const ButtonClick = async () => {
    setIsLoading(true)
    console.log("Button Clicked")

    // Example POST request
    try {
      const response = await api.post("/test", { key: "value" })
      console.log("Response: ", response)
    } catch (error) {
      console.error("Error: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <h1>Home</h1>
      <div
        onClick={ButtonClick}
        className="Button Button-color--dark-1000 Button"
      >
        {isLoading ? <AsyncSubmit loading={isLoading} /> : "Test"}
      </div>
    </div>
  )
}

export default Home
