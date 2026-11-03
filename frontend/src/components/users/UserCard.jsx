
function UserCard({ user, onStatusChange, updating }) {
    const isActive = user.status === 'Active'

    const fullName = [
        user.customer?.fname,
        user.customer?.lname
    ]
        .filter(Boolean)
        .join(' ') || user.username || 'Unnamed User'

    const username = user.username
        ? `@${user.username}`
        : '—'

    const cellStyle = {
        padding: '14px 16px',
        borderBottom: '1px solid #e5e7eb',
        verticalAlign: 'middle'
    }

    const avatarStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        border: '1px solid #e5e7eb'
    }

    return (
        <tr>
            {/* Profile image and user information */}
            <td style={cellStyle}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    {user.profile_image ? (
                        <img
                            src={user.profile_image}
                            alt={`${fullName}'s profile`}
                            style={avatarStyle}
                            onError={(event) => {
                                event.currentTarget.style.display = 'none'
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                ...avatarStyle,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}
                        >
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div>
                        <strong>{fullName}</strong>

                        <div
                            style={{
                                color: '#6b7280',
                                fontSize: '13px',
                                marginTop: '4px'
                            }}
                        >
                            {user.customer?.phone || 'No phone number'}
                        </div>
                    </div>
                </div>
            </td>

            {/* Email and username */}
            <td style={cellStyle}>
                <div>{user.email}</div>

                <div
                    style={{
                        color: '#6b7280',
                        fontSize: '13px',
                        marginTop: '4px'
                    }}
                >
                    {username}
                </div>
            </td>

            {/* Role */}
            <td style={cellStyle}>
                {user.role}
            </td>

            {/* Account status */}
            <td style={cellStyle}>
                <span
                    style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: isActive
                            ? '#dcfce7'
                            : '#fee2e2',
                        color: isActive
                            ? '#166534'
                            : '#991b1b'
                    }}
                >
                    {user.status || 'Unknown'}
                </span>
            </td>

            {/* Activate / deactivate */}
            <td style={cellStyle}>
                <button
                    type="button"
                    onClick={() => onStatusChange(user)}
                    disabled={updating}
                    style={{
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: updating ? 'wait' : 'pointer',
                        backgroundColor: isActive
                            ? '#fee2e2'
                            : '#dcfce7',
                        color: isActive
                            ? '#991b1b'
                            : '#166534',
                        fontWeight: '600',
                        opacity: updating ? 0.6 : 1
                    }}
                >
                    {updating
                        ? 'Updating...'
                        : isActive
                            ? 'Deactivate'
                            : 'Activate'}
                </button>
            </td>
        </tr>
    )
}

export default UserCard
