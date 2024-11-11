import { type ReactElement, useState } from "react"
import { Formik, Form, Field } from "formik"
import * as yup from "yup"
import { useAuth0 } from "@auth0/auth0-react"
import Navbar from "../components/Navbar"
import AsyncSubmit from "../components/AsyncSubmit"
import { api } from "../api"
import { useNavigate } from "react-router-dom"

interface LoginFormValues {
  email: string
  password: string
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
}

const Login = (): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { loginWithRedirect } = useAuth0()
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const validationSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  })
  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    try {
      // Make a POST request to your backend login endpoint
      const response = await api.get("/user/login", {
        email: values.email,
        password: values.password,
      })

      const { token, userId } = response.data

      // Store the token and user ID in localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("userId", userId)

      // Redirect the user to the dashboard or another authenticated page
      navigate("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      setError("Invalid email or password") // Set error state to show a message
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
            <div className="Block-header">Login to FlatFair</div>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid, dirty }) => (
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
                  <button
                    className="Button Button-color--dark-1000 Width--100 Margin-top--10"
                    type="submit"
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? <AsyncSubmit loading={isLoading} /> : "Log In"}
                  </button>
                  <div className="Margin-top--20 Text-center">
                    Don't have an account?{" "}
                    <a href="/create-account" className="Link">
                      Create One
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

export default Login
