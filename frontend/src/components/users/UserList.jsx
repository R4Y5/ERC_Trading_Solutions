import UserCard from "./UserCard";

function UserList({ users, onStatusChange, updatingUserId, searchTerm }) {
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Profile Picture</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Gender</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                <img
                  src={
                    user.profile_image
                      ? user.profile_image
                      : "/default-profile.png"
                  }
                  alt="Profile"
                  width="50"
                  height="50"
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </td>

              <td>
                {user.customer?.fname} {user.customer?.lname}
              </td>

              <td>{user.email}</td>

              <td>{user.username}</td>

              <td>{user.customer?.gender || "Not specified"}</td>

              <td>{user.role}</td>

              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

export default UserList;
