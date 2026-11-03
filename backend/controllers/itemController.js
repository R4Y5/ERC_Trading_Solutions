
const mongoose = require('mongoose')
const { Readable } = require('stream')
const Item = require('../models/itemModel')
const cloudinary = require('../config/cloudinary')


const uploadImage = (file) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'erc-trading/products',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    return reject(error)
                }

                if (!result) {
                    return reject(new Error('Cloudinary returned no upload result'))
                }

                resolve({
                    image_path: result.secure_url,
                    public_id: result.public_id,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null
                })
            }
        )

        Readable.from([file.buffer]).pipe(stream)
    })

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image'
    })

    if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error('Failed to delete image from Cloudinary')
    }
}

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const createItem = async (req, res) => {
    const uploadedImages = []

    try {
        const {
            item_name,
            description,
            cost_price,
            sell_price,
            category,
            quantity
        } = req.body

        if (!item_name?.trim() || !description?.trim() || !category?.trim()) {
            return res.status(400).json({
                message: 'Item name, description, and category are required'
            })
        }

        const cost = Number(cost_price)
        const sell = Number(sell_price)
        const stockQuantity = Number(quantity)

        if (
            !Number.isFinite(cost) || cost < 0 ||
            !Number.isFinite(sell) || sell < 0 ||
            !Number.isInteger(stockQuantity) || stockQuantity < 0
        ) {
            return res.status(400).json({
                message: 'Prices must be non-negative numbers and stock must be a non-negative integer'
            })
        }

        for (const file of (req.files || [])) {
            uploadedImages.push(await uploadImage(file))
        }

        const item = await Item.create({
            item_name: item_name.trim(),
            description: description.trim(),
            cost_price: cost,
            sell_price: sell,
            category: category.trim(),
            stock: { quantity: stockQuantity },
            images: uploadedImages
        })

        return res.status(201).json({
            message: 'Item created successfully',
            item
        })
    } catch (error) {
        await Promise.allSettled(
            uploadedImages.map(image =>
                deleteCloudinaryImage(image.public_id)
            )
        )

        return res.status(500).json({
            message: 'Error creating item',
            error: error.message
        })
    }
}

const getItems = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1)
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
        const search = String(req.query.search || '').trim()
        const category = String(req.query.category || '').trim()

        const filter = { deleted_at: null }

        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            filter.$or = [
                { item_name: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } }
            ]
        }

        if (category) {
            filter.category = category
        }

        const [items, total] = await Promise.all([
            Item.find(filter)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Item.countDocuments(filter)
        ])

        return res.status(200).json({
            message: 'Items retrieved successfully',
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error getting items',
            error: error.message
        })
    }
}

const getItem = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid item ID' })
        }

        const item = await Item.findOne({
            _id: req.params.id,
            deleted_at: null
        })

        if (!item) {
            return res.status(404).json({ message: 'Item not found' })
        }

        return res.status(200).json({
            message: 'Item retrieved successfully',
            item
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error getting item',
            error: error.message
        })
    }
}

const updateItem = async (req, res) => {
    const newlyUploadedImages = []

    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid item ID' })
        }

        const item = await Item.findOne({
            _id: req.params.id,
            deleted_at: null
        })

        if (!item) {
            return res.status(404).json({ message: 'Item not found' })
        }

        const {
            item_name,
            description,
            cost_price,
            sell_price,
            category,
            quantity,
            remove_image_ids
        } = req.body

        if (item_name !== undefined) {
            if (!String(item_name).trim()) {
                return res.status(400).json({ message: 'Item name is required' })
            }
            item.item_name = String(item_name).trim()
        }

        if (description !== undefined) {
            if (!String(description).trim()) {
                return res.status(400).json({ message: 'Description is required' })
            }
            item.description = String(description).trim()
        }

        if (category !== undefined) {
            if (!String(category).trim()) {
                return res.status(400).json({ message: 'Category is required' })
            }
            item.category = String(category).trim()
        }

        if (cost_price !== undefined) {
            const cost = Number(cost_price)
            if (!Number.isFinite(cost) || cost < 0) {
                return res.status(400).json({ message: 'Cost price must be non-negative' })
            }
            item.cost_price = cost
        }

        if (sell_price !== undefined) {
            const sell = Number(sell_price)
            if (!Number.isFinite(sell) || sell < 0) {
                return res.status(400).json({ message: 'Selling price must be non-negative' })
            }
            item.sell_price = sell
        }

        if (quantity !== undefined) {
            const stockQuantity = Number(quantity)
            if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
                return res.status(400).json({ message: 'Stock must be a non-negative integer' })
            }
            item.stock.quantity = stockQuantity
        }


