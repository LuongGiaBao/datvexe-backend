// 'use strict';

// /**
//  * payment router
//  */

// const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::payment.payment');

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/payment",
      handler: "payment.create",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/payment/status/:appTransID",
      handler: "payment.status",
      config: { auth: false },
    },
    {
      method: "POST",
      path: "/payment/callback",
      handler: "payment.callback",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/tickets/:userId",
      handler: "payment.tickets",
      config: { auth: false },
    },
  ],
};
