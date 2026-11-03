import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AuthLayout from "../components/layout/AuthLayout";
import * as Yup from "yup";
import api from "../services/api";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";

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
    <AuthLayout
      title="Create an account"
      subtitle="Enter your email address to get started."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <Formik
        initialValues={{
          email: "",
        }}
        validationSchema={registerSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form noValidate>
            <Stack spacing={2.5}>
              <Field
                as={TextField}
                id="email"
                name="email"
                type="email"
                label="Email Address"
                autoComplete="email"
                placeholder="you@example.com"
                size="medium"
                disabled={loading}
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
              />

              {message && (
                <Alert severity="error" role="alert">
                  {message}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? "Please wait..." : "Continue"}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>

      <GoogleLoginButton label="Sign up with Google" />
    </AuthLayout>
  );
}

export default Register;