let removeIds = []

if (remove_image_ids) {
    try {
        const parsedIds = Array.isArray(remove_image_ids)
            ? remove_image_ids
            : JSON.parse(remove_image_ids)

        removeIds = Array.isArray(parsedIds)
            ? parsedIds
            : [parsedIds]
    } catch {
        return res.status(400).json({
            message: "Invalid image removal data"
        })
    }
}

        const imagesToRemove = []

        for (const imageId of removeIds) {
            const image = item.images.id(imageId)

            if (!image || image.deleted_at !== null) {
                return res.status(400).json({
                    message: 'One or more image IDs are invalid or already removed'
                })
            }

            imagesToRemove.push(image)
        }

        for (const file of (req.files || [])) {
            newlyUploadedImages.push(await uploadImage(file))
        }

        for (const image of imagesToRemove) {
            image.deleted_at = new Date()
            image.updated_at = new Date()
        }

        item.images.push(...newlyUploadedImages)
        item.updated_at = new Date()

        await item.save()

        const imageCleanup = await Promise.allSettled(
            imagesToRemove.map(image => deleteCloudinaryImage(image.public_id))
        )

        return res.status(200).json({
            message: 'Item updated successfully',
            item,
            imageCleanupWarnings: imageCleanup
                .filter(result => result.status === 'rejected').length
        })
    } catch (error) {
        await Promise.allSettled(
            newlyUploadedImages.map(image =>
                deleteCloudinaryImage(image.public_id)
            )
        )

        return res.status(500).json({
            message: 'Error updating item',
            error: error.message
        })
    }
}

const deleteItem = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid item ID' })
        }

        const item = await Item.findOne({
            _id: req.params.id,
            deleted_at: null
        })

        if (!item) {
            return res.status(404).json({ message: 'Item not found' })
        }

        item.deleted_at = new Date()
        item.updated_at = new Date()
        await item.save()

        return res.status(200).json({
            message: 'Item deleted successfully'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting item',
            error: error.message
        })
    }
}

const bulkDeleteItems = async (req, res) => {
    try {
        const { ids } = req.body

        if (
            !Array.isArray(ids) ||
            ids.length === 0 ||
            ids.some(id => !isValidId(id))
        ) {
            return res.status(400).json({
                message: 'Provide a non-empty array of valid item IDs'
            })
        }

        const uniqueIds = [...new Set(ids.map(String))]

        const result = await Item.updateMany(
            {
                _id: { $in: uniqueIds },
                deleted_at: null
            },
            {
                $set: {
                    deleted_at: new Date(),
                    updated_at: new Date()
                }
            }
        )

        return res.status(200).json({
            message: `${result.modifiedCount} item(s) deleted successfully`,
            deletedCount: result.modifiedCount
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting items',
            error: error.message
        })
    }
}

// Get soft-deleted products
const getDeletedItems = async (req, res) => {
    try {
        const items = await Item.find({
            deleted_at: { $ne: null }
        }).sort({ deleted_at: -1 })

        return res.status(200).json({ items })
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching deleted products",
            error: error.message
        })
    }
}

// Restore a soft-deleted product
const restoreItem = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid item ID"
            })
        }

        const item = await Item.findOne({
            _id: req.params.id,
            deleted_at: { $ne: null }
        })

        if (!item) {
            return res.status(404).json({
                message: "Deleted product not found"
            })
        }

        item.deleted_at = null
        item.updated_at = new Date()

        await item.save()

        return res.status(200).json({
            message: "Product restored successfully",
            item
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error restoring product",
            error: error.message
        })
    }
}

//Restore bulk items
const bulkRestoreItems = async (req, res) => {
    try {
        const { ids } = req.body;

        if (
            !Array.isArray(ids) ||
            ids.length === 0 ||
            ids.some((id) => !isValidId(id))
        ) {
            return res.status(400).json({
                message: "Provide a non-empty array of valid item IDs",
            });
        }

        const uniqueIds = [...new Set(ids.map(String))];

        const result = await Item.updateMany(
            {
                _id: { $in: uniqueIds },
                deleted_at: { $ne: null },
            },
            {
                $set: {
                    deleted_at: null,
                    updated_at: new Date(),
                },
            }
        );

        return res.status(200).json({
            message: `${result.modifiedCount} item(s) restored successfully`,
            restoredCount: result.modifiedCount,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error restoring items",
            error: error.message,
        });
    }
};


module.exports = {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem,
    bulkDeleteItems,
    getDeletedItems,
    restoreItem,
    bulkRestoreItems
}
