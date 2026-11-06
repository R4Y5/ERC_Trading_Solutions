import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList
} from 'recharts'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import useTopProducts, { TOP_PRODUCT_RANGES } from '../../hooks/useTopProducts'

const BAR_COLOR = '#1e3a8a'
const TOP_COLOR = '#f59e0b' // the #1 product is highlighted in amber

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
    return `₱${Math.round(n)}`
}

// Keep long product names readable on the chart axis
const shortName = (name) => (name.length > 22 ? `${name.slice(0, 21)}…` : name)

function TopProductTooltip({ active, payload }) {
    if (!active || !payload || payload.length === 0) return null
    const row = payload[0].payload

    return (
        <Paper variant="outlined" sx={{ px: 1.5, py: 1, fontSize: 14, maxWidth: 260 }}>
            <strong>#{row.rank} {row.name}</strong>
            {row.category && <div style={{ color: '#6b7280' }}>{row.category}</div>}
            <div>Units sold: {row.units}</div>
            <div>Revenue: {formatPeso(row.revenue)}</div>
            <div>In {row.orders} order(s)</div>
            <div>{row.share}% of all {row.metricLabel}</div>
        </Paper>
    )
}

// Best-selling products (by units sold or by revenue)
function TopProductsChart() {
    const {
        metric,
        setMetric,
        rangeKey,
        setRangeKey,
        limit,
        setLimit,
        products,
        totals,
        loading,
        error
    } = useTopProducts()

    const isRevenue = metric === 'revenue'
    const data = products.map((product, index) => ({
        ...product,
        rank: index + 1,
        label: shortName(product.name),
        value: isRevenue ? product.revenue : product.units,
        metricLabel: isRevenue ? 'revenue' : 'units sold'
    }))

    const best = data[0]
    const chartHeight = Math.max(220, data.length * 44 + 40)

    return (
        <Card component="section" aria-labelledby="top-products-title" sx={{ mt: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
                >
                    <Box>
                        <Typography id="top-products-title" variant="h2" sx={{ mb: 0 }}>
                            Top-Selling Products
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your most bought products. Cancelled orders are excluded.
                        </Typography>
                    </Box>

                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        color="primary"
                        value={metric}
                        onChange={(_, value) => value && setMetric(value)}
                        aria-label="Rank products by"
                    >
                        <ToggleButton value="units" aria-label="Units sold">
                            <Inventory2OutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Units sold
                        </ToggleButton>
                        <ToggleButton value="revenue" aria-label="Revenue">
                            <PaymentsOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Revenue
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
                    {TOP_PRODUCT_RANGES.map((range) => (
                        <Chip
                            key={range.key}
                            label={range.label}
                            onClick={() => setRangeKey(range.key)}
                            color={rangeKey === range.key ? 'primary' : 'default'}
                            variant={rangeKey === range.key ? 'filled' : 'outlined'}
                            component="button"
                            type="button"
                        />
                    ))}

                    <TextField
                        select
                        label="Show"
                        value={limit}
                        onChange={(event) => setLimit(Number(event.target.value))}
                        sx={{ width: 120, ml: { sm: 'auto' } }}
                    >
                        <MenuItem value={5}>Top 5</MenuItem>
                        <MenuItem value={10}>Top 10</MenuItem>
                        <MenuItem value={20}>Top 20</MenuItem>
                    </TextField>
                </Stack>

                {error ? (
                    <Alert severity="error" role="alert">{error}</Alert>
                ) : loading ? (
                    <Skeleton variant="rounded" height={320} />
                ) : data.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        No products were sold in this period.
                    </Box>
                ) : (
                    <>
                        {best && (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    borderColor: 'secondary.main',
                                    bgcolor: 'rgba(245,158,11,0.06)'
                                }}
                            >
                                <EmojiEventsOutlinedIcon sx={{ color: 'secondary.main' }} />
                                <Typography variant="body2">
                                    <strong>Best seller:</strong> {best.name} —{' '}
                                    {isRevenue
                                        ? `${formatPeso(best.revenue)} in revenue`
                                        : `${best.units} unit(s) sold`}
                                    {' '}({best.share}% of all {best.metricLabel}).{' '}
                                    {totals.products} different product(s) sold in this period.
                                </Typography>
                            </Paper>
                        )}

                        <Box sx={{ width: '100%', height: chartHeight }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={data}
                                    layout="vertical"
                                    margin={{ top: 4, right: 56, bottom: 4, left: 8 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                    <XAxis
                                        type="number"
                                        tickFormatter={isRevenue ? formatPesoShort : undefined}
                                        allowDecimals={false}
                                        tick={{ fontSize: 12, fill: '#4b5563' }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="label"
                                        width={170}
                                        tick={{ fontSize: 13, fill: '#111827' }}
                                    />
                                    <Tooltip content={<TopProductTooltip />} cursor={{ fill: 'rgba(30,58,138,0.06)' }} />
                                    <Bar
                                        dataKey="value"
                                        name={isRevenue ? 'Revenue' : 'Units sold'}
                                        radius={[0, 4, 4, 0]}
                                        barSize={24}
                                        shape={(props) => {
                                            const { x, y, width, height, index } = props
                                            return (
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={height}
                                                    rx={4}
                                                    fill={index === 0 ? TOP_COLOR : BAR_COLOR}
                                                />
                                            )
                                        }}
                                    >
                                        <LabelList
                                            dataKey="value"
                                            position="right"
                                            formatter={isRevenue ? formatPesoShort : undefined}
                                            style={{ fontSize: 12, fill: '#111827', fontWeight: 600 }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default TopProductsChart
