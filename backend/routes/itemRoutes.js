
const express = require('express');

const {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem,
    bulkDeleteItems,
    getDeletedItems,
    restoreItem,
    bulkRestoreItems
} = require('../controllers/itemController');

const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public product browsing
router.get('/', getItems);

// Admin-only: get deleted products
router.get('/deleted', protect, admin, getDeletedItems);

// Admin-only: bulk delete products
router.delete('/bulk', protect, admin, bulkDeleteItems);

// Admin-only: bulk restore deleted products
router.patch('/bulk/restore', protect, admin, bulkRestoreItems);

// Admin-only: restore one deleted product
router.patch('/:id/restore', protect, admin, restoreItem);

// Get one product
router.get('/:id', getItem);

// Admin-only product management
router.post('/', protect, admin, upload.array('images', 10), createItem);
router.put('/:id', protect, admin, upload.array('images', 10), updateItem);
router.delete('/:id', protect, admin, deleteItem);

module.exports = router;
