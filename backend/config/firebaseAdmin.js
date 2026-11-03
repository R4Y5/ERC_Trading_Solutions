const fs = require('fs')
const path = require('path')
const admin = require('firebase-admin')

// Firebase Admin is only used to verify Google sign-in ID tokens.
//
// Configure ONE of these in backend/.env:
//   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
//   FIREBASE_PROJECT_ID=your-project-id
//
// Verifying ID tokens only needs the project ID; the service account
// file is supported too if you already downloaded one.
// Never commit the service account file.

let app = null

const getFirebaseAdmin = () => {
    if (app) return app

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    const projectId = process.env.FIREBASE_PROJECT_ID

    if (serviceAccountPath) {
        const resolved = path.resolve(__dirname, '..', serviceAccountPath)

        if (!fs.existsSync(resolved)) {
            throw new Error(
                `Firebase service account file not found at ${resolved}`
            )
        }

        const serviceAccount = JSON.parse(fs.readFileSync(resolved, 'utf8'))

        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        })
    } else if (projectId) {
        app = admin.initializeApp({ projectId })
    } else {
        throw new Error(
            'Google sign-in is not configured. Set FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_PATH in backend/.env'
        )
    }

    return app
}

const verifyFirebaseIdToken = async (idToken) =>
    getFirebaseAdmin().auth().verifyIdToken(idToken)

module.exports = {
    verifyFirebaseIdToken
}
