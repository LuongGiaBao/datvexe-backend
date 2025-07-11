'use strict';

/**
 * ticket-price service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::ticket-price.ticket-price');
