const { message } = require("antd")
const User = require("../models/UserModel")
const bcrypt = require("bcrypt")
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService")

const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { name, email, password, confirmPassword, phone, address } = newUser

        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The email is already',
                })
            }
            const hash = bcrypt.hashSync(password, 10)
            const createdUser = await User.create({
                name,
                email,
                password: hash,
                phone,
                address
            })
            if (createdUser) {
                resolve({
                    status: 'Ok',
                    message: 'User created successfully!',
                    data: createdUser
                })
            }

        } catch (e) {
            reject(e)
        }
    })
}

const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = userLogin

        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser == null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined',
                })
            }
            const comparePassword = bcrypt.compareSync(password, checkUser.password)


            if (!comparePassword) {
                resolve({
                    status: 'ERR',
                    message: 'The password or user is incorrect'
                })
            }
            const access_token = await genneralAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })
            const refresh_token = await genneralRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })
            resolve({
                status: 'Ok',
                message: 'User created successfully!',
                access_token,
                refresh_token
            })


        } catch (e) {
            reject(e)
        }
    })
}

const updateUser = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            })
            if (checkUser == null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined',
                })
            }
            const updateUser = await User.findByIdAndUpdate(id, data, { new: true })
            console.log('updateUser', updateUser)
            resolve({
                status: 'Ok',
                message: 'User created successfully!',
                data: updateUser
            })


        } catch (e) {
            reject(e)
        }
    })
}
const deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            })
            if (checkUser == null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined',
                })
            }
            await User.findByIdAndDelete(id)
            resolve({
                status: 'Ok',
                message: 'User delete successfully!',

            })


        } catch (e) {
            reject(e)
        }
    })
}
const deleteManyUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            await User.deleteMany({ _id: id })
            resolve({
                status: 'Ok',
                message: 'User delete successfully!',
            })
        } catch (e) {
            reject(e)
        }
    })
}
const getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUser = await User.find()
            resolve({
                status: 'Ok',
                message: 'Successfully!',
                data: allUser
            })


        } catch (e) {
            reject(e)
        }
    })
}
const getDetailsUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({
                _id: id
            })
            if (user == null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined',
                })
            }
            resolve({
                status: 'Ok',
                message: 'Get user successfully!',
                data: user
            })


        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    deleteManyUser
}