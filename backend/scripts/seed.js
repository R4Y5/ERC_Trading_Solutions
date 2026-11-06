/*
 * Demo data seeder for ERC Trading Solutions.
 *
 * Run from the backend folder:
 *   npm run seed          add demo data (skips if it already exists)
 *   npm run seed:reset    remove the demo data, then add it again
 *   npm run seed:remove   remove the demo data only
 *
 * SAFE FOR REAL DATA: every demo record gets a fixed ID, and the reset/remove
 * options delete ONLY those IDs. Your own users, products and orders are never
 * touched. Demo accounts use @demo.erctrading.test addresses (no real emails).
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const crypto = require('crypto')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User = require('../models/userModel')
const Item = require('../models/itemModel')
const Order = require('../models/orderModel')
const Cart = require('../models/cartModel')

const EMAIL_DOMAIN = 'demo.erctrading.test'
const ADMIN_PASSWORD = 'Admin@12345'
const CUSTOMER_PASSWORD = 'Customer@123'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Same label -> same ObjectId every run (lets --reset find exactly our records)
const fixedId = (label) =>
    new mongoose.Types.ObjectId(
        crypto.createHash('md5').update(`erc-seed:${label}`).digest('hex').slice(0, 24)
    )

// Small deterministic random generator, so every run creates the same data
let randomState = 20261106
const random = () => {
    randomState = (randomState + 0x6d2b79f5) | 0
    let t = randomState
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const randomInt = (min, max) => min + Math.floor(random() * (max - min + 1))
const pick = (list) => list[Math.floor(random() * list.length)]

// Pick from a list where some entries are more likely ("popular products")
const weightedPick = (list, weightOf) => {
    const total = list.reduce((sum, entry) => sum + weightOf(entry), 0)
    let roll = random() * total
    for (const entry of list) {
        roll -= weightOf(entry)
        if (roll <= 0) return entry
    }
    return list[list.length - 1]
}

const daysAgo = (days, hour = 10) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    date.setHours(hour, randomInt(0, 59), 0, 0)
    return date
}

const addDays = (date, days) => {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return next
}

// Placeholder product image (works without Cloudinary)
const imageUrl = (label, background) =>
    `https://placehold.co/600x450/${background}/ffffff/png?text=${encodeURIComponent(label)}`

// ---------------------------------------------------------------------------
// Demo users
// ---------------------------------------------------------------------------

const ADMIN = {
    key: 'admin',
    username: 'erc_admin',
    title: 'Ms.',
    fname: 'Erika',
    lname: 'Cruz',
    gender: 'Female',
    phone: '09170000001',
    town: 'Makati City'
}

const CUSTOMERS = [
    { key: 'juan', title: 'Mr.', fname: 'Juan', lname: 'Dela Cruz', gender: 'Male', phone: '09171234567', town: 'Taguig City' },
    { key: 'maria', title: 'Ms.', fname: 'Maria', lname: 'Santos', gender: 'Female', phone: '09182345678', town: 'Quezon City' },
    { key: 'pedro', title: 'Mr.', fname: 'Pedro', lname: 'Reyes', gender: 'Male', phone: '09193456789', town: 'Pasig City' },
    { key: 'ana', title: 'Mrs.', fname: 'Ana', lname: 'Lim', gender: 'Female', phone: '09204567890', town: 'Mandaluyong City' },
    { key: 'carlo', title: 'Mr.', fname: 'Carlo', lname: 'Garcia', gender: 'Male', phone: '09215678901', town: 'Parañaque City' },
    { key: 'bea', title: 'Ms.', fname: 'Bea', lname: 'Mendoza', gender: 'Female', phone: '09226789012', town: 'Marikina City' },
    { key: 'miguel', title: 'Dr.', fname: 'Miguel', lname: 'Torres', gender: 'Male', phone: '09237890123', town: 'Las Piñas City' },
    { key: 'liza', title: 'Ms.', fname: 'Liza', lname: 'Navarro', gender: 'Prefer not to say', phone: '09248901234', town: 'Caloocan City' }
]

const STREETS = ['Rizal St.', 'Mabini Ave.', 'Bonifacio Rd.', 'Luna St.', 'Del Pilar St.', 'Aguinaldo Hwy.']

// ---------------------------------------------------------------------------
// Demo products (popularity = how often it appears in orders)
// ---------------------------------------------------------------------------

const PRODUCTS = [
    { key: 'pump', name: 'Hydraulic Pump HP-200', category: 'Parts', cost: 1100, price: 1500, stock: 14, popularity: 4, color: '1e3a8a', description: 'Heavy-duty hydraulic pump for industrial machines. Includes mounting kit.' },
    { key: 'bearing', name: 'Ball Bearing Set (10 pcs)', category: 'Parts', cost: 180, price: 260, stock: 120, popularity: 7, color: '1e40af', description: 'Sealed steel ball bearings for motors, carts and conveyors.' },
    { key: 'vbelt', name: 'V-Belt A-42', category: 'Parts', cost: 120, price: 185, stock: 6, popularity: 5, color: '1d4ed8', description: 'Durable rubber V-belt for pumps, compressors and fans.' },
    { key: 'bolts', name: 'Steel Bolts (100 pcs)', category: 'Hardware', cost: 15, price: 25, stock: 400, popularity: 10, color: '334155', description: 'Galvanized hex bolts with nuts, M8 x 40mm.' },
    { key: 'hinges', name: 'Door Hinges (pair)', category: 'Hardware', cost: 60, price: 95, stock: 80, popularity: 5, color: '475569', description: 'Stainless steel butt hinges, 4 inch, with screws.' },
    { key: 'padlock', name: 'Heavy-Duty Padlock', category: 'Hardware', cost: 210, price: 320, stock: 0, popularity: 3, color: '64748b', description: 'Hardened steel shackle padlock with 3 keys.' },
    { key: 'helmet', name: 'Safety Helmet', category: 'Safety', cost: 250, price: 375, stock: 45, popularity: 6, color: 'b45309', description: 'Impact-resistant hard hat with adjustable ratchet.' },
    { key: 'gloves', name: 'Industrial Gloves', category: 'Safety', cost: 190, price: 310, stock: 90, popularity: 8, color: 'd97706', description: 'Cut-resistant work gloves with rubber grip.' },
    { key: 'goggles', name: 'Safety Goggles', category: 'Safety', cost: 90, price: 150, stock: 8, popularity: 4, color: 'f59e0b', description: 'Anti-fog, scratch-resistant protective goggles.' },
    { key: 'grinder', name: 'Angle Grinder 4"', category: 'Tools', cost: 1650, price: 2290, stock: 12, popularity: 3, color: '166534', description: '850W angle grinder with side handle and guard.' },
    { key: 'drill', name: 'Cordless Drill 18V', category: 'Tools', cost: 2600, price: 3450, stock: 9, popularity: 3, color: '15803d', description: '18V cordless drill with 2 batteries and charger.' },
    { key: 'tape', name: 'Measuring Tape 5m', category: 'Tools', cost: 75, price: 120, stock: 150, popularity: 6, color: '16a34a', description: 'Steel measuring tape with lock and belt clip.' },
    { key: 'wrench', name: 'Pipe Wrench 14"', category: 'Tools', cost: 520, price: 830, stock: 20, popularity: 2, color: '22c55e', description: 'Cast iron pipe wrench with adjustable jaw.' },
    { key: 'wire', name: 'Copper Wire 10m', category: 'Electrical', cost: 340, price: 505, stock: 60, popularity: 5, color: '7c3aed', description: 'THHN stranded copper wire, 2.0mm².' },
    { key: 'ledlight', name: 'LED Work Light', category: 'Electrical', cost: 420, price: 635, stock: 25, popularity: 4, color: '6d28d9', description: 'Rechargeable 30W LED floodlight with stand.' },
    { key: 'breaker', name: 'Circuit Breaker 30A', category: 'Electrical', cost: 260, price: 390, stock: 3, popularity: 2, color: '5b21b6', description: '2-pole plug-in circuit breaker, 30 amps.' }
]

const REVIEW_TEXTS = {
    5: ['Excellent quality, works perfectly!', 'Exactly as described. Fast delivery too.', 'Very sturdy. Will buy again.', 'Great value for the price!'],
    4: ['Good product, does the job well.', 'Solid quality. Packaging could be better.', 'Works as expected. Happy with it.'],
    3: ['Okay for the price.', 'Average quality, but it works.', 'Decent, though delivery took a while.'],
    2: ['Not as durable as I hoped.', 'Smaller than I expected.'],
    1: ['Arrived damaged. Disappointed.']
}

const ADMIN_REPLIES = [
    'Thank you for your feedback! We are glad you liked it.',
    'Thanks for shopping with ERC Trading Solutions!',
    'We are sorry to hear that. Please message us so we can make it right.',
    'Thank you! We will share your feedback with our supplier.'
]

// ---------------------------------------------------------------------------
// Build all demo documents (in memory, before touching the database)
// ---------------------------------------------------------------------------

const buildUsers = async () => {
    const [adminHash, customerHash] = await Promise.all([
        bcrypt.hash(ADMIN_PASSWORD, 10),
        bcrypt.hash(CUSTOMER_PASSWORD, 10)
    ])

    const makeUser = (person, role, hash, index) => {
        const createdAt = daysAgo(330 - index * 9)
        return {
            _id: fixedId(`user:${person.key}`),
            email: `${person.key}@${EMAIL_DOMAIN}`,
            username: person.username || `${person.key}_demo`,
            password: hash,
            role,
            status: 'Active',
            auth_provider: 'local',
            registration_completed: true,
            email_verified_at: createdAt,
            profile_image: null,
            customer: {
                title: person.title,
                fname: person.fname,
                lname: person.lname,
                phone: person.phone,
                gender: person.gender,
                date_of_birth: new Date(Date.UTC(1985 + (index % 15), index % 12, 5 + index)),
                addressline: `${randomInt(10, 250)} ${pick(STREETS)}`,
                town: person.town,
                image_path: null
            },
            created_at: createdAt,
            updated_at: createdAt
        }
    }

    return [
        makeUser(ADMIN, 'Admin', adminHash, 0),
        ...CUSTOMERS.map((person, index) => makeUser(person, 'User', customerHash, index + 1))
    ]
}

const buildItems = () =>
    PRODUCTS.map((product, index) => {
        const createdAt = daysAgo(340 - index * 2)
        return {
            _id: fixedId(`item:${product.key}`),
            item_name: product.name,
            description: product.description,
            cost_price: product.cost,
            sell_price: product.price,
            category: product.category,
            stock: { quantity: product.stock },
            images: [
                {
                    image_path: imageUrl(product.name, product.color),
                    public_id: null,
                    created_at: createdAt,
                    updated_at: createdAt,
                    deleted_at: null
                }
            ],
            reviews: [],
            deleted_at: null,
            created_at: createdAt,
            updated_at: createdAt
        }
    })

const buildOrders = (customers, items) => {
    const orders = []
    const ORDER_COUNT = 60

    for (let n = 0; n < ORDER_COUNT; n += 1) {
        // Spread orders over the last ~300 days, more of them recently
        const age = Math.floor(Math.pow(random(), 1.6) * 300)
        const placed = daysAgo(age, randomInt(8, 20))

        // Older orders are finished; recent ones may still be in progress
        let status
        if (age > 14) status = random() < 0.9 ? 'Delivered' : 'Cancelled'
        else if (age > 5) status = pick(['Delivered', 'Delivered', 'Shipped', 'Cancelled'])
        else status = pick(['Pending', 'Pending', 'Shipped'])

        // 1-3 different products per order, popular ones more often
        const lineCount = randomInt(1, 3)
        const chosen = new Set()
        while (chosen.size < lineCount) {
            chosen.add(weightedPick(PRODUCTS, (product) => product.popularity).key)
        }

        const orderLines = [...chosen].map((key, lineIndex) => {
            const product = PRODUCTS.find((entry) => entry.key === key)
            const cheap = product.price < 400
            return {
                _id: fixedId(`order:${n}:line:${lineIndex}`),
                item: items.find((item) => item.item_name === product.name)._id,
                quantity: cheap ? randomInt(1, 6) : randomInt(1, 2),
                price: product.price
            }
        })

        const shipped = status === 'Shipped' || status === 'Delivered'
            ? addDays(placed, randomInt(1, 2))
            : null
        const delivered = status === 'Delivered'
            ? addDays(shipped, randomInt(2, 5))
            : null

        orders.push({
            _id: fixedId(`order:${n}`),
            customer: pick(customers)._id,
            status,
            date_placed: placed,
            date_shipped: shipped,
            date_delivered: delivered,
            order_lines: orderLines,
            deleted_at: null,
            created_at: placed,
            updated_at: delivered || shipped || placed
        })
    }

    return orders.sort((a, b) => a.date_placed - b.date_placed)
}

// Reviews only for products in DELIVERED orders (same rule as the app),
// at most one review per customer + product + order.
const addReviews = (items, orders) => {
    orders
        .filter((order) => order.status === 'Delivered')
        .forEach((order) => {
            order.order_lines.forEach((line) => {
                if (random() > 0.6) return // not everyone leaves a review

                const rating = weightedPick([5, 4, 3, 2, 1], (r) => ({ 5: 9, 4: 7, 3: 3, 2: 1, 1: 0.5 })[r])
                const reviewedAt = addDays(order.date_delivered, randomInt(1, 6))
                const item = items.find((entry) => String(entry._id) === String(line.item))

                item.reviews.push({
                    _id: fixedId(`review:${order._id}:${line.item}`),
                    customer: order.customer,
                    order: order._id,
                    rating,
                    review_text: pick(REVIEW_TEXTS[rating]),
                    admin_reply: random() < 0.35
                        ? (rating <= 2 ? ADMIN_REPLIES[2] : pick([ADMIN_REPLIES[0], ADMIN_REPLIES[1], ADMIN_REPLIES[3]]))
                        : '',
                    images: [],
                    created_at: reviewedAt,
                    updated_at: reviewedAt,
                    deleted_at: null
                })
            })
        })
}

// ---------------------------------------------------------------------------
// Database actions
// ---------------------------------------------------------------------------

// IDs of every record this seeder can create
const seedIds = () => ({
    users: [ADMIN, ...CUSTOMERS].map((person) => fixedId(`user:${person.key}`)),
    items: PRODUCTS.map((product) => fixedId(`item:${product.key}`)),
    orders: Array.from({ length: 60 }, (_, n) => fixedId(`order:${n}`))
})

const removeSeedData = async () => {
    const ids = seedIds()
    const [orders, items, carts, users] = await Promise.all([
        Order.deleteMany({ _id: { $in: ids.orders } }),
        Item.deleteMany({ _id: { $in: ids.items } }),
        Cart.deleteMany({ user: { $in: ids.users } }),
        User.deleteMany({ _id: { $in: ids.users } })
    ])

    console.log(
        `Removed demo data: ${users.deletedCount} users, ${items.deletedCount} products, ` +
        `${orders.deletedCount} orders, ${carts.deletedCount} carts.`
    )
}

const insertSeedData = async () => {
    const users = await buildUsers()
    const customers = users.filter((user) => user.role === 'User')
    const items = buildItems()
    const orders = buildOrders(customers, items)
    addReviews(items, orders)

    // Stop early with a clear message if a demo email/username is already taken
    const clash = await User.findOne({
        _id: { $nin: users.map((user) => user._id) },
        $or: [
            { email: { $in: users.map((user) => user.email) } },
            { username: { $in: users.map((user) => user.username) } }
        ]
    })
    if (clash) {
        throw new Error(
            `A non-demo account already uses "${clash.email}" or username "${clash.username}". ` +
            'Rename or remove it, then run the seeder again.'
        )
    }

    await User.insertMany(users)
    await Item.insertMany(items)
    await Order.insertMany(orders)

    const reviewCount = items.reduce((sum, item) => sum + item.reviews.length, 0)
    const statusCount = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
    }, {})

    console.log(`Added ${users.length} users, ${items.length} products, ${orders.length} orders, ${reviewCount} reviews.`)
    console.log('Orders by status:', statusCount)
    console.log('')
    console.log('Demo logins:')
    console.log(`  Admin:     admin@${EMAIL_DOMAIN}  /  ${ADMIN_PASSWORD}`)
    console.log(`  Customers: juan@${EMAIL_DOMAIN} (also maria, pedro, ana, carlo, bea, miguel, liza)  /  ${CUSTOMER_PASSWORD}`)
}

const main = async () => {
    const args = process.argv.slice(2)
    const reset = args.includes('--reset')
    const removeOnly = args.includes('--remove')

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set. Add it to backend/.env first.')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log(`Connected to MongoDB (database: ${mongoose.connection.name}).`)

    try {
        if (removeOnly) {
            await removeSeedData()
            return
        }

        if (reset) {
            await removeSeedData()
        } else if (await User.exists({ _id: fixedId('user:admin') })) {
            console.log('Demo data already exists. Nothing was added.')
            console.log('Use "npm run seed:reset" to remove it and create it again.')
            return
        }

        await insertSeedData()
    } finally {
        await mongoose.disconnect()
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Seeding failed:', error.message)
        process.exit(1)
    })
