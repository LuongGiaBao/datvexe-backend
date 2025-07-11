'use strict';

/**
 * pickup-point service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pickup-point.pickup-point');
