const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const authMiddleWare = (req, res, next) => {
    const authHeader = req.headers.token
    if (!authHeader) {
        return res.status(401).json({
            message: 'No token provided',
            status: 'ERROR'
        })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) {
            return res.status(401).json({
                message: 'Invalid or expired token',
                status: 'ERROR'
            })
        }
        if (user?.isAdmin) {
            next()
        } else {
            return res.status(403).json({
                message: 'Forbidden: Admin only',
                status: 'ERROR'
            })
        }
    })
}

const authUserMiddleWare = (req, res, next) => {
    const authHeader = req.headers.token
    if (!authHeader) {
        return res.status(401).json({
            message: 'No token provided',
            status: 'ERROR'
        })
    }

    const token = authHeader.split(' ')[1]
    const userID = req.params.id
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) {
            return res.status(401).json({
                message: 'Invalid or expired token',
                status: 'ERROR'
            })
        }
        if (user?.isAdmin || user?.id === userID) {
            next()
        } else {
            return res.status(403).json({
                message: 'Forbidden: Not allowed',
                status: 'ERROR'
            })
        }
    })
}

module.exports = {
    authMiddleWare,
    authUserMiddleWare
}
