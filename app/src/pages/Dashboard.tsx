import React, { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import { useNavigate } from "react-router-dom"
import Icon from "../components/Icon"
import { api } from "../api"
import SpendingChart from "../components/SpendingChart"
import Modal from "../components/Modal"

import { IGroup, IExpense, IUser } from "../types"
// import { API_URL } from "../config"

const Dashboard = () => {
  const navigate = useNavigate()

  // Get user info from backend
  const [userInfo, setUserInfo] = useState<any>(null)
  const [transactions, setTransactions] = useState<IExpense[]>([])
  const [filter, setFilter] = useState<string>("pending")
  const [expenseModal, setExpenseModal] = useState(false)
  const [currExpense, setCurrExpense] = useState<IExpense>()
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get(`/user/get-user`)
        console.log("Full response:", response)

        if (response && response.data && response.data.currentUser) {
          setUserInfo(response.data.currentUser)
          setTransactions(response.data.currentUser.expenses || [])
        } else {
          console.error("Invalid response structure:", response)
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
        // Optionally redirect to login or show error message
        // navigate('/login');
      }
    }

    fetchUserInfo()
  }, [])

  console.log("CURRENT USER: ", userInfo)
  console.log(transactions)

  const downloadExpenseReport = () => {
    if (!transactions.length) {
      alert("No transactions available to download.")
      return
    }

    // Create the report content
    const reportContent = transactions
      .map(
        (transaction) =>
          `Date: ${new Date(transaction.date).toLocaleDateString("en-US")}\n` +
          `Description: ${transaction.description}\n` +
          `Amount: $${transaction.amount.toFixed(2)}\n` +
          `Status: ${transaction.status}\n`
      )
      .join("\n---\n")

    // Create a Blob with the content
    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = "ExpenseReport.txt"
    a.click()

    // Revoke the URL after the download
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {" "}
      {expenseModal && currExpense && (
        <Modal
          header={currExpense.description || "Expense Details"}
          subheader="View and manage this expense"
          action={() => setExpenseModal(false)}
          body={
            <div className="Expense-details">
              <div className="Expense-info">
                <div>
                  <strong>Amount:</strong> ${currExpense.amount.toFixed(2)}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(currExpense.date).toLocaleDateString("en-US")}
                </div>
                <div>
                  <strong>Status:</strong> {currExpense.status || "N/A"}
                </div>
              </div>

              <div className="Expense-allocated">
                <strong>Allocated To:</strong>
                {/* <ul>
                  {currExpense.allocatedTo.map((user: any) => (
                    <li key={user._id}>
                      {user.name}: ${currExpense.allocatedTo[user._id]}
                    </li>
                  ))}
                </ul> */}
              </div>

              <div className="Expense-created-by">
                <strong>Created By:</strong> {currExpense.createdBy.name}
              </div>
            </div>
          }
        />
      )}
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
                <div className="Account-details-item">{userInfo?.name}</div>
                <div className="Account-details-item">{userInfo?.email}</div>
              </div>
            </div>
            <button
              className="Button Button-color--purple-1000 Width--100"
              style={{ marginTop: "10px" }}
              onClick={downloadExpenseReport}
            >
              Download Expense Report
            </button>
          </div>

          <div className="col-lg-6 Flex Flex-column Padding-x--20">
            <div className="Home-subtitle">Spending Log</div>
            <div className="Home-chart">
              <SpendingChart transactions={transactions} />
            </div>
            <div className="Home-subtitle">Purchase Log</div>
            <div className="Flex-row">
              <div
                className={`Button Button-color--yellow-1000 Margin-right--20 ${
                  filter === "settled" ? "Button--hollow" : ""
                }`}
                onClick={() => setFilter("pending")}
              >
                Pending
              </div>
              <div
                className={`Button Button-color--green-1000 Margin-right--20 ${
                  filter === "pending" ? "Button--hollow" : ""
                }`}
                onClick={() => setFilter("settled")}
              >
                Settled
              </div>
            </div>

            <div className="Flex-row Margin-top--20 Align-items--center">
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="Form-box"
              />
              <div className="Flex-row Margin-left--auto">
                <div className="Flex-column">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="Form-box"
                  />
                </div>
                <div className="Flex-column Margin-left--20">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="Form-box"
                  />
                </div>
              </div>
            </div>
            <div className="Home-purchases">
              {transactions
                .filter((transaction) => {
                  // Check for pending or settled status
                  if (filter === "pending") {
                    if (transaction.status === "Settled") return false
                  } else if (filter === "settled") {
                    if (transaction.status !== "Settled") return false
                  }

                  // Apply date filter
                  const transactionDate = new Date(transaction.date)
                  const start = startDate ? new Date(startDate) : null
                  const end = endDate ? new Date(endDate) : null

                  if (start && transactionDate < start) return false
                  if (end && transactionDate > end) return false

                  // Apply search query filter
                  if (
                    searchQuery &&
                    !transaction.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  ) {
                    return false
                  }

                  return true
                })
                .map((transaction, index) => (
                  <div
                    key={index}
                    className="Card Purchase"
                    onClick={() => {
                      setExpenseModal(true)
                      setCurrExpense(transaction)
                    }}
                  >
                    <div className="Flex Flex-row" style={{ flexGrow: 1 }}>
                      <div className="Purchase-item" style={{ width: 75 }}>
                        {new Date(transaction.date).toLocaleDateString("en-US")}
                      </div>
                      <div className="Purchase-item Padding-x--20">
                        <div className="Purchase-item-icon">
                          {userInfo.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="Purchase-item">
                        {transaction.description}
                      </div>
                    </div>
                    <div className="Purchase-item">${transaction.amount}</div>
                    <div
                      className={`Badge Badge-color--${
                        transaction.status === "Pending" ? "yellow" : "green"
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
          </div>
          <div className="col-lg-3">
            <div className="Block">
              <div className="Block-header">Groups</div>
              <div className="Block-subtitle"> Manage your groups.</div>
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

export default Dashboard
