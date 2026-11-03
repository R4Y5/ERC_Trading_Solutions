
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../services/api";

const registerSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address.")
    .required("Email address is required.")
    .max(254, "Email address is too long."),
});

function Register() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setMessage("");
    setLoading(true);

    try {
      const normalizedEmail = values.email.trim().toLowerCase();

      const response = await api.post("/users/register", {
        email: normalizedEmail,
      });

      const registrationToken = response.data.registrationToken;

      if (!registrationToken) {
        throw new Error(
          "Registration token was not returned by the server."
        );
      }

      // Save the registration details for the next step.
      sessionStorage.setItem(
        "registrationToken",
        registrationToken
      );

      sessionStorage.setItem(
        "registrationEmail",
        normalizedEmail
      );

      navigate("/complete-registration");
    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to start registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create an Account</h1>

      <p>Enter your email address to get started.</p>

      <Formik
        initialValues={{
          email: "",
        }}
        validationSchema={registerSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form noValidate>
            <div>
              <label htmlFor="email">
                Email Address
              </label>

              <Field
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(
                  touched.email && errors.email
                )}
                aria-describedby={
                  touched.email && errors.email
                    ? "email-error"
                    : undefined
                }
                disabled={loading}
              />

              <ErrorMessage name="email">
                {(errorMessage) => (
                  <p
                    id="email-error"
                    role="alert"
                    style={{
                      color: "#b91c1c",
                      marginTop: "5px",
                    }}
                  >
                    {errorMessage}
                  </p>
                )}
              </ErrorMessage>
            </div>

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Continue"}
            </button>
          </Form>
        )}
      </Formik>

      {message && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {message}
        </p>
      )}

      <p>
        Already have an account?{" "}
        <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default Register;
