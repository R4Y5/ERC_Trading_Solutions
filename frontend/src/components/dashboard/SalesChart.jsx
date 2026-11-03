import { useState } from 'react'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Paper from '@mui/material/Paper'
import BarChartIcon from '@mui/icons-material/BarChart'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import useSalesReport, { PRESETS, toDateInput } from '../../hooks/useSalesReport'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CHART_COLOR = '#1e3a8a'

const formatPeso = (value) =>
    '₱' +
    Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

const formatPesoShort = (value) => {
    const n = Number(value || 0)
    if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `₱${(n / 1_000).toFixed(1)}k`
    return `₱${n}`
}

// '2026-11-03' -> 'Nov 3', '2026-11' -> 'Nov 2026'
const formatPeriod = (period) => {
    const [y, m, d] = period.split('-')
    const month = MONTHS[Number(m) - 1]
    return d ? `${month} ${Number(d)}` : `${month} ${y}`
}

function SalesTooltip({ active, payload }) {
    if (!active || !payload || payload.length === 0) return null
    const row = payload[0].payload

    return (
        <Paper variant="outlined" sx={{ px: 1.5, py: 1, fontSize: 14 }}>
            <strong>{formatPeriod(row.period)}</strong>
            <div>Sales: {formatPeso(row.sales)}</div>
            <div>Orders: {row.orders}</div>
            <div>Items sold: {row.itemsSold}</div>
        </Paper>
    )
}

function StatTile({ label, value }) {
    return (
        <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{value}</Typography>
        </Paper>
    )
}

// Sales chart with a date range filter (Quiz 1)
function SalesChart() {
    const {
        start,
        end,
        groupBy,
        setStart,
        setEnd,
        setGroupBy,
        applyPreset,
        data,
        totals,
        loading,
        error
    } = useSalesReport()

    const [chartType, setChartType] = useState('bar')
    const today = toDateInput(new Date())
    const hasSales = data.some((row) => row.sales > 0)

    const commonAxes = (
        <>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
                dataKey="period"
                tickFormatter={formatPeriod}
                tick={{ fontSize: 12, fill: '#4b5563' }}
                minTickGap={16}
            />
            <YAxis
                tickFormatter={formatPesoShort}
                tick={{ fontSize: 12, fill: '#4b5563' }}
                width={70}
            />
            <Tooltip content={<SalesTooltip />} cursor={{ fill: 'rgba(30,58,138,0.06)' }} />
        </>
    )

    return (
        <Card component="section" aria-labelledby="sales-chart-title">
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
                >
                    <Box>
                        <Typography id="sales-chart-title" variant="h2" sx={{ mb: 0 }}>
                            Sales
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Based on the date each order was placed. Cancelled orders are excluded.
                        </Typography>
                    </Box>

                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        color="primary"
                        value={chartType}
                        onChange={(_, value) => value && setChartType(value)}
                        aria-label="Chart type"
                    >
                        <ToggleButton value="bar" aria-label="Bar">
                            <BarChartIcon fontSize="small" sx={{ mr: 0.5 }} /> Bar
                        </ToggleButton>
                        <ToggleButton value="line" aria-label="Line">
                            <ShowChartIcon fontSize="small" sx={{ mr: 0.5 }} /> Line
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                {/* Date range filter */}
                <Grid container spacing={2} sx={{ mb: 1.5 }}>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                            type="date"
                            label="Start date"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { max: end || today }
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                            type="date"
                            label="End date"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { min: start, max: today }
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                            select
                            label="Group by"
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                        >
                            <MenuItem value="day">Day</MenuItem>
                            <MenuItem value="month">Month</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {PRESETS.map((preset) => {
                                const range = preset.range()
                                const active = range.start === start && range.end === end
                                return (
                                    <Chip
                                        key={preset.label}
                                        label={preset.label}
                                        onClick={() => applyPreset(preset)}
                                        color={active ? 'primary' : 'default'}
                                        variant={active ? 'filled' : 'outlined'}
                                        component="button"
                                        type="button"
                                    />
                                )
                            })}
                        </Stack>
                    </Grid>
                </Grid>

                {error ? (
                    <Alert severity="error" role="alert">{error}</Alert>
                ) : (
                    <>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <StatTile label="Total sales" value={formatPeso(totals.sales)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <StatTile label="Orders" value={totals.orders} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <StatTile label="Items sold" value={totals.itemsSold} />
                            </Grid>
                        </Grid>

                        {loading ? (
                            <Skeleton variant="rounded" height={340} />
                        ) : !hasSales ? (
                            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                                No sales in this date range.
                            </Box>
                        ) : (
                            <Box sx={{ width: '100%', height: 340 }}>
                                <ResponsiveContainer>
                                    {chartType === 'bar' ? (
                                        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                            {commonAxes}
                                            <Bar dataKey="sales" name="Sales" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    ) : (
                                        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                            {commonAxes}
                                            <Line
                                                type="monotone"
                                                dataKey="sales"
                                                name="Sales"
                                                stroke={CHART_COLOR}
                                                strokeWidth={2.5}
                                                dot={data.length <= 31}
                                            />
                                        </LineChart>
                                    )}
                                </ResponsiveContainer>
                            </Box>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default SalesChart
