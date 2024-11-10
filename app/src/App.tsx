import React, { type ReactElement } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import CreateGroup from "./pages/CreateGroup"
import Profile from "./pages/Profile"
import Group from "./pages/Group"
import Logout from "./pages/Logout"
import LoginButton from "./components/LoginButton"
import Landing from "./pages/Landing"

function App(): ReactElement {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<LoginButton />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/group/:groupid" element={<Group />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </div>
  )
}

export default App
