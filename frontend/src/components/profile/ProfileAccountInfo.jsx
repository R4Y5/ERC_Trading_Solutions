import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";

function InfoRow({ icon, label, children }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
      <Box sx={{ color: "text.secondary", mt: "2px", display: "flex" }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Box sx={{ fontWeight: 500, overflowWrap: "anywhere" }}>{children}</Box>
      </Box>
    </Stack>
  );
}

// Email, username, sign-in method and member-since date
export default function ProfileAccountInfo({ user, storedUser }) {
  const email = user?.email || storedUser?.email || "Not available";
  const username = user?.username || storedUser?.username || "Not available";
  const isGoogle = (user?.auth_provider || storedUser?.auth_provider) === "google";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-PH", { dateStyle: "long" })
    : null;

  return (
    <Stack spacing={1.75}>
      <InfoRow icon={<EmailOutlinedIcon fontSize="small" />} label="Email">
        {email}
      </InfoRow>

      <InfoRow icon={<AlternateEmailIcon fontSize="small" />} label="Username">
        {username}
      </InfoRow>

      <InfoRow icon={<LoginOutlinedIcon fontSize="small" />} label="Sign-in method">
        <Chip
          size="small"
          variant="outlined"
          label={isGoogle ? "Google" : "Email & password"}
          sx={{ mt: 0.25 }}
        />
      </InfoRow>

      {memberSince && (
        <InfoRow icon={<CalendarTodayOutlinedIcon fontSize="small" />} label="Member since">
          {memberSince}
        </InfoRow>
      )}
    </Stack>
  );
}