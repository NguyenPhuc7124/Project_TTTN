const { message } = require("antd")
const User = require("../models/UserModel")
const bcrypt = require("bcrypt")
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService")
const Order = require("../models/OrderProduct")
const Product = require("../models/ProductModel")

const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems, paymentMethod, itemsPrice, totalPrice, fullName, address, city, phone, user, shippingPrice, isPaid, paidAt } = newOrder
        try {
            const promise = orderItems.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        countInStock: { $gte: order.amount }
                    },
                    {
                        $inc: {
                            countInStock: -order.amount,
                            selled: +order.amount
                        }
                    },
                    { new: true }
                )
                if (productData) {
                    const newOrder = await Order.create({
                        orderItems,
                        shippingAddress: { fullName, address, city, phone },
                        paymentMethod,
                        itemsPrice,
                        shippingPrice,
                        totalPrice,
                        user,
                        isPaid,
                        paidAt
                    })
                    if (newOrder) {
                        return {
                            status: 'Ok',
                            message: 'Order created successfully!'
                        }
                    }
                } else {
                    return {
                        status: 'ERR',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            const results = await Promise.all(promise)
            const newData = results && results.filter((item) => item.id)
            if (newData.length) {
                resolve({
                    status: 'ERR',
                    message: `Sản phẩm với id ${newData.map(item => item.id).join(',')} không đủ hàng`
                })
            } else {
                resolve({
                    status: 'Ok',
                    message: 'successfully'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

const getAllOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const orders = await Order.find({
                user: id
            })
            if (!orders || orders.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: 'No orders found for this user',
                })
            }
            resolve({
                status: 'Ok',
                message: 'Successfully retrieved orders!',
                data: orders
            })
        } catch (e) {
            reject(e)
        }
    })
}
const getDetailsOrder = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const orders = await Order.findById(id)
            if (!orders) {
                return resolve({
                    status: 'ERR',
                    message: 'No orders found for this user',
                })
            }

            resolve({
                status: 'Ok',
                message: 'Successfully retrieved orders!',
                data: orders
            })
        } catch (e) {
            reject(e)
        }
    })
}
const cancelDetailsOrder = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const promise = data.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        selled: { $gte: order.amount }
                    },
                    {
                        $inc: {
                            countInStock: +order.amount,
                            selled: -order.amount
                        }
                    },
                    { new: true }
                )
                if (productData) {
                    const orders = await Order.findByIdAndDelete(id)
                    if (!orders) {
                        return resolve({
                            status: 'ERR',
                            message: 'No orders found for this user',
                        })
                    }
                } else {
                    return {
                        status: 'ERR',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            const results = await Promise.all(promise)
            const newData = results && results.filter((item) => item)
            if (newData.length) {
                resolve({
                    status: 'ERR',
                    message: `Sản phẩm với id ${newData.map(item => item.id).join(',')} không tồn tại`
                })
            } else {
                resolve({
                    status: 'Ok',
                    message: 'successfully',
                    data: orders

                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
const getAllOrder = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allOrder = await Order.find()
            resolve({
                status: 'Ok',
                message: 'Successfully!',
                data: allOrder
            })


        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createOrder,
    getAllOrderDetails,
    getDetailsOrder,
    cancelDetailsOrder,
    getAllOrder
}