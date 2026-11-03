import { createTheme } from '@mui/material/styles'

// ERC Trading Solutions brand theme (Material UI)
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1e3a8a', // navy
            dark: '#172554',
            light: '#3b5bdb',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#f59e0b', // amber
            contrastText: '#172554'
        },
        success: { main: '#15803d' },
        error: { main: '#dc2626' },
        warning: { main: '#d97706' },
        background: {
            default: '#f5f7fb',
            paper: '#ffffff'
        },
        text: {
            primary: '#111827',
            secondary: '#4b5563'
        },
        divider: '#e5e7eb'
    },
    shape: {
        borderRadius: 10
    },
    typography: {
        fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontSize: '1.5rem', fontWeight: 700 },
        h3: { fontSize: '1.25rem', fontWeight: 600 },
        h4: { fontSize: '1.125rem', fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 }
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true }
        },
        MuiCard: {
            defaultProps: { variant: 'outlined' },
            styleOverrides: {
                root: { borderColor: '#e5e7eb' }
            }
        },
        MuiPaper: {
            styleOverrides: {
                outlined: { borderColor: '#e5e7eb' }
            }
        },
        MuiTextField: {
            defaultProps: { size: 'small', fullWidth: true }
        },
        MuiFormControl: {
            defaultProps: { size: 'small' }
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600 }
            }
        },
        MuiAppBar: {
            defaultProps: { elevation: 0 }
        }
    }
})

export default theme
