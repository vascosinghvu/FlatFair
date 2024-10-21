import React, { useState } from "react"
import { Formik, Form, Field, FieldArray } from "formik"
import * as yup from "yup"
import Navbar from "../components/Navbar"
import AsyncSubmit from "../components/AsyncSubmit"
import { useNavigate } from "react-router-dom"
import Modal from "../components/Modal"
import LoginButton from "../components/LoginButton"
import Icon from "../components/Icon"

const Home = () => {
  const [isModal, setIsModal] = useState(false)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selection, setSelection] = useState("Equally") // Default to "Equally"
  const [errorMessage, setErrorMessage] = useState("")

  const initialValues = {
    item: "",
    cost: 0,
    date: "",
    members: [
      { name: "John", selected: false, splitValue: undefined },
      { name: "Jane", selected: false, splitValue: undefined },
      { name: "Doe", selected: false, splitValue: undefined },
    ],
  }

  const validationSchema = yup.object().shape({
    item: yup.string().required("Please enter an item or activity"),
    cost: yup
      .number()
      .positive("Cost must be a positive number")
      .required("Please enter the cost"),
    date: yup.string().required("Please select a date"),
  })

  function formatTime(date: Date): string {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12 // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    return `${formattedHours}:${formattedMinutes} ${period}`
  }

  interface UserTransaction {
    timestamp: Date
    name: string
    group: string
    amount: number
    status: string
  }

  const transactions: UserTransaction[] = [
    {
      timestamp: new Date("2024-10-20T22:54:00"), // 10:54 PM
      name: "Alex Johnson",
      group: "Class Group 3",
      amount: 120.45,
      status: "Pending",
    },
    {
      timestamp: new Date("2024-10-20T21:30:00"), // 9:30 PM
      name: "Maria Lopez",
      group: "Class Group 2",
      amount: 89.67,
      status: "Completed",
    },
    {
      timestamp: new Date("2024-10-20T20:15:00"), // 8:15 PM
      name: "John Smith",
      group: "Class Group 5",
      amount: 55.23,
      status: "Pending",
    },
    {
      timestamp: new Date("2024-10-20T19:00:00"), // 7:00 PM
      name: "Emily Chen",
      group: "Class Group 1",
      amount: 32.89,
      status: "Completed",
    },
    {
      timestamp: new Date("2024-10-20T18:45:00"), // 6:45 PM
      name: "Michael Scott",
      group: "Class Group 4",
      amount: 76.5,
      status: "Pending",
    },
    {
      timestamp: new Date("2024-10-20T17:20:00"), // 5:20 PM
      name: "Sarah Lee",
      group: "Class Group 6",
      amount: 47.18,
      status: "Completed",
    },
    {
      timestamp: new Date("2024-10-20T16:10:00"), // 4:10 PM
      name: "Robert King",
      group: "Class Group 7",
      amount: 98.33,
      status: "Pending",
    },
  ]

  interface Group {
    name: string
    members: string[]
    canManage: boolean
  }

  const groups: Group[] = [
    {
      name: "Class Group 7",
      members: ["Charlotte Conze", "Vasco Singh"],
      canManage: true,
    },
    {
      name: "Hiking Group",
      members: ["Charlotte Conze", "Ryan Sullivan"],
      canManage: true,
    },
  ]

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setIsLoading(true)
    setErrorMessage("") // Clear error message at the start of submission

    try {
      // Initialize a variable to hold the breakdown for each member
      let memberBreakdown: { name: string; amountDue: any }[] = []

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
            name: member.name,
            amountDue: amountPerMember,
          })
        })
      } else if (selection === "By Percent") {
        // Split the total cost based on the percentage provided for each selected member
        selectedMembers.forEach((member: { splitValue: number; name: any }) => {
          const percentage = member.splitValue || 0 // default to 0 if no percentage provided
          const amountDue = (percentage / 100) * totalCost
          memberBreakdown.push({
            name: member.name,
            amountDue: amountDue,
          })
        })
      } else if (selection === "Manual") {
        // Use the manual amounts provided for each selected member
        selectedMembers.forEach((member: { splitValue: number; name: any }) => {
          const amountDue = member.splitValue || 0 // default to 0 if no amount provided
          memberBreakdown.push({
            name: member.name,
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
      }

      console.log("Submitting data:", finalData)
      setSuccess(true)
      setErrorMessage("") // Ensure error message is cleared on success
      resetForm()
    } catch (error) {
      console.error("Error submitting:", error)
    } finally {
      setIsLoading(false)
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
                          {values.members.map((member, index) => (
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
      <Navbar />
      <div className="Home">
        {/* <div className="Home-title">Welcome back, *User*</div> */}
        <div className="row d-flex Justify-content--spaceBetween">
          <div className="col-lg-3">
            <div className="Block">
              <div className="Block-header">Account Details</div>
              <div className="Block-subtitle"> Manage your account.</div>
            </div>
          </div>
          <div className="col-lg-6 Flex Flex-column Padding-x--20">
            <div className="Home-subtitle">Spending Log</div>
            <div className="Home-subtitle">Purchase Log</div>
            {transactions.map((transaction, index) => (
              <div key={index} className="Card Purchase">
                <div className="Flex Flex-row" style={{ flexGrow: 1 }}>
                  <div className="Purchase-item " style={{ width: 75 }}>
                    {formatTime(transaction.timestamp)}
                  </div>
                  <div className="Purchase-item Padding--20">
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
              {groups.map((group, index) => (
                <div key={index} className="Group">
                  <div className="Group-title">{group.name}</div>
                  <div className="Group-body">{group.members.join(", ")}</div>
                  <div
                    className="Button Button--hollow Button-color--purple-1000"
                    onClick={() => {
                      navigate("/group")
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
      {/*
        <div
          onClick={() => {
            setIsModal(true)
          }}
          className="Button Button-color--dark-1000 Margin-top--10"
        >
          Open Modal
        </div>
        <LoginButton /> */}
    </>
  )
}

export default Home
