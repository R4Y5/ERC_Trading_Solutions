import { useEffect, useRef, useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function RegistrationProfilePicture({ profilePicture, onChange }) {
    const inputRef = useRef(null)
    const [preview, setPreview] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!profilePicture) {
            setPreview('')
            return
        }

        const objectUrl = URL.createObjectURL(profilePicture)
        setPreview(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [profilePicture])

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]

        setError('')

        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png']

        if (!allowedTypes.includes(file.type)) {
            setError('Please select a JPEG or PNG image.')
            onChange(null)
            event.target.value = ''
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('The image must be 5 MB or smaller.')
            onChange(null)
            event.target.value = ''
            return
        }

        onChange(file)
    }

    const handleRemove = () => {
        onChange(null)
        setError('')

        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    return (
        <div>
            <label htmlFor="profilePicture">
                Profile Picture (Optional)
            </label>

            <input
                ref={inputRef}
                id="profilePicture"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
            />

            {preview && (
                <div>
                    <img
                        src={preview}
                        alt="Profile picture preview"
                        width="120"
                        height="120"
                        style={{
                            objectFit: 'cover',
                            borderRadius: '50%',
                        }}
                    />

                    <p>{profilePicture?.name}</p>

                    <button type="button" onClick={handleRemove}>
                        Remove Picture
                    </button>
                </div>
            )}

            {error && <p role="alert">{error}</p>}
        </div>
    )
}

export default RegistrationProfilePicture