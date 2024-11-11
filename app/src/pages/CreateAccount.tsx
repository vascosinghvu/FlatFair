import { type ReactElement, useState } from "react"
import { Formik, Form, Field } from "formik"
import * as yup from "yup"
import { useAuth0 } from "@auth0/auth0-react"
import Navbar from "../components/Navbar"
import AsyncSubmit from "../components/AsyncSubmit"

interface CreateAccountFormValues {
  email: string
  name: string
  password: string
}

const initialValues: CreateAccountFormValues = {
  email: "",
  name: "",
  password: "",
}

const CreateAccount = (): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { loginWithRedirect } = useAuth0()

  const validationSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    name: yup.string().required("Name is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  })

  const handleSubmit = async (values: CreateAccountFormValues) => {
    setIsLoading(true)
    try {
      // Typically, you'd call your backend to create the user account.
      // For Auth0, simulate account creation with redirect:
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: "signup", // Trigger Auth0's signup page
        },
      })

      console.log("Account creation submitted:", values)
    } catch (error) {
      console.error("Account creation failed:", error)
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
