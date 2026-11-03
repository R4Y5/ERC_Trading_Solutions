import { useState } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { downloadOrderReceipt } from '../../services/orderService'

// "Download Receipt" button used on customer and admin order cards
function ReceiptButton({ orderId, size = 'medium', fullWidth = false }) {
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState('')

    const handleDownload = async () => {
        setDownloading(true)
        setError('')

        try {
            await downloadOrderReceipt(orderId)
        } catch (err) {
            // Errors come back as a Blob because the request asked for a file
            let message = 'Could not download the receipt. Please try again.'
            const data = err.response?.data

            if (data instanceof Blob) {
                try {
                    message = JSON.parse(await data.text()).message || message
                } catch {
                    // keep the default message
                }
            }

            setError(message)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
            <Button
                variant="outlined"
                size={size}
                fullWidth={fullWidth}
                onClick={handleDownload}
                disabled={downloading}
                startIcon={
                    downloading ? <CircularProgress size={16} /> : <DownloadOutlinedIcon />
                }
            >
                {downloading ? 'Preparing...' : 'Download Receipt'}
            </Button>

            {error && (
                <Typography variant="caption" color="error" role="alert" sx={{ display: 'block', mt: 0.5 }}>
                    {error}
                </Typography>
            )}
        </Box>
    )
}

export default ReceiptButton