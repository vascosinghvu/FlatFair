import React, { type ReactElement } from "react"
import { Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import CreateGroup from "./pages/CreateGroup"
import Group from "./pages/Group"
import Logout from "./pages/Logout"
import Landing from "./pages/Landing"
import CreateAccount from "./pages/CreateAccount"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"

function App(): ReactElement {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/group/:groupid" element={<Group />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  )
}

export default App
