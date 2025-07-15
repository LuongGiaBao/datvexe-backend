module.exports = {
  myJob: {
    task: async ({ strapi }) => {
      const now = new Date();
      const currentTime = now.toISOString();
      try {
        // Kiểm tra mô hình
        const tripModel = strapi.getModel("api::trip.trip");
        if (!tripModel) {
          throw new Error("Không tìm thấy mô hình chuyến đi");
        }

        // Lấy tất cả các chuyến xe
        const trips = await strapi.entityService.findMany("api::trip.trip");

        for (const trip of trips) {
          // Truy cập trực tiếp vào các thuộc tính của trip
          const { id, departureTime, arrivalTime, status } = trip;

          // Kiểm tra các thuộc tính cần thiết
          if (!departureTime || !arrivalTime || !status) {
            continue; // Bỏ qua nếu thiếu thuộc tính
          }

          // Kiểm tra trạng thái
          if (status === "HỦY") continue;

          // Chuyển đổi thời gian
          const tripDepartureTime = new Date(departureTime).toISOString();
          const tripArrivalTime = new Date(arrivalTime).toISOString();

          // Cập nhật trạng thái dựa trên thời gian
          let newStatus;
          if (tripArrivalTime < currentTime) {
            newStatus = "HẾT HẠN";
          } else if (tripDepartureTime < currentTime) {
            newStatus = "HẾT HẠN";
          } else if (tripDepartureTime > currentTime) {
            newStatus = "HOẠT ĐỘNG";
          } else if (tripDepartureTime === currentTime) {
            newStatus = "KHÔNG HOẠT ĐỘNG";
          }

          // Cập nhật trạng thái chỉ khi cần thiết
          if (status !== newStatus) {
            await strapi.entityService.update("api::trip.trip", id, {
              data: { status: newStatus },
            });
            console.log(
              `Đã cập nhật trạng thái chuyến đi ID ${id} thành ${newStatus}`
            );
          }
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái chuyến đi:", error);
      }
    },
    options: {
      rule: "* * * * *", // Chạy mỗi phút
    },
  },
  myJobTicket: {
    task: async ({ strapi }) => {
      try {
        const ticketModel = strapi.getModel("api::ticket.ticket");
        if (!ticketModel) {
          throw new Error("Không tìm thấy mô hình vé");
        }

        const tickets = await strapi.entityService.findMany(
          "api::ticket.ticket",
          {
            populate: ["ticketPrices"],
          }
        );

        const now = new Date();
        const nowVietnam = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Cộng 7 giờ cho giờ VN

        for (const ticket of tickets) {
          const { id, status, createdAt } = ticket;

          if (!createdAt || !status) {
            console.warn(`Vé với ID ${id} thiếu thuộc tính cần thiết:`, ticket);
            continue;
          }

          if (status === "Đã đặt trước") {
            const ticketCreatedAt = new Date(createdAt);
            const ticketCreatedAtVietnam = new Date(
              ticketCreatedAt.getTime() + 7 * 60 * 60 * 1000
            ); // Cộng 7 giờ cho giờ VN

            const thirtyMinutesLater = new Date(
              ticketCreatedAtVietnam.getTime() + 30 * 60000
            );

            // So sánh trực tiếp đối tượng Date
            if (nowVietnam > thirtyMinutesLater) {
              console.log("Thời gian hiện tại:", nowVietnam);
              console.log(
                "Thời gian 30 phút sau khi tạo vé:",
                thirtyMinutesLater
              );

              // Cập nhật trạng thái vé
              await strapi.entityService.update("api::ticket.ticket", id, {
                data: { status: "Có sẵn" },
              });
              console.log(`Đã cập nhật trạng thái vé ID ${id} thành "Có sẵn"`);
            }
          }
        }

       
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái vé:", error);
      }
    },
    options: {
      rule: "* * * * *", // Chạy mỗi phút
    },
  },
};
