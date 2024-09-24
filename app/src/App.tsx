import React, { type ReactElement } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CreateGroup from "./pages/CreateGroup"

function App(): ReactElement {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create-group" element={<CreateGroup />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
