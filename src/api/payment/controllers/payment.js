// 'use strict';

// /**
//  * payment controller
//  */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::payment.payment');

("use strict");

const axios = require("axios");
const CryptoJS = require("crypto-js");
const moment = require("moment");
const pendingBookings = new Map();
const paymentStatusMap = new Map();

const config = {
  app_id: "554",
  key1: "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn",
  key2: "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

module.exports = {
  async create(ctx) {
    const { amount, userId, description, bookingDetails } = ctx.request.body;
    if (!amount || !userId || !description) {
      return ctx.badRequest("Missing required fields");
    }

    const transID = Math.floor(Math.random() * 1000000);
    const appTransID = `${moment().format("YYMMDD")}_${transID}`;

    pendingBookings.set(appTransID, bookingDetails);
    paymentStatusMap.set(appTransID, "pending");
    const isDev = process.env.NODE_ENV === "development";
    const embed_data = {
      redirecturl: isDev
        ? "http://localhost:3000/booking-success"
        : "https://datvexe-frontend.vercel.app/booking-success",
      appTransID,
    };

    const order = {
      app_id: config.app_id,
      app_trans_id: appTransID,
      app_user: userId,
      app_time: Date.now(),
      item: JSON.stringify([{}]),
      embed_data: JSON.stringify(embed_data),
      amount,
      description,
      bank_code: "zalopayapp",
    };

    const data =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;

    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const result = await axios.post(config.endpoint, null, { params: order });

    if (result.data.return_code === 1) {
      //   ctx.send({ ...result.data, appTransID, status: "success" });
      ctx.send({
        order_url: result.data.order_url,
        return_code: result.data.return_code,
        return_message: result.data.return_message,
        appTransID: appTransID,
        status: "success",
      });
    } else {
      ctx.throw(500, result.data.return_message);
    }
  },

  async status(ctx) {
    const { appTransID } = ctx.params;
    const data = `${config.app_id}|${appTransID}|${config.key1}`;
    const mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const response = await axios.post(config.endpoint, null, {
      params: {
        app_id: config.app_id,
        app_trans_id: appTransID,
        mac,
      },
    });

    const status = response.data.return_code === 1 ? "completed" : "pending";
    paymentStatusMap.set(appTransID, status);

    const bookingDetails = pendingBookings.get(appTransID);
    if (bookingDetails) {
      bookingDetails.paymentStatus = status;
      ctx.send({ status, bookingDetails });
    } else {
      ctx.send({
        status: "not_found",
        message: "Không tìm thấy thông tin đặt vé",
      });
    }
  },

  async callback(ctx) {
    const { data: dataStr, mac: reqMac } = ctx.request.body;
    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    if (mac !== reqMac) {
      return ctx.send({ return_code: -1, return_message: "mac not equal" });
    }

    const data = JSON.parse(dataStr);
    const app_trans_id = data.app_trans_id;
    paymentStatusMap.set(app_trans_id, "completed");

    const bookingDetails = pendingBookings.get(app_trans_id);
    if (bookingDetails) {
      bookingDetails.paymentStatus = "completed";
      pendingBookings.set(app_trans_id, bookingDetails);
    }

    ctx.send({ return_code: 1, return_message: "success" });
  },

  async tickets(ctx) {
    const { userId } = ctx.params;
    const tickets = Array.from(pendingBookings.entries())
      .filter(([_, b]) => b.customerInfo.email === userId)
      .map(([id, b]) => ({
        id,
        ...b,
        paymentStatus: paymentStatusMap.get(id) || "pending",
      }));

    ctx.send(tickets);
  },
};
