import dotenv from 'dotenv'
dotenv.config()

export default {
    NODE_ENV : process.env.NODE_ENV,
    port : process.env.PORT,
    db_url: process.env.DATABASE_URL,
    jwt_access_secret : process.env.JWT_ACCESS_SECRET,
    jwt_access_expires: process.env.JWT_ACCESS_EXPIRES_IN,
    stripe_secret: process.env.STRIPE_SECRET_KEY,
    AAMARPAY_STORE_ID: process.env.AAMARPAY_STORE_ID,
    AAMARPAY_SIGNATURE_KEY: process.env.AAMARPAY_SIGNATURE_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL,
}