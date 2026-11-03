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
import useSalesReport, { PRESETS, toDateInput } from '../../hooks/useSalesReport'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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

const styles = {
    card: {
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        boxShadow: 'var(--shadow)',
        background: 'var(--bg)'
    },
    controls: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'flex-end',
        marginBottom: 12
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontSize: 14
    },
    input: {
        padding: '6px 8px',
        borderRadius: 6,
        border: '1px solid var(--border)',
        font: 'inherit',
        fontSize: 14
    },
    presets: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16
    },
    button: (active) => ({
        padding: '6px 12px',
        borderRadius: 999,
        border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
        background: active ? 'var(--accent-bg)' : 'transparent',
        color: active ? 'var(--accent)' : 'inherit',
        cursor: 'pointer',
        fontSize: 14
    }),
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 20
    },
    stat: {
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 12
    },
    statLabel: { fontSize: 13, margin: 0 },
    statValue: { fontSize: 22, fontWeight: 600, color: 'var(--text-h)', margin: 0 }
}

function SalesTooltip({ active, payload }) {
    if (!active || !payload || payload.length === 0) return null
    const row = payload[0].payload

    return (
        <div
            style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14
            }}
        >
            <strong>{formatPeriod(row.period)}</strong>
            <div>Sales: {formatPeso(row.sales)}</div>
            <div>Orders: {row.orders}</div>
            <div>Items sold: {row.itemsSold}</div>
        </div>
    )
}

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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
                dataKey="period"
                tickFormatter={formatPeriod}
                tick={{ fontSize: 12, fill: 'var(--text)' }}
                minTickGap={16}
            />
            <YAxis
                tickFormatter={formatPesoShort}
                tick={{ fontSize: 12, fill: 'var(--text)' }}
                width={70}
            />
            <Tooltip content={<SalesTooltip />} cursor={{ fill: 'var(--accent-bg)' }} />
        </>
    )

    return (
        <section style={styles.card} aria-labelledby="sales-chart-title">
            <h2 id="sales-chart-title" style={{ marginTop: 0 }}>Sales</h2>

            <div style={styles.controls}>
                <label style={styles.field}>
                    Start date
                    <input
                        type="date"
                        style={styles.input}
                        value={start}
                        max={end || today}
                        onChange={(e) => setStart(e.target.value)}
                    />
                </label>

                <label style={styles.field}>
                    End date
                    <input
                        type="date"
                        style={styles.input}
                        value={end}
                        min={start}
                        max={today}
                        onChange={(e) => setEnd(e.target.value)}
                    />
                </label>

                <label style={styles.field}>
                    Group by
                    <select
                        style={styles.input}
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                    >
                        <option value="day">Day</option>
                        <option value="month">Month</option>
                    </select>
                </label>

                <div style={{ ...styles.field, marginLeft: 'auto' }}>
                    Chart
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            type="button"
                            style={styles.button(chartType === 'bar')}
                            onClick={() => setChartType('bar')}
                            aria-pressed={chartType === 'bar'}
                        >
                            Bar
                        </button>
                        <button
                            type="button"
                            style={styles.button(chartType === 'line')}
                            onClick={() => setChartType('line')}
                            aria-pressed={chartType === 'line'}
                        >
                            Line
                        </button>
                    </div>
                </div>
            </div>

            <div style={styles.presets}>
                {PRESETS.map((preset) => {
                    const range = preset.range()
                    const active = range.start === start && range.end === end
                    return (
                        <button
                            key={preset.label}
                            type="button"
                            style={styles.button(active)}
                            onClick={() => applyPreset(preset)}
                        >
                            {preset.label}
                        </button>
                    )
                })}
            </div>

            {error ? (
                <p role="alert" style={{ color: 'red' }}>{error}</p>
            ) : (
                <>
                    <div style={styles.stats}>
                        <div style={styles.stat}>
                            <p style={styles.statLabel}>Total sales</p>
                            <p style={styles.statValue}>{formatPeso(totals.sales)}</p>
                        </div>
                        <div style={styles.stat}>
                            <p style={styles.statLabel}>Orders</p>
                            <p style={styles.statValue}>{totals.orders}</p>
                        </div>
                        <div style={styles.stat}>
                            <p style={styles.statLabel}>Items sold</p>
                            <p style={styles.statValue}>{totals.itemsSold}</p>
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading sales...</p>
                    ) : !hasSales ? (
                        <p>No sales in this date range. Cancelled orders are not counted.</p>
                    ) : (
                        <div style={{ width: '100%', height: 340 }}>
                            <ResponsiveContainer>
                                {chartType === 'bar' ? (
                                    <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                        {commonAxes}
                                        <Bar dataKey="sales" name="Sales" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                        {commonAxes}
                                        <Line
                                            type="monotone"
                                            dataKey="sales"
                                            name="Sales"
                                            stroke="var(--accent)"
                                            strokeWidth={2}
                                            dot={data.length <= 31}
                                        />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
            )}

            <p style={{ fontSize: 13, marginBottom: 0 }}>
                Sales exclude cancelled orders and are based on the date each order was placed.
            </p>
        </section>
    )
}

export default SalesChart
