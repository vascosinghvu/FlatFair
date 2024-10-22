import React, { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import * as yup from "yup"
import { Formik, Form, Field, FieldArray } from "formik"
import Modal from "../components/Modal"
import AsyncSubmit from "../components/AsyncSubmit"
import { api } from "../api"
import { useParams } from "react-router-dom"
import { IGroup } from "../../../api/src/model/Group"
import { IExpense } from "../../../api/src/model/Expense"
import { set } from "mongoose"
import { IUser } from "../../../api/src/model/User"
import Icon from "../components/Icon"
import { Button } from "react-bootstrap"

const Group = () => {
  const { groupid } = useParams()
  
  // Get group data from the backend
  // Get user info from backend
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [memberMap, setMemberMap] = useState<any>({})
  const [memberInitialValues, setMemberInitialValues] = useState<any>([])
  useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const response = await fetch(`http://localhost:8000/group/get-group/${groupid}`, {
                method: 'GET', // GET request to retrieve data
                credentials: 'include', // Include credentials (cookies, etc.)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json(); // Parse the JSON response
            console.log("Group Info:", data);
            // Store the response in a variable or state
            setGroupInfo(data.group); // Assuming you're using state to store the info
            setMemberInitialValues(data.group.members.map((member: any) => ({
              name: member.name,
              selected: false,
              splitValue: undefined,
              id: member._id,
            })))

            setMemberMap(() => {
              const groupMembers: IUser[] = data.group.members
              return groupMembers.reduce<{ [name: string]: string }>((map, user) => {
                const username = user.name as string;
                const userID = user._id as string;
                map[username] = userID;
                return map;
              }, {});
          });
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    fetchUserInfo(); // Call the fetch function inside useEffect
  }, []); // Empty dependency array to run once on component mount

  console.log("CURRENT GROUP: ", groupInfo);
  
  const [isModal, setIsModal] = useState(false)
  const [isEditModal, setEditModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selection, setSelection] = useState("Equally") // Default to "Equally"
  const [errorMessage, setErrorMessage] = useState("")
  const [settleModal, setSettleModal] = useState(false)

  // console.log("Members:", groupInfo?.members)
  const initialValues = {
    item: "",
    cost: 0,
    date: "",
    members: memberInitialValues
      
      // { name: "John", selected: false, splitValue: undefined },
      // { name: "Jane", selected: false, splitValue: undefined },
      // { name: "Doe", selected: false, splitValue: undefined },
    ,
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
      const response = await fetch('http://localhost:8000/group/add-expense', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      })
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

  const members: Member[] = [
    { name: "Charlotte Conze", role: "Admin" },
    { name: "Vasco Singh", role: "Member" },
  ]

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
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12 // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    return `${formattedHours}:${formattedMinutes} ${period}`
  }

  interface GroupPurchase {
    timestamp: Date
    name: string
    description: string
    amount: number
    status: string
  }

  const transactions: GroupPurchase[] = [
    {
      timestamp: new Date("2024-10-21T22:54:00"), // 10:54 PM
      name: "Charlotte Conze",
      description: "Chipotle",
      amount: 75.32,
      status: "Pending",
    },
    {
      timestamp: new Date("2024-10-21T09:15:00"), // 9:15 AM
      name: "Vasco Singh",
      description: "Starbucks",
      amount: 15.67,
      status: "Completed",
    },
    {
      timestamp: new Date("2024-10-21T14:30:00"), // 2:30 PM
      name: "Ryan Sullivan",
      description: "Uber",
      amount: 23.45,
      status: "Pending",
    },
    {
      timestamp: new Date("2024-10-21T17:45:00"), // 5:45 PM
      name: "Brandon Chandler",
      description: "Grocery Store",
      amount: 48.12,
      status: "Completed",
    },
  ]

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
                          {values.members.map((member: IUser, index: number) => (
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
          body={<div className="Form-group"></div>}
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
            {groupInfo.members.map((member: any, index: number) => (
              <div className="Card Flex Flex-row Margin-bottom--20 Flex-row--verticallyCentered">
                <div className="Purchase-item">
                  <div
                    className={`Group-letter Margin-right--10 Background-color--${
                      member.role === "Admin" ? "purple" : "maroon"
                    }-1000`}
                  >
                    {groupInfo.members[0].name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div key={index}>
                  {member.name}
                  <div className="Text-color--dark-700 Text-fontSize--14">
                    {member.role}
                  </div>
                </div>
                <div className="Group-icon" onClick={() => setEditModal(true)}>
                  <Icon glyph="ellipsis-v" />
                </div>
              </div>
            ))}
          </div>
          <div className="col-lg-6">
            <div className="Group-header">Group Purchase History</div>
            {groupInfo.expenses.map((transaction: any, index: number) => (
              <div key={index} className="Card Purchase">
                <div className="Flex Flex-row" style={{ flexGrow: 1 }}>
                  <div className="Purchase-item " style={{ width: 75 }}>
                    {formatTime(transaction.date)}
                  </div>
                  <div className="Purchase-item Padding-x--20">
                    <div className="Purchase-item-icon">
                      {transaction.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="Purchase-item">
                    {transaction.name}
                    <div className="Purchase-item-subtitle">
                      {transaction.description}
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
