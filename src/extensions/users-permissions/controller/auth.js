// "use strict";
// const { factories } = require("@strapi/strapi");

// module.exports = factories.createCoreController(
//   "plugin::users-permissions.auth",
//   ({ strapi }) => ({
//     async register(ctx) {
//       const { role: roleType, ...restBody } = ctx.request.body;

//       // Mặc định là "authenticated"
//       let role = await strapi.db
//         .query("plugin::users-permissions.role")
//         .findOne({
//           where: { type: "authenticated" },
//         });

//       // Nếu có gửi role custom (vd: AdminStaff, Customer)
//       if (roleType) {
//         const customRole = await strapi.db
//           .query("plugin::users-permissions.role")
//           .findOne({
//             where: { type: roleType.toLowerCase() }, // 👈 đảm bảo đúng lowercase
//           });
//         if (customRole) {
//           role = customRole;
//         }
//       }

//       // Gán ID role vào body
//       ctx.request.body = {
//         ...restBody,
//         role: role.id,
//       };

//       // Gọi controller gốc
//       return await strapi
//         .plugin("users-permissions")
//         .controllers.auth.register(ctx);
//     },
//   })
// );

"use strict";
const { sanitize } = require("@strapi/utils");

module.exports = {
  async register(ctx) {
    const { email, username, password } = ctx.request.body;

    const role = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { name: "adminstaff" } });

    const newUser = await strapi
      .plugin("users-permissions")
      .service("user")
      .add({
        email,
        username,
        password,
        confirmed: true,
        blocked: false,
        role: role.id,
      });

    return await sanitize.contentAPI.output(
      newUser,
      strapi.getModel("plugin::users-permissions.user")
    );
  },
};
