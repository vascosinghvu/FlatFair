import React, { useState, useEffect } from "react"
import { Formik, Form, Field, FieldArray } from "formik"
import * as yup from "yup"
import Navbar from "../components/Navbar"
import AsyncSubmit from "../components/AsyncSubmit"
import { useNavigate } from "react-router-dom"
import Modal from "../components/Modal"
import Icon from "../components/Icon"
import SpendingChart from "../components/SpendingChart"

import { IGroup, IExpense, IUser } from "../types"

const Home = () => {
  const [isModal, setIsModal] = useState(false)
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<any[]>([]) // Initialize as empty array

  // Get user info from backend
  const [userInfo, setUserInfo] = useState<any>(null)
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:8000/user/get-user", {
          method: "GET", // GET request to retrieve data
          credentials: "include", // Include credentials (cookies, etc.)
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json() // Parse the JSON response
        console.log("User Info:", data)
        // Store the response in a variable or state
        setUserInfo(data.currentUser) // Assuming you're using state to store the info
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    fetchUserInfo() // Call the fetch function inside useEffect
  }, []) // Empty dependency array to run once on component mount

  console.log("CURRENT USER: ", userInfo)

  function formatTime(date: Date): string {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12 // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    return `${formattedHours}:${formattedMinutes} ${period}`
  }

  return (
    <>
      {" "}
      <Navbar />
      <div className="Home">
        {/* <div className="Home-title">Welcome back, *User*</div> */}
        <div className="row d-flex Justify-content--spaceBetween">
          <div className="col-lg-3">
            <div className="Block">
              <div className="Home-subtitle">Account Details</div>
              <div className="Block-subtitle"> Manage your account.</div>
              <div className="Flex Flex-column Flex--center">
                <div className="Account-icon">
                  <Icon glyph="user" />
                </div>
              </div>
              <div className="Account-details">
                <div className="Account-details-item">Charlotte Conze</div>
                <div className="Account-details-item">
                  charlotte.j.conze@vanderbilt.edu
                </div>
                <div className="Account-details-item">111-111-1111</div>
              </div>

              <div
                className="Button Button--hollow Button-color--dark-1000"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </div>
            </div>
          </div>
          <div className="col-lg-6 Flex Flex-column Padding-x--20">
            <div className="Home-subtitle">Spending Log</div>
            <SpendingChart transactions={transactions} />
            <div className="Home-subtitle">Purchase Log</div>
            {transactions.map((transaction, index) => (
              <div key={index} className="Card Purchase">
                <div className="Flex Flex-row" style={{ flexGrow: 1 }}>
                  <div className="Purchase-item " style={{ width: 75 }}>
                    {formatTime(transaction.timestamp)}
                  </div>
                  <div className="Purchase-item Padding-x--20">
                    <div className="Purchase-item-icon">
                      {transaction.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="Purchase-item">
                    {transaction.name}
                    <div className="Purchase-item-subtitle">
                      {transaction.group}
                    </div>
                  </div>
                </div>

                <div className="Purchase-item">${transaction.amount}</div>
                <div
                  className={`Badge Badge-color--${
                    transaction.status === "Pending" ? "yellow" : "purple"
                  }-1000 Margin-left--20`}
                  style={{ width: 100 }}
                >
                  {transaction.status}
                </div>
              </div>
            ))}
            {/* <div className="Block Margin-top--20">
              <div className="Block-header">Purchase History</div>
              <div className="Block-subtitle">View your recent purchases.</div>
            </div> */}
          </div>
          <div className="col-lg-3">
            <div className="Block">
              <div className="Block-header">Groups</div>
              <div className="Block-subtitle"> Manage your groups.</div>
              {console.log("CURRENT USER INFO:", userInfo)}
              {console.log("CURRENT USER GROUPS:", userInfo?.groups)}
              {userInfo &&
                userInfo.groups &&
                userInfo.groups.map((group: IGroup, index: number) => (
                  <div key={index} className="Home-group">
                    <div className="Home-group-title">{group.groupName}</div>
                    <div className="Home-group-body">
                      {group.members
                        .map((member) => {
                          const user = member as IUser
                          return user.name
                        })
                        .join(", ")}
                    </div>
                    <div
                      className="Button Button--hollow Button-color--maroon-1000"
                      onClick={() => {
                        navigate(`/group/${group._id}`)
                      }}
                    >
                      Manage Group
                    </div>
                  </div>
                ))}

              <div
                onClick={() => {
                  navigate("/create-group")
                }}
                className="Button Button-color--dark-1000"
              >
                Create Group
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
