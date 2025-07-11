'use strict';

/**
 * seat-status service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::seat-status.seat-status');
