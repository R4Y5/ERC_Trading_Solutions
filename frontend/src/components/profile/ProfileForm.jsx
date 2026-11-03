import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

// Validation (unchanged)
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

const TITLES = ["Mr.", "Ms.", "Mrs.", "Dr."];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

// Read-only view of one detail
function Detail({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 500, color: value ? "text.primary" : "text.disabled", overflowWrap: "anywhere" }}>
        {value || "Not set"}
      </Typography>
    </Box>
  );
}

const formatBirthday = (value) => {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-PH", { dateStyle: "long" });
};

// Personal information: read-only details, or an MUI form while editing.
// Props are the same as before, so useProfile works unchanged.
export default function ProfileForm({
  formData,
  editing,
  saving,
  onSubmit,
  onEdit,
  onCancel,
}) {
  if (!editing) {
    return (
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 6, sm: 4 }}><Detail label="Title" value={formData.title} /></Grid>
        <Grid size={{ xs: 6, sm: 4 }}><Detail label="First name" value={formData.fname} /></Grid>
        <Grid size={{ xs: 6, sm: 4 }}><Detail label="Last name" value={formData.lname} /></Grid>
        <Grid size={{ xs: 6, sm: 4 }}><Detail label="Contact number" value={formData.phone} /></Grid>
        <Grid size={{ xs: 6, sm: 4 }}><Detail label="Gender" value={formData.gender} /></Grid>
        <Grid size={{ xs: 6, sm: 4 }}><Detail label="Date of birth" value={formatBirthday(formData.date_of_birth)} /></Grid>
        <Grid size={{ xs: 12, sm: 8 }}><Detail label="Address" value={formData.addressline} /></Grid>
        <Grid size={{ xs: 6, sm: 4 }}><Detail label="City / Town" value={formData.town} /></Grid>
        <Grid size={{ xs: 12 }}>
          <Button variant="contained" onClick={onEdit}>
            Edit Profile
          </Button>
        </Grid>
      </Grid>
    );
  }

  return (
    <Formik
      initialValues={formData}
      enableReinitialize
      validationSchema={profileSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, isSubmitting }) => {
        const busy = saving || isSubmitting;
        const fieldProps = (name) => ({
          id: name,
          name,
          disabled: busy,
          error: Boolean(touched[name] && errors[name]),
          helperText: touched[name] && errors[name],
        });

        return (
          <Form noValidate>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field as={TextField} select label="Title" {...fieldProps("title")}>
                  <MenuItem value="">Not set</MenuItem>
                  {TITLES.map((title) => (
                    <MenuItem key={title} value={title}>{title}</MenuItem>
                  ))}
                </Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field as={TextField} label="First name" required slotProps={{ htmlInput: { maxLength: 100 } }} {...fieldProps("fname")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field as={TextField} label="Last name" required slotProps={{ htmlInput: { maxLength: 100 } }} {...fieldProps("lname")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field as={TextField} label="Contact number" type="tel" autoComplete="tel" slotProps={{ htmlInput: { maxLength: 30 } }} {...fieldProps("phone")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field as={TextField} select label="Gender" {...fieldProps("gender")}>
                  <MenuItem value="">Not set</MenuItem>
                  {GENDERS.map((gender) => (
                    <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                  ))}
                </Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field as={TextField} label="Date of birth" type="date" slotProps={{ inputLabel: { shrink: true } }} {...fieldProps("date_of_birth")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Field as={TextField} label="Address" autoComplete="street-address" slotProps={{ htmlInput: { maxLength: 200 } }} {...fieldProps("addressline")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field as={TextField} label="City / Town" autoComplete="address-level2" slotProps={{ htmlInput: { maxLength: 200 } }} {...fieldProps("town")} />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />} disabled={busy}>
                {busy ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={onCancel} disabled={busy}>
                Cancel
              </Button>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
}