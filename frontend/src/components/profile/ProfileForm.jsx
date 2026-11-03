
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const profileSchema = Yup.object({
  title: Yup.string()
    .oneOf(["", "Mr.", "Ms.", "Mrs.", "Dr."], "Please select a valid title."),

  fname: Yup.string()
    .trim()
    .required("First name is required.")
    .max(100, "First name cannot exceed 100 characters."),

  lname: Yup.string()
    .trim()
    .required("Last name is required.")
    .max(100, "Last name cannot exceed 100 characters."),

  phone: Yup.string()
    .trim()
    .max(30, "Contact number cannot exceed 30 characters."),

  gender: Yup.string()
    .oneOf(
      ["", "Male", "Female", "Other", "Prefer not to say"],
      "Please select a valid gender."
    ),

date_of_birth: Yup.string().test(
  "valid-date",
  "Please enter a valid date of birth that is not in the future.",
  (value) => {
    if (!value) return true;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const selectedDate = new Date(Date.UTC(year, month - 1, day));

    // Reject invalid dates such as February 30.
    if (
      selectedDate.getUTCFullYear() !== year ||
      selectedDate.getUTCMonth() !== month - 1 ||
      selectedDate.getUTCDate() !== day
    ) {
      return false;
    }

    const now = new Date();
    const today =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    return value <= today;
  }
),

  addressline: Yup.string()
    .trim()
    .max(200, "Address cannot exceed 200 characters."),

  town: Yup.string()
    .trim()
    .max(200, "City or town cannot exceed 200 characters."),
});

export default function ProfileForm({
  formData,
  editing,
  saving,
  onSubmit,
  onEdit,
  onCancel,
}) {
  return (
    <Formik
      initialValues={formData}
      enableReinitialize
      validationSchema={profileSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form noValidate>
          <h3 style={styles.heading}>Personal Information</h3>

          <div style={styles.grid}>
            <div style={styles.field}>
              <label htmlFor="title">Title</label>
              <Field
                as="select"
                id="title"
                name="title"
                disabled={!editing || saving}
              >
                <option value="">Select title</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
              </Field>
              <ErrorMessage name="title">
                {(msg) => <p style={styles.fieldError}>{msg}</p>}
              </ErrorMessage>
            </div>

            <div style={styles.field}>
              <label htmlFor="fname">First Name</label>
              <Field
                id="fname"
                name="fname"
                disabled={!editing || saving}
                maxLength={100}
                aria-invalid={Boolean(touched.fname && errors.fname)}
              />
              <ErrorMessage name="fname">
                {(msg) => <p style={styles.fieldError}>{msg}</p>}
              </ErrorMessage>
            </div>

            <div style={styles.field}>
              <label htmlFor="lname">Last Name</label>
              <Field
                id="lname"
                name="lname"
                disabled={!editing || saving}
                maxLength={100}
                aria-invalid={Boolean(touched.lname && errors.lname)}
              />
              <ErrorMessage name="lname">
                {(msg) => <p style={styles.fieldError}>{msg}</p>}
              </ErrorMessage>
            </div>

            <div style={styles.field}>
              <label htmlFor="phone">Contact Number</label>
              <Field
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                disabled={!editing || saving}
                maxLength={30}
                aria-invalid={Boolean(touched.phone && errors.phone)}
              />
              <ErrorMessage name="phone">
                {(msg) => <p style={styles.fieldError}>{msg}</p>}
              </ErrorMessage>
            </div>

            <div style={styles.field}>
              <label htmlFor="gender">Gender</label>
              <Field
                as="select"
                id="gender"
                name="gender"
                disabled={!editing || saving}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </Field>
              <ErrorMessage name="gender">
                {(msg) => <p style={styles.fieldError}>{msg}</p>}
              </ErrorMessage>
            </div>

            <div style={styles.field}>
              <label htmlFor="date_of_birth">Date of Birth</label>
              <Field
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                disabled={!editing || saving}
                aria-invalid={Boolean(
                  touched.date_of_birth && errors.date_of_birth
                )}
              />
              <ErrorMessage name="date_of_birth">
                {(msg) => <p style={styles.fieldError}>{msg}</p>}
              </ErrorMessage>
            </div>

            <div style={styles.field}>
              <label htmlFor="addressline">Address</label>
              <Field
                id="addressline"
                name="addressline"
                disabled={!editing || saving}
                maxLength={200}
                aria-invalid={Boolean(
                  touched.addressline && errors.addressline
                )}
              />
              <ErrorMessage name="addressline">
                {(msg) => <p style={styles.fieldError}>{msg}</p>}
              </ErrorMessage>
            </div>

            <div style={styles.field}>
              <label htmlFor="town">City / Town</label>
              <Field
                id="town"
                name="town"
                disabled={!editing || saving}
                maxLength={200}
                aria-invalid={Boolean(touched.town && errors.town)}
              />
              <ErrorMessage name="town">
                {(msg) => <p style={styles.fieldError}>{msg}</p>}
              </ErrorMessage>
            </div>
          </div>

          <div style={styles.actions}>
            {!editing ? (
              <button
                type="button"
                style={styles.button}
                onClick={onEdit}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    ...(saving || isSubmitting
                      ? styles.disabledButton
                      : {}),
                  }}
                  disabled={saving || isSubmitting}
                >
                  {saving || isSubmitting ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={onCancel}
                  disabled={saving || isSubmitting}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}

const styles = {
  heading: {
    marginBottom: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginTop: "24px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: 0,
  },
  fieldError: {
    color: "#b91c1c",
    margin: 0,
    fontSize: "14px",
  },
  button: {
    padding: "10px 18px",
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  cancelButton: {
    padding: "10px 18px",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "24px",
  },
};
