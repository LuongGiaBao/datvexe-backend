'use strict';

/**
 * employee-sale service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::employee-sale.employee-sale');
