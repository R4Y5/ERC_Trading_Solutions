import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import RegistrationProfilePicture from "./RegistrationProfilePicture";

// Validation stays in this file—no separate schema file.
const today = new Date();
const localToday = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

const registrationSchema = Yup.object({
  title: Yup.string()
    .oneOf(["Mr.", "Ms.", "Mrs.", "Dr."], "Select a valid title")
    .required("Title is required"),

  fname: Yup.string()
    .trim()
    .max(100, "First name is too long")
    .required("First name is required"),

  lname: Yup.string()
    .trim()
    .max(100, "Last name is too long")
    .required("Last name is required"),

  username: Yup.string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .matches(
      /^[A-Za-z0-9_.-]+$/,
      "Use only letters, numbers, dots, underscores, and hyphens",
    )
    .required("Username is required"),

  phone: Yup.string()
    .trim()
    .max(30, "Phone number is too long")
    .required("Phone number is required"),

  gender: Yup.string()
    .oneOf(
      ["Male", "Female", "Other", "Prefer not to say"],
      "Select a valid gender option",
    )
    .required("Gender is required"),

  date_of_birth: Yup.string()
    .required("Date of birth is required")
    .test("valid-date", "Please enter a valid date of birth.", (value) => {
      if (!value) return true;

      // Expect YYYY-MM-DD from the HTML date input
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

      if (!match) return false;

      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);

      const date = new Date(Date.UTC(year, month - 1, day));

      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    })
    .test("not-future", "Date of birth cannot be in the future.", (value) => {
      if (!value) return true;

      // YYYY-MM-DD strings can be compared chronologically
      return value <= localToday;
    }),
  addressline: Yup.string()
    .trim()
    .max(200, "Address is too long")
    .required("Address is required"),

  town: Yup.string()
    .trim()
    .max(200, "Town or city is too long")
    .required("Town or city is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

const initialValues = {
  title: "",
  fname: "",
  lname: "",
  username: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  addressline: "",
  town: "",
  password: "",
  confirmPassword: "",
};

function CompleteRegistrationForm({
  onSubmit,
  profilePicture,
  onProfilePictureChange,
  loading,
  serverError,
}) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={registrationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form noValidate>
          <div>
            <label htmlFor="title">Title</label>
            <Field as="select" id="title" name="title">
              <option value="">Select a title</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Dr.">Dr.</option>
            </Field>
            <ErrorMessage name="title" component="p" />
          </div>

          <div>
            <label htmlFor="fname">First Name</label>
            <Field id="fname" name="fname" autoComplete="given-name" />
            <ErrorMessage name="fname" component="p" />
          </div>

          <div>
            <label htmlFor="lname">Last Name</label>
            <Field id="lname" name="lname" autoComplete="family-name" />
            <ErrorMessage name="lname" component="p" />
          </div>

          <div>
            <label htmlFor="username">Username</label>
            <Field id="username" name="username" autoComplete="username" />
            <ErrorMessage name="username" component="p" />
          </div>

          <div>
            <label htmlFor="phone">Phone Number</label>
            <Field id="phone" name="phone" type="tel" autoComplete="tel" />
            <ErrorMessage name="phone" component="p" />
          </div>

          <div>
            <label htmlFor="gender">Gender</label>
            <Field as="select" id="gender" name="gender">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </Field>
            <ErrorMessage name="gender" component="p" />
          </div>

          <div>
            <label htmlFor="date_of_birth">Date of Birth</label>
            <Field
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              max={localToday}
            />
            <ErrorMessage name="date_of_birth" component="p" />
          </div>

          <div>
            <label htmlFor="addressline">Address</label>
            <Field
              id="addressline"
              name="addressline"
              autoComplete="street-address"
            />
            <ErrorMessage name="addressline" component="p" />
          </div>

          <div>
            <label htmlFor="town">Town or City</label>
            <Field id="town" name="town" autoComplete="address-level2" />
            <ErrorMessage name="town" component="p" />
          </div>

          <RegistrationProfilePicture
            profilePicture={profilePicture}
            onChange={onProfilePictureChange}
          />

          <div>
            <label htmlFor="password">Password</label>
            <Field
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
            />
            <ErrorMessage name="password" component="p" />
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Field
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
            />
            <ErrorMessage name="confirmPassword" component="p" />
          </div>

          {serverError && <p role="alert">{serverError}</p>}

          <button type="submit" disabled={loading || isSubmitting}>
            {loading || isSubmitting
              ? "Completing Registration..."
              : "Complete Registration"}
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default CompleteRegistrationForm;
