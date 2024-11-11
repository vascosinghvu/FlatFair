import React, { type ReactElement } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import CreateGroup from "./pages/CreateGroup"
import Profile from "./pages/Profile"
import Group from "./pages/Group"
import Logout from "./pages/Logout"
import Landing from "./pages/Landing"
import CreateAccount from "./pages/CreateAccount"
import Login from "./pages/Login"

function App(): ReactElement {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/group/:groupid" element={<Group />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </div>
  )
}

export default App
