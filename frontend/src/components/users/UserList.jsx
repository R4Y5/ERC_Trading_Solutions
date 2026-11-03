import { useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

const isHttpUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value);

const fullName = (user) =>
  [user.customer?.fname, user.customer?.lname].filter(Boolean).join(" ") ||
  user.username ||
  "—";

// Users datatable with activate / deactivate actions
function UserList({ users, onStatusChange, updatingUserId }) {
  const currentUserId = useSelector((state) => state.auth.user?._id);

  const rows = users.map((user) => ({
    id: user._id,
    user,
    name: fullName(user),
    email: user.email,
    username: user.username,
    gender: user.customer?.gender || "Not specified",
    role: user.role,
    status: user.status,
    provider: user.auth_provider === "google" ? "Google" : "Email",
  }));

  const columns = [
    {
      field: "name",
      headerName: "User",
      flex: 1.4,
      minWidth: 220,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
          <Avatar
            src={isHttpUrl(row.user.profile_image) ? row.user.profile_image : undefined}
            alt={row.name}
            sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 15 }}
          >
            {row.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>
              {row.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              @{row.username || "—"}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    { field: "email", headerName: "Email", flex: 1.3, minWidth: 200 },
    { field: "gender", headerName: "Gender", minWidth: 120 },
    {
      field: "provider",
      headerName: "Sign-in",
      minWidth: 100,
      renderCell: ({ value }) => (
        <Chip size="small" label={value} variant="outlined" />
      ),
    },
    {
      field: "role",
      headerName: "Role",
      minWidth: 100,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value}
          color={value === "Admin" ? "primary" : "default"}
          variant={value === "Admin" ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value || "Unknown"}
          color={value === "Active" ? "success" : "error"}
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      minWidth: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => {
        const isActive = row.status === "Active";
        const isSelf = row.id === currentUserId;
        const button = (
          <Button
            size="small"
            variant="outlined"
            color={isActive ? "error" : "success"}
            startIcon={isActive ? <BlockIcon /> : <CheckCircleOutlinedIcon />}
            disabled={isSelf || updatingUserId === row.id}
            onClick={() => onStatusChange(row.user)}
          >
            {updatingUserId === row.id
              ? "Saving..."
              : isActive
                ? "Deactivate"
                : "Activate"}
          </Button>
        );

        return isSelf ? (
          <Tooltip title="You can't deactivate your own account">
            <span>{button}</span>
          </Tooltip>
        ) : (
          button
        );
      },
    },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      disableRowSelectionOnClick
      getRowHeight={() => 60}
      pageSizeOptions={[10, 25, 50]}
      initialState={{
        pagination: { paginationModel: { pageSize: 10, page: 0 } },
      }}
      localeText={{ noRowsLabel: "No users found." }}
      sx={{
        bgcolor: "background.paper",
        "& .MuiDataGrid-columnHeaders": { bgcolor: "grey.50" },
        "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
      }}
    />
  );
}

export default UserList;
