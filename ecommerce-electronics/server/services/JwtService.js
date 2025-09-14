const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const { message } = require('antd');
dotenv.config()

const genneralAccessToken = async (payload) => {
    console.log('payload', payload)
    const access_token = jwt.sign({
        ...payload
    }, process.env.ACCESS_TOKEN, { expiresIn: '1s' })
    return access_token
}
const genneralRefreshToken = async (payload) => {
    console.log('payload', payload)
    const refresh_token_token = jwt.sign({
        ...payload
    }, process.env.REFRESH_TOKEN, { expiresIn: '24h' })
    return refresh_token_token
}
const refreshTokenJwtService = (token) => {
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    resolve({
                        status: 'ERR',
                        message: 'The authemtication'
                    })
                }
                const access_token = await genneralAccessToken({
                    id: user?.id,
                    isAdmin: user?.isAdmin
                })
                resolve({
                    status: 'Ok',
                    message: 'User delete successfully!',
                    access_token
                })
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    genneralAccessToken,
    genneralRefreshToken,
    refreshTokenJwtService
}