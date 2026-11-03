
const express = require('express')

const {
    registerUser,
    completeRegistration,
    loginUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    getMyProfile,
    updateMyProfile
} = require('../controllers/userController')

const { protect, admin } = require('../middleware/authMiddleware')
const profileUpload = require('../middleware/profileUpload')

const router = express.Router()

// Registration and login
router.post('/register', registerUser)

router.post(
    '/complete-registration',
    profileUpload.single('profile_image'),
    completeRegistration
)

router.post('/login', loginUser)

// Logged-in user's profile
router.get('/profile', protect, getMyProfile)

router.put(
    '/profile',
    protect,
    profileUpload.single('profile_image'),
    updateMyProfile
)

// Admin user management
router.get('/', protect, admin, getUsers)
router.get('/:id', protect, admin, getUser)
router.put('/:id', protect, admin, updateUser)
router.delete('/:id', protect, admin, deleteUser)

router.patch('/:id/status', protect, admin, updateUserStatus)

module.exports = router
