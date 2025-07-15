// const createUser  = async (ctx) => {
//     const { username, email, password } = ctx.request.body;

//     // Tạo người dùng mới mà không bật confirmed
//     const user = await strapi.plugins['users-permissions'].services.user.add({
//       username,
//       email,
//       password,
//       confirmed: false, // Đảm bảo confirmed là false
//     });

//     // Gửi email xác thực (đoạn mã gửi email xác thực ở đây)

//     return user;
//   };

module.exports = {
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("No authenticated user found.");
    }

    try {
      const fullUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        user.id,
        {
          populate: {
            role: {
              fields: ["name", "type", "description"],
            },
          },
        }
      );

      return fullUser;
    } catch (error) {
      strapi.log.error("❌ Lỗi khi gọi /users/me: ", error);
      ctx.internalServerError("Lỗi khi truy xuất thông tin người dùng.");
    }
  },
};
