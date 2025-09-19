const Order = require('../models/OrderProduct');
const Product = require('../models/ProductModel');

const dashboardController = {
    getDashboardStats: async (req, res) => {
        try {
            const { timeRange = 'monthly' } = req.query;
            const now = new Date();
            let startDate;

            switch (timeRange) {
                case 'daily':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'weekly':
                    startDate = new Date(now.setDate(now.getDate() - 30));
                    break;
                case 'monthly':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
                default:
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            }

            // Lấy dữ liệu orders đã thanh toán
            const orders = await Order.find({
                isPaid: true,
                createdAt: { $gte: startDate }
            }).populate('orderItems.product');

            // Xử lý dữ liệu
            const processedData = processOrderData(orders, timeRange, startDate);
            const categoryData = processCategoryData(orders);

            // Lấy tổng số sản phẩm và đơn hàng
            const totalProducts = await Product.countDocuments();
            const totalOrders = await Order.countDocuments({ isPaid: true });
            const pendingOrders = await Order.countDocuments({
                isPaid: true,
                isDelivered: false
            });

            res.status(200).json({
                status: 'OK',
                data: {
                    revenueData: processedData.revenue,
                    salesData: processedData.sales,
                    labels: processedData.labels,
                    productCategories: categoryData,
                    totalRevenue: processedData.totalRevenue,
                    totalSales: processedData.totalSales,
                    totalProducts,
                    totalOrders,
                    pendingOrders,
                    timeRange
                }
            });

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Internal server error'
            });
        }
    }
};

// Hàm xử lý dữ liệu orders
function processOrderData(orders, timeRange, startDate) {
    const revenueData = [];
    const salesData = [];
    const labels = [];
    let totalRevenue = 0;
    let totalSales = 0;

    // Tạo cấu trúc dữ liệu ban đầu
    const groupedData = {};
    const currentDate = new Date(startDate);
    const now = new Date();

    if (timeRange === 'monthly') {
        for (let i = 0; i < 12; i++) {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const key = `${year}-${month}`;
            groupedData[key] = { revenue: 0, sales: 0 };
            labels.push(`Tháng ${month}/${year}`);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    } else if (timeRange === 'weekly') {
        for (let i = 0; i < 4; i++) {
            const key = `week-${i + 1}`;
            groupedData[key] = { revenue: 0, sales: 0 };
            labels.push(`Tuần ${i + 1}`);
        }
    } else {
        // daily - 7 ngày
        for (let i = 0; i < 7; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            groupedData[dateStr] = { revenue: 0, sales: 0 };
            labels.push(`Ngày ${currentDate.getDate()}/${currentDate.getMonth() + 1}`);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // Điền dữ liệu từ orders
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        let key;

        if (timeRange === 'monthly') {
            const month = orderDate.getMonth() + 1;
            const year = orderDate.getFullYear();
            key = `${year}-${month}`;
        } else if (timeRange === 'weekly') {
            const weekNumber = Math.floor((orderDate - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
            key = `week-${Math.min(weekNumber, 4)}`;
        } else {
            key = orderDate.toISOString().split('T')[0];
        }

        if (groupedData[key]) {
            groupedData[key].revenue += order.totalPrice;
            groupedData[key].sales += order.orderItems.reduce((sum, item) => sum + item.amount, 0);
        }

        totalRevenue += order.totalPrice;
        totalSales += order.orderItems.reduce((sum, item) => sum + item.amount, 0);
    });

    // Chuyển đổi thành mảng
    Object.keys(groupedData).forEach(key => {
        revenueData.push(groupedData[key].revenue);
        salesData.push(groupedData[key].sales);
    });

    return {
        revenue: revenueData,
        sales: salesData,
        labels,
        totalRevenue,
        totalSales
    };
}

// Hàm xử lý dữ liệu danh mục sản phẩm
function processCategoryData(orders) {
    const categoryStats = {};

    orders.forEach(order => {
        order.orderItems.forEach(item => {
            const category = item.product?.type || 'Unknown';
            if (!categoryStats[category]) {
                categoryStats[category] = 0;
            }
            categoryStats[category] += item.amount;
        });
    });

    // Chuyển đổi thành mảng và tính phần trăm
    const total = Object.values(categoryStats).reduce((sum, value) => sum + value, 0);

    return Object.keys(categoryStats).map(category => ({
        name: category,
        value: categoryStats[category],
        percentage: total > 0 ? Math.round((categoryStats[category] / total) * 100) : 0
    }));
}

module.exports = dashboardController;