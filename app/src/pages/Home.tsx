import React, { ReactElement, useState } from "react"
import { Formik, Form, Field } from "formik"
import * as yup from "yup"
import Navbar from "../components/Navbar"
import AsyncSubmit from "../components/AsyncSubmit"
// import { api } from "../api"
import { useNavigate } from "react-router-dom"
import Modal from "../components/Modal"

const Home = (): ReactElement => {
  // const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isModal, setIsModal] = React.useState<boolean>(false)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  // const [members, setMembers] = useState<string[]>([])

  // const ButtonClick = async () => {
  //   setIsLoading(true)
  //   console.log("Button Clicked")

  //   // Example POST request
  //   try {
  //     const response = await api.post("/test", { key: "value" })
  //     console.log("Response: ", response)
  //   } catch (error) {
  //     console.error("Error: ", error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  interface ExpenseFormValues {
    item: string
    cost: number
    date: string
    members: string[]
    status: "Complete" | "Pending" | "Cancelled"
  }

  const initialValues: ExpenseFormValues = {
    item: "",
    cost: 0,
    date: "",
    members: [],
    status: "Pending",
  }

  const validationSchema = yup.object().shape({
    item: yup.string().required("Please enter an item or activity"),
    buyer: yup.string().required("Please enter the buyer's name"),
    cost: yup
      .number()
      .positive("Cost must be a positive number")
      .required("Please enter the cost"),
    date: yup.string().required("Please select a date"),
    time: yup.string().required("Please enter the time"),
    location: yup.string(),
    members: yup.array().min(1, "Please select at least one member"),
  })

  const handleSubmit = async (
    values: ExpenseFormValues,
    { resetForm }: any
  ) => {
    setIsLoading(true)

    try {
      // Example API request simulation
      console.log("Submitting expense data:", values)
      setSuccess(true)
      resetForm()
      // setMembers([])
    } catch (error) {
      console.error("Error submitting expense:", error)
    } finally {
      setIsLoading(false)
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
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                }) => (
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

                    <div className="Form-group">
                      <label htmlFor="members">Members</label>
                      <Field
                        as="select"
                        name="members"
                        multiple
                        className="Form-input-box"
                      >
                        {/* Add logic to populate the member options */}
                        <option value="John">John</option>
                        <option value="Jane">Jane</option>
                        <option value="Doe">Doe</option>
                      </Field>
                      {errors.members && touched.members && (
                        <div className="Form-error">{errors.members}</div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="Button Button-color--dark-1000 Width--100"
                    >
                      {isLoading ? (
                        <AsyncSubmit loading={isLoading} />
                      ) : (
                        "Create Group"
                      )}
                    </button>

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
      <Navbar />
      <h1>Home</h1>
      <div
        onClick={() => {
          navigate("/create-group")
        }}
        className="Button Button-color--dark-1000"
      >
        Create Group
      </div>
      {/* make a button that triggers a modal */}
      <div
        onClick={() => {
          setIsModal(true)
        }}
        className="Button Button-color--dark-1000 Margin-top--10"
      >
        Open Modal
      </div>
    </>
  )
}

export default Home
