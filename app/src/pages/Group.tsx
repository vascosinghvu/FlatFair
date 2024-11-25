import React, { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import * as yup from "yup"
import { Formik, Form, Field, FieldArray } from "formik"
import Modal from "../components/Modal"
import AsyncSubmit from "../components/AsyncSubmit"
import { api } from "../api"
import { useParams } from "react-router-dom"
import { IGroup, IExpense, IUser } from "../types"
import Icon from "../components/Icon"
import { error } from "console"

const Group = () => {
  const { groupid } = useParams()

  // State variables
  const [groupInfo, setGroupInfo] = useState<any>(null)
  const [memberMap, setMemberMap] = useState<any>({})
  const [memberInitialValues, setMemberInitialValues] = useState<any>([])
  const [userInfo, setUserInfo] = useState<any>(null)
  const [balances, setBalances] = useState<any>(null)

  const [isModal, setIsModal] = useState(false)
  const [isEditModal, setEditModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selection, setSelection] = useState("Equally") // Default to "Equally"
  const [errorMessage, setErrorMessage] = useState("")
  const [settleModal, setSettleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IExpenseEntry>()
  const [selectedMember, setSelectedMember] = useState<IUser>()
  const [addMemberModal, setAddMemberModal] = useState(false)
  const [expenseModal, setExpenseModal] = useState(false)
  const [currExpense, setCurrExpense] = useState<IExpense>()
  const [totalDue, setTotalDue] = useState<number>(0)
  const [expenseArr, setExpenseArr] = useState<any[]>([])

  interface IExpenseEntry {
    memberId: string // User ID of the member
    memberName: string // Name of the member
    expenses: IExpense[] // Array of expenses with this user
    totalAmountOwed: number // Total amount owed by/to this member
  }

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get("/user/get-user")
        if (response.data && response.data.currentUser) {
          setUserInfo(response.data.currentUser)
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    const fetchGroupInfo = async () => {
      try {
        const response = await api.get(`/group/get-group/${groupid}`)
        const data = response.data

        console.log("Group Info:", data)

        setGroupInfo(data.group)

        // Set initial member values for form
        setMemberInitialValues(
          data.group.members.map((member: any) => ({
            name: member.name,
            selected: false,
            splitValue: undefined,
            id: member._id,
          }))
        )

        // Create a name-to-ID map for quick lookups
        setMemberMap(() => {
          const groupMembers: IUser[] = data.group.members
          return groupMembers.reduce<{ [name: string]: string }>(
            (map, user) => {
              const username = user.name as string
              const userID = user._id as string
              map[username] = userID
              return map
            },
            {}
          )
        })

        return data.group // Return group data for use in the next function
      } catch (error) {
        console.error("Error fetching group info:", error)
      }
    }

    const fetchExpensesForAllMembers = async (groupMembers: IUser[]) => {
      try {
        if (!groupMembers) return

        let totalDueAccumulator = 0
        let expenseArrAccumulator: IExpenseEntry[] = []

        const expensesResults = await Promise.all(
          groupMembers.map(async (member: IUser) => {
            try {
              // Call the API for each member
              const response = await api.get(
                `/expense/get-expenses-between-users/${member._id}`
              )

              // Accumulate total due
              totalDueAccumulator += response.data.totalAmountOwed

              // Accumulate the expense array
              expenseArrAccumulator.push({
                memberId: member._id || "",
                memberName: member.name,
                expenses: response.data.expenses,
                totalAmountOwed: response.data.totalAmountOwed,
              })

              return {
                memberId: member._id,
                memberName: member.name,
                expenses: response.data.expenses,
                totalAmountOwed: response.data.totalAmountOwed,
              }
            } catch (error) {
              console.error(
                `Error fetching expenses for ${member.name}:`,
                error
              )
              return null // Handle errors gracefully
            }
          })
        )

        // Update state once after all promises resolve
        setTotalDue(totalDueAccumulator)
        setExpenseArr(expenseArrAccumulator)

        console.log("Expenses Results:", expensesResults)
      } catch (error) {
        console.error("Error fetching expenses for all members:", error)
      }
    }

    const fetchAllData = async () => {
      try {
        await fetchUserInfo()
        const groupData = await fetchGroupInfo()
        await fetchExpensesForAllMembers(groupData.members)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    if (groupid) {
      fetchAllData()
    }
  }, [groupid]) // Removed groupInfo from dependency array

  // console.log("CURRENT GROUP: ", groupInfo)
  // console.log("user info: ", userInfo)

  // console.log("Members:", groupInfo?.members)
  console.log("Expense arr", expenseArr)

  const initialValues = {
    item: "",
    cost: 0,
    date: "",
    members: memberInitialValues,
  }

  const validationSchema = yup.object().shape({
    item: yup.string().required("Please enter an item or activity"),
    cost: yup
      .number()
      .positive("Cost must be a positive number")
      .required("Please enter the cost"),
    date: yup.string().required("Please select a date"),
  })

  const addExpense = async (values: any, { resetForm }: any) => {
    setIsLoading(true)
    setErrorMessage("") // Clear error message at the start of submission

    try {
      // Initialize a variable to hold the breakdown for each member
      let memberBreakdown: { memberID: string; amountDue: any }[] = []

      // Calculate total amount owed based on the selection method
      const totalCost = values.cost
      const selectedMembers = values.members.filter(
        (member: { selected: any }) => member.selected
      )

      if (selection === "Equally") {
        // Split the total cost equally between the selected members
        const amountPerMember = totalCost / selectedMembers.length
        selectedMembers.forEach((member: { name: any }) => {
          memberBreakdown.push({
            memberID: memberMap[member.name],
            amountDue: amountPerMember,
          })
        })
      } else if (selection === "By Percent") {
        // Split the total cost based on the percentage provided for each selected member
        selectedMembers.forEach((member: { splitValue: number; name: any }) => {
          const percentage = member.splitValue || 0 // default to 0 if no percentage provided
          const amountDue = (percentage / 100) * totalCost
          memberBreakdown.push({
            memberID: memberMap[member.name],
            amountDue: amountDue,
          })
        })
      } else if (selection === "Manual") {
        // Use the manual amounts provided for each selected member
        selectedMembers.forEach((member: { splitValue: number; name: any }) => {
          const amountDue = member.splitValue || 0 // default to 0 if no amount provided
          memberBreakdown.push({
            memberID: memberMap[member.name],
            amountDue: amountDue,
          })
        })
      }

      // Package the final data to submit
      const finalData = {
        item: values.item,
        totalCost: totalCost,
        date: values.date,
        memberBreakdown: memberBreakdown,
        groupID: groupid,
      }

      console.log("Submitting data:", finalData)

      // Send POST request to the /group/add-expense endpoint
      // const response = await api.post("/group/add-expense", finalData)
      const response = await api.post(`/expense/add-expense`, finalData)
      console.log("Expense logged successfully:", response)

      setSuccess(true)
      setErrorMessage("") // Ensure error message is cleared on success
      resetForm()
    } catch (error) {
      console.error("Error submitting:", error)
    } finally {
      setIsLoading(false)
      // close modal
      setIsModal(false)
    }
  }

  // Custom validation logic to check split values
  const validateForm = (values: { members: any[]; cost: number }) => {
    let errors = {}
    let totalSplitValue = 0

    // Custom validation based on the selection
    if (selection !== "Equally") {
      let membersSelected = values.members.filter((member) => member.selected)

      if (membersSelected.length === 0) {
        setErrorMessage("Please select at least one member.")
        return errors
      }

      membersSelected.forEach((member) => {
        if (!member.splitValue) {
          setErrorMessage(
            "Please provide a split value for all selected members."
          )
          return errors
        }
        totalSplitValue +=
          selection === "By Percent" ? member.splitValue : member.splitValue
      })

      // Check if the split values sum up correctly
      if (selection === "By Percent" && totalSplitValue !== 100) {
        setErrorMessage("The total percentage split must add up to 100%.")
        return errors
      }

      if (selection === "Manual" && totalSplitValue !== values.cost) {
        setErrorMessage("The total split values must add up to the total cost.")
        return errors
      }
    }

    // If no error, clear the error message
    setErrorMessage("")
    return errors
  }

  const handleSettleUp = (user: string | null) => {
    if (!user) return
    // Logic to settle up with the selected user
    console.log(`Settling up with ${user}`)

    // Optionally call an API to update the balances and reflect changes

    setSettleModal(false) // Close the modal
  }

  const deleteMember = async (userID: string) => {
    try {
      // Call the delete-member API with the correct key
      const response = await api.post(`/group/delete-member/${groupid}`, {
        userID, // Ensure this matches what the backend expects
      })
      console.log("Member deleted successfully:", response.data)

      // Update the groupInfo state to remove the deleted member
      setGroupInfo((prev: { members: any[] }) => ({
        ...prev,
        members: prev.members.filter((member) => member._id !== userID),
      }))

      setEditModal(false) // Close the modal after deletion
    } catch (error) {
      console.error("Error deleting member:", error)
      alert("Failed to delete member")
    }
  }

  const deleteExpense = async (expense: IExpense | undefined) => {
    if (!expense) return

    try {
      // Use DELETE method for consistency
      const response = await api.delete(
        `/expense/delete-expense/${expense._id}`
      )
      console.log("Expense deleted successfully:", response.data)

      // Update the groupInfo state to remove the deleted expense
      setGroupInfo((prev: { expenses: any[] }) => ({
        ...prev,
        expenses: prev.expenses.filter((item) => item._id !== expense._id),
      }))

      setExpenseModal(false) // Close the modal after deletion
    } catch (error) {
      console.error("Error deleting expense:", error)
      alert("Failed to delete expense")
    }
  }

  return (
    <>
      {isModal && (
        <Modal
          header="Add an Expense"
          subheader="Log a new expense for your group"
          action={() => setIsModal(false)}
          body={
            <>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validate={validateForm}
                onSubmit={addExpense}
              >
                {({ values, errors, touched, isSubmitting }) => (
                  <Form>
                    <div className="Form-group">
                      <label htmlFor="item">Item/Activity</label>
                      <Field
                        className="Form-input-box"
                        type="text"
                        id="item"
                        name="item"
                      />
                      {errors.item && touched.item && (
                        <div className="Form-error">{errors.item}</div>
                      )}
                    </div>

                    <div className="Form-group">
                      <label htmlFor="cost">Amount ($)</label>
                      <Field
                        className="Form-input-box"
                        type="number"
                        id="cost"
                        name="cost"
                      />
                      {errors.cost && touched.cost && (
                        <div className="Form-error">{errors.cost}</div>
                      )}
                    </div>

                    <div className="Form-group">
                      <label htmlFor="date">Date</label>
                      <Field
                        className="Form-input-box"
                        type="date"
                        id="date"
                        name="date"
                      />
                      {errors.date && touched.date && (
                        <div className="Form-error">{errors.date}</div>
                      )}
                    </div>

                    {/* Selection for Split Method */}
                    <div className="Text-fontSize--14 Margin-bottom--4">
                      Split Type
                    </div>
                    <div className="Flex Flex-row Margin-bottom--20 Justify-content--spaceBetween">
                      <div
                        className={
                          selection === "Equally"
                            ? "Button Button--hollow Button-color--green-1000"
                            : "Button Button-color--green-1000"
                        }
                        onClick={() => {
                          setSelection("Equally")
                        }}
                      >
                        Equally
                      </div>
                      <div
                        className={
                          selection === "By Percent"
                            ? "Button Button--hollow Button-color--green-1000"
                            : "Button Button-color--green-1000"
                        }
                        onClick={() => {
                          setSelection("By Percent")
                        }}
                      >
                        By Percent
                      </div>
                      <div
                        className={
                          selection === "Manual"
                            ? "Button Button--hollow Button-color--green-1000"
                            : "Button Button-color--green-1000"
                        }
                        onClick={() => {
                          setSelection("Manual")
                        }}
                      >
                        Manual
                      </div>
                    </div>

                    {/* Show different inputs based on selection */}
                    <div className="Form-group">
                      <label htmlFor="members">Members</label>
                      <FieldArray
                        name="members"
                        render={() => (
                          <div className="Flex Flex-column">
                            {(values.members || []).map(
                              (member: IUser, index: number) => (
                                <div key={index} className="Flex Flex-column">
                                  <div className="Flex-row Margin-y--10">
                                    <Field
                                      type="checkbox"
                                      name={`members[${index}].selected`}
                                    />
                                    {member.name}
                                  </div>
                                  {values.members[index].selected &&
                                    selection !== "Equally" && (
                                      <Field
                                        className="Form-input-box"
                                        type="number"
                                        name={`members[${index}].splitValue`}
                                        placeholder={
                                          selection === "By Percent"
                                            ? "Enter %"
                                            : "Enter amount"
                                        }
                                      />
                                    )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <button
                      type="submit"
                      className="Button Button-color--dark-1000 Width--100"
                      disabled={
                        Object.keys(errors).length > 0 ||
                        !Object.keys(touched).length ||
                        isSubmitting
                      }
                      // Disable button if there are errors or no fields are touched or form is submitting
                    >
                      {isSubmitting ? (
                        <AsyncSubmit loading={isLoading} />
                      ) : (
                        "Log Expense"
                      )}
                    </button>

                    {errorMessage && (
                      <div className="Form-error">{errorMessage}</div>
                    )}

                    {success && (
                      <div className="Form-success">
                        Expense logged successfully!
                      </div>
                    )}
                  </Form>
                )}
              </Formik>
            </>
          }
        />
      )}
      {settleModal && (
        <Modal
          header="Settle Up"
          subheader="Settle up your group expenses"
          action={() => setSettleModal(false)}
          body={
            <>
              <div>Select a user to settle up with:</div>
              <div className="Form-group">
                <select
                  className="Form-input-box"
                  onChange={(e) => {
                    const selectedMemberId = e.target.value
                    const foundUser = expenseArr.find(
                      (entry) => entry.memberId === selectedMemberId
                    ) // Find the selected user's data in expenseArr
                    setSelectedUser(foundUser || null) // Update selectedUser with the corresponding IExpenseEntry
                  }}
                  value={selectedUser?.memberId || ""}
                >
                  <option value="" disabled>
                    Select a member
                  </option>
                  {groupInfo.members
                    .filter((member: IUser) => member._id !== userInfo._id) // Exclude the current user
                    .map((member: IUser) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Display expenses for the selected user */}
              {selectedUser ? (
                <>
                  <h3>Expenses with {selectedUser.memberName}:</h3>
                  {selectedUser.expenses && selectedUser.expenses.length > 0 ? (
                    selectedUser.expenses.map((expense, index) => (
                      <div key={index} className="Flex-row">
                        <span className="Margin-right--4">
                          {new Date(expense.date).toLocaleDateString("en-US")}:
                        </span>
                        <span>{expense.description}</span>
                        <span className="Margin-left--auto">
                          ${expense.amount.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div>No expenses to display for this user.</div>
                  )}
                  <div className="Group-line"></div>
                  <div className="Flex-row">
                    <span>Total Amount Due:</span>
                    <span className="Margin-left--auto">
                      $ {selectedUser.totalAmountOwed.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div>Please select a user to view their expenses.</div>
              )}

              <div className="Flex Flex-row Margin-top--20">
                <button
                  className="Button Button-color--purple-1000 Margin-right--10"
                  // onClick={() => handleSettleUp(selectedUser)}
                  disabled={!selectedUser} // Disable button if no user is selected
                >
                  Settle Up
                </button>
                <button
                  className="Button Button-color--gray-1000"
                  onClick={() => setSettleModal(false)} // Cancel and close modal
                >
                  Cancel
                </button>
              </div>
            </>
          }
        />
      )}
      {isEditModal && (
        <Modal
          header="Manage Group Member"
          subheader="Edit the role of a group member"
          action={() => setEditModal(false)}
          body={
            <>
              <div
                className="Button Button-color--red-1000"
                onClick={() => {
                  deleteMember(selectedMember?._id ?? "")
                }}
              >
                Delete Member
              </div>
            </>
          }
        />
      )}
      {addMemberModal && (
        <Modal
          header="Add Member"
          subheader="Add a new member to the group"
          action={() => setAddMemberModal(false)}
          body={
            <>
              <Formik
                initialValues={{ email: "" }}
                validationSchema={yup.object({
                  email: yup
                    .string()
                    .email("Invalid email address")
                    .required("Email is required"),
                })}
                onSubmit={async (
                  values,
                  { setSubmitting, setFieldError, resetForm }
                ) => {
                  console.log("Adding member:", values.email)
                  try {
                    setIsLoading(true) // Show loading state

                    const response = await api.post(
                      `/group/add-member/${groupid}`, // Ensure `groupid` is valid
                      { email: values.email } // Correctly format request body
                    )

                    console.log("Member added successfully:", response.data)
                    // Update members state
                    // setMemberMap((prevMembers: any) => [
                    //   ...prevMembers,
                    //   response.data.newMember,
                    // ])

                    resetForm() // Reset form after success
                  } catch (error) {
                    console.error(
                      "Error adding member:",
                      error instanceof Error
                        ? error.message
                        : "An unknown error occurred"
                    )

                    const errorMessage =
                      (error as any)?.response?.data?.message ||
                      "Failed to add member"

                    setFieldError("email", errorMessage) // Show error on the form field
                  } finally {
                    setIsLoading(false) // Reset loading state
                    setSubmitting(false) // Form is no longer submitting
                    setAddMemberModal(false) // Close the modal
                  }
                }}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <div className="Form-group">
                      <label htmlFor="email">Email</label>
                      <Field
                        className="Form-input-box"
                        type="email"
                        id="email"
                        name="email"
                      />
                      {errors.email && touched.email && (
                        <div className="Form-error">{errors.email}</div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="Button Button-color--dark-1000 Width--100"
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting || isLoading ? (
                        <AsyncSubmit loading={isLoading} />
                      ) : (
                        "Add Member"
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </>
          }
        />
      )}

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

              <div
                className="Button Button-color--red-1000 Margin-top--20"
                onClick={() => deleteExpense(currExpense)}
              >
                Delete Expense
              </div>
            </div>
          }
        />
      )}

      <Navbar />
      <div className="Group">
        <div className="Group-top">
          <div className="Group-top-title">{groupInfo?.groupDescription}</div>
          <div className="Group-top-subtitle">
            Manage your group and add expenses.
          </div>
        </div>
        <div className="row d-flex">
          <div className="col-lg-3">
            <div className="Group-header">Members</div>
            {groupInfo &&
              groupInfo.members.map((member: any, index: number) => (
                <div
                  key={member._id}
                  className="Card Flex Flex-row Margin-bottom--10 Flex-row--verticallyCentered"
                >
                  <div className="Purchase-item">
                    <div
                      className={`Group-letter Margin-right--10 Background-color--${
                        member.role === "Admin" ? "purple" : "maroon"
                      }-1000`}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div key={index}>
                    {member.name}
                    <div className="Text-color--dark-700 Text-fontSize--14">
                      {member.role}
                    </div>
                  </div>

                  {/* Conditionally render edit icon if member is not the current user */}
                  {member._id !== userInfo?._id && ( // Replace currentUserId with your current user's ID
                    <div
                      className="Group-icon"
                      onClick={() => {
                        setEditModal(true)
                        setSelectedMember(member)
                        console.log("Selected Member:", member)
                      }}
                    >
                      <Icon glyph="ellipsis-v" />
                    </div>
                  )}
                </div>
              ))}

            <div
              className="Button Button-color--dark-1000"
              onClick={() => {
                setAddMemberModal(true)
              }}
            >
              Add Member
            </div>
          </div>
          <div className="col-lg-6">
            <div className="Group-header">Group Purchase History</div>
            {groupInfo &&
              groupInfo.expenses.map((transaction: any, index: number) => (
                <div
                  key={index}
                  className="Card Purchase"
                  onClick={() => {
                    setExpenseModal(true)
                    console.log("Selected Expense:", transaction)
                    setCurrExpense(transaction)
                  }}
                >
                  <div className="Flex Flex-row" style={{ flexGrow: 1 }}>
                    <div className="Purchase-item " style={{ width: 75 }}>
                      {new Date(transaction.date).toLocaleDateString("en-US")}
                    </div>
                    <div className="Purchase-item Padding-x--20">
                      <div className="Purchase-item-icon">
                        {transaction.createdBy.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="Purchase-item">
                      {transaction.allocatedToUsers
                        .map((user: any) => user.name.split(" ")[0]) // Extract first name
                        .slice(0, 3) // Limit to first 3 names
                        .join(", ") // Join with commas
                        .concat(
                          transaction.allocatedToUsers.length > 3 ? ", ..." : ""
                        )}
                      <div className="Purchase-item-subtitle">
                        {transaction && transaction.description}
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
            <div
              onClick={() => {
                setIsModal(true)
              }}
              className="Button Button-color--dark-1000 Margin-top--10"
            >
              Create New Expense
            </div>
          </div>
          <div className="col-lg-3">
            {" "}
            <div className="Group-header">Amounts</div>
            <div className="Block">
              <div className="Block-header">Total Due</div>
              <div className="Block-subtitle">${totalDue.toFixed(2)}</div>

              {expenseArr && expenseArr.length > 0 ? (
                expenseArr.map((entry, index) => (
                  <div key={index} className="Flex Flex-row Margin-bottom--20">
                    <div>{entry.memberName}:</div>
                    <div className="Text-color--dark-700 Margin-left--auto">
                      ${entry.totalAmountOwed.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div>No expenses to display.</div>
              )}

              <div
                className="Button Button-color--purple-1000"
                onClick={() => setSettleModal(true)}
              >
                Settle Up
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Group
