import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { peso, orderTotal } from '../../utils/format'


// Item list with unit price, quantity, subtotal and grand total
// Unit price is hidden on phones so the subtotal column fits
const priceCell = { display: { xs: 'none', sm: 'table-cell' } }

function OrderItemsTable({ orderLines = [] }) {
    if (orderLines.length === 0) {
        return <Typography color="text.secondary">No items found for this order.</Typography>
    }

    return (
        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ '& th': { bgcolor: 'grey.50', fontWeight: 600 } }}>
                        <TableCell>Item</TableCell>
                        <TableCell align="right" sx={priceCell}>Price</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orderLines.map((line, index) => {
                        const image = (line.item?.images || []).find(
                            (img) => !img.deleted_at && img.image_path
                        )
                        return (
                            <TableRow key={line._id || index}>
                                <TableCell>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                        <Avatar
                                            variant="rounded"
                                            src={image?.image_path}
                                            sx={{ width: 36, height: 36, bgcolor: 'grey.100', color: 'grey.400' }}
                                        >
                                            <ImageOutlinedIcon fontSize="small" />
                                        </Avatar>
                                        <span>{line.item?.item_name || 'Item unavailable'}</span>
                                    </Stack>
                                </TableCell>
                                <TableCell align="right" sx={priceCell}>{peso(line.price)}</TableCell>
                                <TableCell align="right">{line.quantity}</TableCell>
                                <TableCell align="right">
                                    {peso(Number(line.price || 0) * Number(line.quantity || 0))}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    <TableRow sx={{ '& td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontWeight: 700 }}>
                            Grand Total
                        </TableCell>
                        <TableCell sx={priceCell} />
                        <TableCell />
                        <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            {peso(orderTotal(orderLines))}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default OrderItemsTable
