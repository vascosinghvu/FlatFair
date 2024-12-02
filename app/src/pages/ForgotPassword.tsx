import { type ReactElement, useState } from "react"
import { Formik, Form, Field } from "formik"
import * as yup from "yup"
import Navbar from "../components/Navbar"
import AsyncSubmit from "../components/AsyncSubmit"
import { api } from "../api"
import { useNavigate } from "react-router-dom"

interface ForgotPasswordFormValues {
  email: string
  password: string
  confirmPassword: string
}

const initialValues: ForgotPasswordFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
}

const ForgotPassword = (): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  const validationSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  })

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true)
    try {
      console.log("Password reset submitted:", values)

      // Make a POST request to the reset-password endpoint
      const response = await api.post("/user/reset-password", {
        email: values.email,
        password: values.password, // Ensure this is hashed on the backend
      })

      console.log("Password reset successful:", response)

      // Optionally navigate to the login page
      navigate("/login")
    } catch (error) {
      console.error(
        "Password reset failed:",
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
            <div className="Block-header">Reset Your Password</div>
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
                    <label htmlFor="password">New Password</label>
                    <Field
                      className="Form-input-box"
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your new password"
                    />
                    {errors.password && touched.password && (
                      <div className="Form-error">{errors.password}</div>
                    )}
                  </div>
                  <div className="Form-group">
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <Field
                      className="Form-input-box"
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your new password"
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
                      "Reset Password"
                    )}
                  </button>
                  <div className="Margin-top--20 Text-center">
                    Remembered your password?{" "}
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

export default ForgotPassword
