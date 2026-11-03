
function UserSearch({ searchTerm, setSearchTerm, resultCount }) {
    return (
        <div style={{ marginBottom: '20px' }}>
            <label
                htmlFor="user-search"
                style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600'
                }}
            >
                Search Users
            </label>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    maxWidth: '500px'
                }}
            >
                <input
                    id="user-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                        setSearchTerm(event.target.value)
                    }
                    placeholder="Search name, email, username, phone..."
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '11px 14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outlineOffset: '2px'
                    }}
                />

                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        style={{
                            padding: '10px 14px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            <p
                style={{
                    color: '#6b7280',
                    fontSize: '13px',
                    marginTop: '8px'
                }}
            >
                {resultCount} {resultCount === 1 ? 'user' : 'users'} found
            </p>
        </div>
    )
}

export default UserSearch
