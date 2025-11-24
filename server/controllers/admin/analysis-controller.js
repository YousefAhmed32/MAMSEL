const mongoose = require("mongoose");
const Products = require('../../models/Product');
const Orders = require('../../models/Order');
const User = require('../../models/User');
const moment = require("moment");

const getAdminDashboardSummary = async (req, res) => {
  try {
    const { timeframe = "monthly" } = req.query;

    let dateFormat = "%Y-%m-%d";
    let startDate;
    let rangeCount = 30;
    const now = new Date();

    if (timeframe === "monthly") {
      startDate = moment().subtract(29, "days").startOf("day").toDate();
      dateFormat = "%Y-%m-%d";
      rangeCount = 30;
    } else if (timeframe === "weekly") {
      startDate = moment().subtract(6, "days").startOf("day").toDate();
      dateFormat = "%Y-%m-%d";
      rangeCount = 7;
    } else if (timeframe === "daily") {
      startDate = moment().startOf("day").toDate();
      dateFormat = "%H:00";
      rangeCount = 24;
    } else if (timeframe === "hour") {
      startDate = moment().subtract(59, "minutes").toDate();
      dateFormat = "%H:%M";
      rangeCount = 60;
    } else if (timeframe === "yearly") {
      startDate = moment().subtract(11, "months").startOf("month").toDate();
      dateFormat = "%Y-%m";
      rangeCount = 12;
    } else if (timeframe === "all") {
      startDate = new Date("2025-01-01");
      dateFormat = "%Y-%m";
      rangeCount = moment().diff(startDate, "months") + 1;
    }

    const userDateFilter = { createdAt: { $gte: startDate, $lte: now } };
    const orderDateFilter = { 
      $or: [
        { orderDate: { $gte: startDate, $lte: now } },
        { createdAt: { $gte: startDate, $lte: now } }
      ]
    };
    const productDateFilter = { createdAt: { $gte: startDate, $lte: now } };

    // Get totals without date filter (for overall counts)
    const [totalUsersAll, totalOrdersAll, totalProductsAll] = await Promise.all([
      User.countDocuments({}),
      Orders.countDocuments({}),
      Products.countDocuments({}),
    ]);

    // Get totals with date filter (for timeframe-specific counts)
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      User.countDocuments(userDateFilter),
      Orders.countDocuments(orderDateFilter),
      Products.countDocuments(productDateFilter),
    ]);

    const timezone = "+03:00"; // adjust if needed

    const [revenueAgg, usersAgg, ordersAgg, productsAgg] = await Promise.all([
      Orders.aggregate([
        { 
          $match: { 
            $and: [
              {
                $or: [
                  { "payment.status": "approved" },
                  { paymentStatus: "paid" },
                  { paymentStatus: "approved" },
                  // Include delivered orders (especially COD orders that are delivered)
                  { orderStatus: "delivered" }
                ]
              },
              orderDateFilter
            ]
          } 
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: { $ifNull: ["$orderDate", "$createdAt"] },
                timezone
              },
            },
            revenue: { 
              $sum: { 
                $ifNull: [
                  "$total", 
                  "$totalAmount", 
                  "$totalAfterDiscount",
                  0
                ] 
              } 
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: userDateFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$createdAt",
                timezone
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Orders.aggregate([
        { 
          $match: orderDateFilter
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: { $ifNull: ["$orderDate", "$createdAt"] },
                timezone
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Products.aggregate([
        { $match: productDateFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$createdAt",
                timezone
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const fullChartData = [];
    
    // Create maps for faster lookup
    const revenueMap = new Map();
    revenueAgg.forEach(item => {
      if (item._id) {
        const key = String(item._id).trim();
        revenueMap.set(key, Number(item.revenue) || 0);
        revenueMap.set(String(item._id), Number(item.revenue) || 0);
      }
    });
    
    const usersMap = new Map();
    usersAgg.forEach(item => {
      if (item._id) {
        const key = String(item._id).trim();
        usersMap.set(key, Number(item.count) || 0);
        usersMap.set(String(item._id), Number(item.count) || 0);
      }
    });
    
    const ordersMap = new Map();
    ordersAgg.forEach(item => {
      if (item._id) {
        const key = String(item._id).trim();
        ordersMap.set(key, Number(item.count) || 0);
        ordersMap.set(String(item._id), Number(item.count) || 0);
      }
    });
    
    const productsMap = new Map();
    productsAgg.forEach(item => {
      if (item._id) {
        const key = String(item._id).trim();
        productsMap.set(key, Number(item.count) || 0);
        productsMap.set(String(item._id), Number(item.count) || 0);
      }
    });
    
    // Generate chart data for the full range
    for (let i = 0; i < rangeCount; i++) {
      let current;
      if (timeframe === "monthly" || timeframe === "weekly") {
        current = moment(startDate).add(i, "days");
      } else if (timeframe === "daily") {
        current = moment(startDate).add(i, "hours");
      } else if (timeframe === "hour") {
        current = moment(startDate).add(i, "minutes");
      } else if (timeframe === "yearly" || timeframe === "all") {
        current = moment(startDate).add(i, "months");
      } else {
        current = moment(startDate).add(i, "days");
      }

      // Format label to match MongoDB dateToString format exactly
      let label;
      if (timeframe === "hour") {
        label = current.format("HH:mm");
      } else if (timeframe === "daily") {
        label = current.format("HH:00");
      } else if (timeframe === "yearly" || timeframe === "all") {
        label = current.format("YYYY-MM");
      } else {
        label = current.format("YYYY-MM-DD");
      }

      // Try to find matching data - check all possible variations
      let revenueValue = 0;
      
      // Try direct match first
      revenueValue = revenueMap.get(label) || revenueMap.get(label.trim()) || 0;
      
      // If still no match, try date-based comparison
      if (revenueValue === 0 && revenueAgg.length > 0) {
        for (const rev of revenueAgg) {
          if (!rev._id || !rev.revenue) continue;
          
          const revKey = String(rev._id).trim();
          
          // Try exact string match first
          if (revKey === label || revKey === label.trim()) {
            revenueValue = Number(rev.revenue) || 0;
            break;
          }
          
          // Try date comparison
          try {
            const revDate = moment(revKey, [
              "YYYY-MM-DD",
              "YYYY-MM",
              "HH:mm",
              "HH:00"
            ], true);
            
            if (revDate.isValid() && current) {
              let isMatch = false;
              
              if (timeframe === "hour") {
                isMatch = revDate.isSame(current, "minute");
              } else if (timeframe === "daily") {
                isMatch = revDate.isSame(current, "hour");
              } else if (timeframe === "yearly" || timeframe === "all") {
                isMatch = revDate.isSame(current, "month");
              } else {
                isMatch = revDate.isSame(current, "day");
              }
              
              if (isMatch) {
                revenueValue = Number(rev.revenue) || 0;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
      }

      fullChartData.push({
        label,
        revenue: Number(revenueValue) || 0,
        users: Number(usersMap.get(label) || usersMap.get(label.trim()) || 0),
        orders: Number(ordersMap.get(label) || ordersMap.get(label.trim()) || 0),
        products: Number(productsMap.get(label) || productsMap.get(label.trim()) || 0),
      });
    }

    // Debug logging
    console.log('\n=== Revenue Analysis Debug ===');
    console.log('Timeframe:', timeframe);
    console.log('Date Format:', dateFormat);
    console.log('Revenue Aggregation Count:', revenueAgg.length);
    if (revenueAgg.length > 0) {
      console.log('First 3 Revenue Agg Items:', revenueAgg.slice(0, 3).map(r => ({ 
        _id: r._id, 
        revenue: r.revenue 
      })));
    } else {
      console.log('⚠️ No revenue aggregation results found!');
    }
    
    const totalChartRevenue = fullChartData.reduce((sum, d) => sum + (Number(d.revenue) || 0), 0);
    const totalAggRevenue = revenueAgg.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0);
    
    console.log('Chart Data Generated:', fullChartData.length, 'items');
    const nonZeroRevenue = fullChartData.filter(d => d.revenue > 0);
    console.log('Non-zero revenue entries:', nonZeroRevenue.length);
    if (nonZeroRevenue.length > 0) {
      console.log('Sample non-zero entries:', nonZeroRevenue.slice(0, 3));
    } else {
      console.log('⚠️ No revenue data in chart!');
      console.log('Sample chart labels:', fullChartData.slice(0, 5).map(d => d.label));
      console.log('Sample revenue agg keys:', revenueAgg.slice(0, 5).map(r => r._id));
    }
    console.log('Total Revenue from Aggregation:', totalAggRevenue);
    console.log('Total Revenue in Chart Data:', totalChartRevenue);
    console.log('================================\n');

    const totalRevenue = totalAggRevenue;

    // Calculate revenue by payment status WITH date filter for timeframe-specific totals
    const [pendingRevenueResult, rejectedRevenueResult, approvedRevenueResult] = await Promise.all([
      // Pending/Awaiting Approval Revenue (filtered by timeframe)
      Orders.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { "payment.status": "pending" },
                  { "payment.status": "awaiting_admin_approval" },
                  { paymentStatus: "pending" },
                  { orderStatus: "pending" }
                ]
              },
              // Exclude delivered orders from pending (they should be approved)
              { orderStatus: { $ne: "delivered" } },
              // Add date filter for timeframe
              orderDateFilter
            ]
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$totalAmount", "$total", 0] } }
          }
        }
      ]),
      // Rejected Revenue (filtered by timeframe)
      Orders.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { "payment.status": "rejected" },
                  { orderStatus: "rejected" },
                  { orderStatus: "cancelled" }
                ]
              },
              // Add date filter for timeframe
              orderDateFilter
            ]
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$totalAmount", "$total", 0] } }
          }
        }
      ]),
      // Approved Revenue (filtered by timeframe) - including delivered orders
      Orders.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { "payment.status": "approved" },
                  { paymentStatus: "paid" },
                  { paymentStatus: "approved" },
                  { orderStatus: "delivered" }, // Include delivered orders as approved revenue
                  { orderStatus: "completed" }
                ]
              },
              // Add date filter for timeframe
              orderDateFilter
            ]
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$totalAmount", "$total", 0] } }
          }
        }
      ])
    ]);

    const pendingRevenue = pendingRevenueResult[0]?.total || 0;
    const rejectedRevenue = rejectedRevenueResult[0]?.total || 0;
    const approvedRevenue = approvedRevenueResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        // Use timeframe-specific data instead of overall counts
        totalUsers: totalUsers, // Timeframe-specific count
        totalCustomers: totalUsers, // Alias for totalUsers (same value)
        totalOrders: totalOrders, // Timeframe-specific count
        totalProducts: totalProducts, // Timeframe-specific count
        totalRevenue: approvedRevenue, // Timeframe-specific approved revenue
        pendingRevenue: pendingRevenue, // Timeframe-specific pending revenue
        rejectedRevenue: rejectedRevenue, // Timeframe-specific rejected revenue
        // Overall totals (for reference if needed)
        overallTotals: {
          totalUsers: totalUsersAll,
          totalOrders: totalOrdersAll,
          totalProducts: totalProductsAll,
        },
        // Timeframe-specific data for growth calculations
        timeframeData: {
          totalUsers,
          totalCustomers: totalUsers, // Alias for totalUsers
          totalOrders,
          totalProducts,
          totalRevenue,
        },
        chartData: fullChartData,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error is here",
    });
  }
};

module.exports = { getAdminDashboardSummary };
