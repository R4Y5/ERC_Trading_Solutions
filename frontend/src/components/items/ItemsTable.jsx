import { useMemo } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import RestoreIcon from '@mui/icons-material/Restore'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'

const peso = (value) =>
    '₱' +
    Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

const activeReviews = (item) =>
    (item.reviews || []).filter((review) => !review.deleted_at)

const averageRating = (item) => {
    const reviews = activeReviews(item)
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
}

// DataGrid's selection model is { type: 'include' | 'exclude', ids: Set }.
// "exclude" means "every row except these" (used by Select All).
const toSelectedIds = (model, rowIds) =>
    model.type === 'exclude'
        ? rowIds.filter((id) => !model.ids.has(id))
        : rowIds.filter((id) => model.ids.has(id))

// Products datatable for the admin Items page (MUI DataGrid).
// Checkbox selection drives bulk delete / bulk restore.
function ItemsTable({
    items,
    viewDeleted,
    selectedItemIds,
    onSelectionChange,
    bulkDeleting,
    bulkRestoring,
    onBulkDelete,
    onBulkRestore,
    onEdit,
    onDelete,
    onRestore
}) {
    const rows = useMemo(
        () =>
            items.map((item) => {
                const reviews = activeReviews(item)
                const image = (item.images || []).find(
                    (img) => !img.deleted_at && img.image_path
                )
                return {
                    id: item._id,
                    item,
                    image: image?.image_path || '',
                    item_name: item.item_name,
                    description: item.description,
                    category: item.category,
                    cost_price: Number(item.cost_price || 0),
                    sell_price: Number(item.sell_price || 0),
                    stock: Number(item.stock?.quantity ?? 0),
                    rating: averageRating(item),
                    reviewCount: reviews.length
                }
            }),
        [items]
    )

    const rowIds = useMemo(() => rows.map((row) => row.id), [rows])

    const selectionModel = useMemo(
        () => ({ type: 'include', ids: new Set(selectedItemIds) }),
        [selectedItemIds]
    )

    const columns = [
        {
            field: 'image',
            headerName: '',
            width: 64,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: ({ row }) => (
                <Avatar
                    variant="rounded"
                    src={row.image || undefined}
                    alt={row.item_name}
                    sx={{ width: 44, height: 44, bgcolor: 'grey.100', color: 'grey.400' }}
                >
                    <ImageOutlinedIcon />
                </Avatar>
            )
        },
        {
            field: 'item_name',
            headerName: 'Product',
            flex: 1.6,
            minWidth: 200,
            renderCell: ({ row }) => (
                <Box sx={{ py: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>
                        {row.item_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {row.description}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'category',
            headerName: 'Category',
            flex: 0.8,
            minWidth: 120,
            renderCell: ({ value }) => (
                <Chip label={value} size="small" variant="outlined" />
            )
        },
        {
            field: 'cost_price',
            headerName: 'Cost',
            type: 'number',
            minWidth: 110,
            valueFormatter: (value) => peso(value)
        },
        {
            field: 'sell_price',
            headerName: 'Price',
            type: 'number',
            minWidth: 110,
            valueFormatter: (value) => peso(value)
        },
        {
            field: 'stock',
            headerName: 'Stock',
            type: 'number',
            minWidth: 100,
            renderCell: ({ value }) => (
                <Chip
                    size="small"
                    label={value === 0 ? 'Out' : value}
                    color={value === 0 ? 'error' : value < 10 ? 'warning' : 'success'}
                    variant={value === 0 ? 'filled' : 'outlined'}
                />
            )
        },
        {
            field: 'rating',
            headerName: 'Rating',
            minWidth: 160,
            renderCell: ({ row }) =>
                row.reviewCount === 0 ? (
                    <Typography variant="body2" color="text.secondary">No reviews</Typography>
                ) : (
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <Rating value={row.rating} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                            ({row.reviewCount})
                        </Typography>
                    </Stack>
                )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 110,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            align: 'right',
            headerAlign: 'right',
            renderCell: ({ row }) =>
                viewDeleted ? (
                    <Tooltip title="Restore">
                        <IconButton color="success" onClick={() => onRestore(row.id)} aria-label={`Restore ${row.item_name}`}>
                            <RestoreIcon />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <>
                        <Tooltip title="Edit">
                            <IconButton color="primary" onClick={() => onEdit(row.item)} aria-label={`Edit ${row.item_name}`}>
                                <EditOutlinedIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => onDelete(row.id)} aria-label={`Delete ${row.item_name}`}>
                                <DeleteOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                )
        }
    ]

    const selectedCount = selectedItemIds.length

    return (
        <Box>
            {/* Bulk action bar */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 1.5 }}
            >
                <Typography color="text.secondary" variant="body2">
                    {selectedCount > 0
                        ? `${selectedCount} selected`
                        : 'Tick the checkboxes to select products.'}
                </Typography>

                {viewDeleted ? (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<RestoreIcon />}
                        disabled={selectedCount === 0 || bulkRestoring}
                        onClick={onBulkRestore}
                    >
                        {bulkRestoring ? 'Restoring...' : `Restore Selected (${selectedCount})`}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        disabled={selectedCount === 0 || bulkDeleting}
                        onClick={onBulkDelete}
                    >
                        {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedCount})`}
                    </Button>
                )}
            </Stack>

            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={selectionModel}
                onRowSelectionModelChange={(model) =>
                    onSelectionChange(toSelectedIds(model, rowIds))
                }
                getRowHeight={() => 64}
                pageSizeOptions={[5, 10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10, page: 0 } }
                }}
                localeText={{
                    noRowsLabel: viewDeleted ? 'No deleted products.' : 'No products found.'
                }}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' },
                    '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' }
                }}
            />
        </Box>
    )
}

export default ItemsTable
