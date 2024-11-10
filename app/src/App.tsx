import React, { type ReactElement } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CreateGroup from "./pages/CreateGroup"
import Profile from "./pages/Profile"
import Group from "./pages/Group"
import Logout from "./pages/Logout"
import LoginButton from "./components/LoginButton"
import ErrorBoundary from './components/ErrorBoundary';

function App(): ReactElement {
  return (
    <ErrorBoundary>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LoginButton />} />
            <Route path="/callback" element={<Home />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/group/:groupid" element={<Group />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  )
}

export default App
