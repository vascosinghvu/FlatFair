import { type ReactElement, useState } from "react"
import { Formik, Form, Field } from "formik"
import * as yup from "yup"
import Navbar from "../components/Navbar"
import AsyncSubmit from "../components/AsyncSubmit"
import { api } from "../api"
import { useNavigate } from "react-router-dom"

interface CreateAccountFormValues {
  email: string
  name: string
  password: string
  confirmPassword: string
}

const initialValues: CreateAccountFormValues = {
  email: "",
  name: "",
  password: "",
  confirmPassword: "",
}

const CreateAccount = (): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  const validationSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    name: yup.string().required("Name is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  })

  const handleSubmit = async (values: CreateAccountFormValues) => {
    setIsLoading(true)
    try {
      console.log("Account creation submitted:", values)

      // Send POST request to your backend
      const response = await api.post("/user/create-user", {
        email: values.email,
        name: values.name,
        password: values.password, // Ensure this is hashed on the backend
      })

      console.log("Account created successfully:", response)

      // Save token if it's returned
      if (response.token) {
        localStorage.setItem("token", response.token)
      } else {
        // If no token in response, try login
        const loginResponse = await api.post("/user/login", {
          email: values.email,
          password: values.password
        })
        console.log("Login response:", loginResponse) // Debug log
        
        if (loginResponse.token) {
          localStorage.setItem("token", loginResponse.token)
        }
      }

      console.log("Current token:", localStorage.getItem("token")) // Debug log

      // Navigate to dashboard
      navigate("/dashboard")
    } catch (error) {
      console.error(
        "Account creation failed:",
        (error as any).response?.data || (error as any).message
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__slideInDown">
          <div className="Block">
            <div className="Block-header">Create a New Account</div>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid }) => (
                <Form>
                  <div className="Form-group">
                    <label htmlFor="email">Email</label>
                    <Field
                      className="Form-input-box"
                      type="email"
                      id="email"
                      name="email"
                      placeholder="johndoe@gmail.com"
                    />
                    {errors.email && touched.email && (
                      <div className="Form-error">{errors.email}</div>
                    )}
                  </div>
                  <div className="Form-group">
                    <label htmlFor="name">Name</label>
                    <Field
                      className="Form-input-box"
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                    />
                    {errors.name && touched.name && (
                      <div className="Form-error">{errors.name}</div>
                    )}
                  </div>
                  <div className="Form-group">
                    <label htmlFor="password">Password</label>
                    <Field
                      className="Form-input-box"
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                    />
                    {errors.password && touched.password && (
                      <div className="Form-error">{errors.password}</div>
                    )}
                  </div>
                  <div className="Form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <Field
                      className="Form-input-box"
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <div className="Form-error">{errors.confirmPassword}</div>
                    )}
                  </div>
                  <button
                    className="Button Button-color--dark-1000 Width--100 Margin-top--10"
                    type="submit"
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? (
                      <AsyncSubmit loading={isLoading} />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                  <div className="Margin-top--20 Text-center">
                    Already have an account?{" "}
                    <a href="/login" className="Link">
                      Log in
                    </a>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateAccount
