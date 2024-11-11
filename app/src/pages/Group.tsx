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
import { Button } from "react-bootstrap"

const Group = () => {
  const { groupid } = useParams()

  // Get group data from the backend
  // Get user info from backend
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
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get(`/user/get-user`)
        console.log("Response:", response)

        const data = await response.data // Parse the JSON response
        console.log("User Info:", data)
        // Store the response in a variable or state
        setUserInfo(data.currentUser) // Assuming you're using state to store the info
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    const fetchGroupInfo = async () => {
      try {
        const response = await api.get(`/group/get-group/${groupid}`)

        const data = response.data // Parse the JSON response
        console.log("Group Info:", data)
        // Store the response in a variable or state
        setGroupInfo(data.group) // Assuming you're using state to store the info
        setMemberInitialValues(
          data.group.members.map((member: any) => ({
            name: member.name,
            selected: false,
            splitValue: undefined,
            id: member._id,
          }))
        )

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
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    fetchGroupInfo() // Call the fetch function inside useEffect
    fetchUserInfo() // Call the fetch function inside useEffect
  }, []) // Empty dependency array to run once on component mount

  console.log("CURRENT GROUP: ", groupInfo)
  console.log("user info: ", userInfo)

  // console.log("Members:", groupInfo?.members)
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

  const handleSubmit = async (values: any, { resetForm }: any) => {
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
    }
  }

  interface Member {
    name: string
    role: string
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

  function formatTime(date: Date): string {
    date = new Date(date)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12 // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    return `${formattedHours}:${formattedMinutes} ${period}`
  }

  const handleSettleUp = (user: string | null) => {
    if (!user) return
    // Logic to settle up with the selected user
    console.log(`Settling up with ${user}`)

    // Optionally call an API to update the balances and reflect changes

    setSettleModal(false) // Close the modal
  }

  return (
    <>
      {isModal && (
        <Modal
          header="Add an Expense"
          subheader="Log a new expense for your group"
          action={() => setIsModal(false)}
          body={
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              validate={validateForm}
              onSubmit={handleSubmit}
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
                          {values.members
                            .filter()
                            .map((member: IUser, index: number) => (
                              <div key={index} className="Flex Flex-column">
                                <div className="Flex-row Margin-y--10">
                                  <Field
                                    type="checkbox"
                                    name={`members[${index}].selected`}
                                    checked={values.members[index].selected}
                                  />
                                  {member.name}
                                </div>

                                {/* Conditionally show inputs based on selection */}
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
                            ))}
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
                  onChange={(e) => setSelectedUser(e.target.value)} // Handle selection
                  value={selectedUser || ""}
                >
                  <option value="" disabled>
                    Select a member
                  </option>
                  {groupInfo.members
                    .filter((member: IUser) => member._id !== userInfo._id) // Filter out the current user
                    .map((member: IUser) => (
                      <option key={member._id} value={member.name}>
                        {member.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="Flex Flex-row Margin-top--20">
                <button
                  className="Button Button-color--purple-1000 Margin-right--10"
                  onClick={() => handleSettleUp(selectedUser)}
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
        />
      )}

      <Navbar />
      <div className="Group">
        <div className="Group-top">
          <div className="Group-top-title">Class Group 7</div>
          <div className="Group-top-subtitle">Group Description</div>
        </div>
        <div className="row d-flex">
          <div className="col-lg-3">
            <div className="Group-header">Members</div>
            {groupInfo &&
              groupInfo.members.map((member: any, index: number) => (
                <div
                  key={member._id}
                  className="Card Flex Flex-row Margin-bottom--20 Flex-row--verticallyCentered"
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
                  <div
                    className="Group-icon"
                    onClick={() => setEditModal(true)}
                  >
                    <Icon glyph="ellipsis-v" />
                  </div>
                </div>
              ))}
          </div>
          <div className="col-lg-6">
            <div className="Group-header">Group Purchase History</div>
            {groupInfo &&
              groupInfo.expenses.map((transaction: any, index: number) => (
                <div key={index} className="Card Purchase">
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
                      {transaction.createdBy.name}
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
              <div className="Block-subtitle">$120.00</div>

              <div className="Flex Flex-row Margin-bottom--20">
                <div className="">Brandon: </div>
                <div className="Text-color--dark-700 Margin-left--auto">
                  $40.00
                </div>
              </div>

              <div className="Flex Flex-row Margin-bottom--20">
                <div className="">Vasco: </div>
                <div className="Text-color--dark-700 Margin-left--auto">
                  $40.00
                </div>
              </div>

              <div className="Flex Flex-row Margin-bottom--20">
                <div className="">Ryan: </div>
                <div className="Text-color--dark-700 Margin-left--auto">
                  $40.00
                </div>
              </div>

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
