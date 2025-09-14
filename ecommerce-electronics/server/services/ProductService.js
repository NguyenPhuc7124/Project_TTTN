const { message } = require("antd")
const Product = require("../models/ProductModel")
const bcrypt = require("bcrypt")

const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const { name, image, type, price, countInStock, rating, description, discount } = newProduct

        try {
            const checkProduct = await Product.findOne({
                name: name
            })
            if (checkProduct !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The name of product is already',
                })
            }
            const newProduct = await Product.create({
                name,
                image,
                type,
                price,
                countInStock: Number(countInStock),
                rating,
                description,
                discount: Number(discount)
            })
            if (newProduct) {
                resolve({
                    status: 'Ok',
                    message: 'User created successfully!',
                    data: newProduct
                })
            }

        } catch (e) {
            reject(e)
        }
    })
}

const updateProduct = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if (checkProduct == null) {
                return resolve({
                    status: 'ERR',
                    message: 'The product is not defined',
                })
            }
            const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true })
            resolve({
                status: 'Ok',
                message: 'Product created successfully!',
                data: updatedProduct
            })


        } catch (e) {
            reject(e)
        }
    })
}

const getDetailsProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findOne({
                _id: id
            })
            if (product == null) {
                return resolve({
                    status: 'ERR',
                    message: 'The product is not defined',
                })
            }
            resolve({
                status: 'Ok',
                message: 'product delete successfully!',
                data: product
            })


        } catch (e) {
            reject(e)
        }
    })
}
const getAllProduct = (limit, page, sort, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            let allProduct = []
            const totalProduct = await Product.countDocuments()

            // Nếu có filter
            if (filter) {
                const [field, value] = filter
                const allObjectFilter = await Product.find({
                    [field]: { $regex: value, $options: 'i' }
                })
                return resolve({
                    status: 'OK',
                    message: 'Successfully!',
                    data: allObjectFilter,
                    total: totalProduct,
                    pageCurrent: Number(page + 1),
                    totalPage: Math.ceil(totalProduct / limit)
                })
            }

            // Nếu có sort
            if (sort) {
                const [field, order] = sort
                const objectSort = {}
                objectSort[field] = order   // ví dụ: { price: 'asc' }

                const allProductSort = await Product.find()
                    .limit(limit)
                    .skip(page * limit)
                    .sort(objectSort)

                return resolve({
                    status: 'OK',
                    message: 'Successfully!',
                    data: allProductSort,
                    total: totalProduct,
                    pageCurrent: Number(page + 1),
                    totalPage: Math.ceil(totalProduct / limit)
                })
            }
            if (!limit) {
                allProduct = await Product.find()
            } else {
                allProduct = await Product.find().limit(limit).skip(page * limit)
            }
            return resolve({
                status: 'OK',
                message: 'Successfully!',
                data: allProduct,
                total: totalProduct,
                pageCurrent: Number(page + 1),
                totalPage: Math.ceil(totalProduct / limit)
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if (checkProduct == null) {
                return resolve({
                    status: 'ERR',
                    message: 'The product is not defined',
                })
            }
            await Product.findByIdAndDelete(id)
            resolve({
                status: 'Ok',
                message: 'Product delete successfully!',

            })


        } catch (e) {
            reject(e)
        }
    })
}
const deleteManyProduct = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {

            await Product.deleteMany({ _id: ids })
            resolve({
                status: 'Ok',
                message: 'Product delete successfully!',

            })
        } catch (e) {
            reject(e)
        }
    })
}
const getAllType = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allType = await Product.distinct('type')
            return resolve({
                status: 'OK',
                message: 'Successfully!',
                data: allType,
            })

        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createProduct,
    updateProduct,
    getDetailsProduct,
    getAllProduct,
    deleteProduct,
    deleteManyProduct,
    getAllType
}