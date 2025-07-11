'use strict';

/**
 * customer-sale service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::customer-sale.customer-sale');
