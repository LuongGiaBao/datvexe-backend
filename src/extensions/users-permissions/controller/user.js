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