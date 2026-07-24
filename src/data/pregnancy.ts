export interface PregnancyMilestone {
  id: string;
  period: string; // e.g., "Tuần 1 - 4 (Tháng đầu tiên)", "Tuần 11 - 13 (Mốc quan trọng)"
  babyDevelopment: string;
  momChanges: string;
  checkupsAndTests: Array<{
    title: string;
    description: string;
    ultrasoundNotes?: string;
  }>;
  tips: string[];
}

export const pregnancyData: PregnancyMilestone[] = [
  {
    id: "week1_4",
    period: "Tuần 1 - 4 (Tháng đầu tiên)",
    babyDevelopment: "Phôi thai đang hình thành và cấy vào tử cung. Ống thần kinh bắt đầu phát triển.",
    momChanges: "Có thể gặp máu báo thai. Bắt đầu có dấu hiệu nghén nhẹ, trễ kinh, ngực căng tức.",
    checkupsAndTests: [
      {
        title: "Thử thai & Khám thai lần đầu",
        description: "Thử que 2 vạch hoặc xét nghiệm Beta-hCG. Đi khám để xác định thai đã vào lòng tử cung hay chưa.",
        ultrasoundNotes: "Xác định vị trí túi thai, loại trừ thai ngoài tử cung."
      }
    ],
    tips: [
      "Bắt đầu uống Axit Folic ngay (400-800mcg/ngày).",
      "Tránh tuyệt đối rượu bia, thuốc lá và các hóa chất độc hại.",
      "Không tự ý dùng bất kỳ loại thuốc nào (kể cả thuốc cảm) mà không có chỉ định của bác sĩ."
    ]
  },
  {
    id: "week5_8",
    period: "Tuần 5 - 8 (Tháng thứ 2)",
    babyDevelopment: "Tim thai bắt đầu đập. Các cơ quan quan trọng như não, tủy sống, mắt, tai, mũi đang hình thành.",
    momChanges: "Ốm nghén có thể trở nên tồi tệ hơn (buồn nôn, mệt mỏi). Đi tiểu thường xuyên hơn.",
    checkupsAndTests: [
      {
        title: "Siêu âm tim thai",
        description: "Khoảng tuần thứ 6-7, bác sĩ sẽ siêu âm để theo dõi tim thai.",
        ultrasoundNotes: "Quan sát phôi thai, túi noãn hoàng (yolk sac) và đo nhịp tim thai. Trạng thái bình thường có nhịp tim thai rõ ràng."
      }
    ],
    tips: [
      "Ăn chia thành nhiều bữa nhỏ để giảm cảm giác buồn nôn.",
      "Duy trì uống nhiều nước, ăn trái cây, sữa phù hợp."
    ]
  },
  {
    id: "week11_13",
    period: "Tuần 11 - 13 (MỘC QUAN TRỌNG NHẤT 3 THÁNG ĐẦU)",
    babyDevelopment: "Em bé đã có hình dáng hoàn chỉnh, các cơ quan tiếp tục phát triển. Bắt đầu có các phản xạ.",
    momChanges: "Ốm nghén có thể bắt đầu giảm dần. Bụng dưới hơi nhô lên một chút.",
    checkupsAndTests: [
      {
        title: "Siêu âm đo độ mờ da gáy (NT)",
        description: "Thực hiện ở tuần 11 đến 13 tuần 6 ngày để sàng lọc ban đầu nguy cơ hội chứng Down.",
        ultrasoundNotes: "Đo khoảng sáng sau gáy (NT). Khảo sát xương mũi (bất sản xương mũi), nhịp tim thai, và các dị tật lớn sớm (thai vô sọ, khe hở thành bụng)."
      },
      {
        title: "Xét nghiệm Double Test hoặc NIPT",
        description: "Sàng lọc dị tật bẩm sinh do bất thường nhiễm sắc thể. NIPT hiện cho độ chính xác rất cao (>99%) với Down, Edwards, Patau và có thể xét nghiệm ngay từ tuần thứ 9-10.",
      }
    ],
    tips: [
      "Tuyệt đối không bỏ lỡ lịch siêu âm độ mờ da gáy, vì sau 14 tuần kết quả sẽ không còn ý nghĩa.",
      "Cân nhắc lựa chọn NIPT nếu có đủ điều kiện tài chính để an tâm hơn."
    ]
  },
  {
    id: "week14_20",
    period: "Tuần 14 - 20 (Tháng thứ 4 & 5)",
    babyDevelopment: "Em bé lớn nhanh, hệ xương cứng cáp hơn. Có thể bắt đầu cảm nhận thai máy (con đạp) từ tuần 18-20.",
    momChanges: "Bước vào giai đoạn 'trăng mật' thai kỳ: nghén kết thúc phần lớn, mẹ khỏe mạnh và ăn ngon miệng hơn. Thể trọng tăng rõ.",
    checkupsAndTests: [
      {
        title: "Xét nghiệm Triple Test",
        description: "Thực hiện từ tuần 15-22 (tốt nhất tuần 16-18) nếu chưa làm NIPT/Double Test, để sàng lọc dị tật ống thần kinh.",
      },
      {
        title: "Siêu âm hình thái học (MỐC QUAN TRỌNG: Tuần 20-22)",
        description: "Siêu âm 4D/5D kiểm tra chi tiết cấu trúc giải phẫu thai nhi phát hiện dị tật.",
        ultrasoundNotes: "Khảo sát não, tim (4 buồng tim, đường ra các mạch máu lớn), cột sống, các chi, thận, dạ dày, hở hàm ếch. Kiểm tra lượng nước ối và sự phát triển bánh nhau."
      }
    ],
    tips: [
      "Bắt đầu theo dõi thai máy hàng ngày (thường dễ cảm nhận nhất từ tuần 20 trở đi).",
      "Có thể tiêm phòng uốn ván mũi 1 theo chỉ định bác sĩ."
    ]
  },
  {
    id: "week24_28",
    period: "Tuần 24 - 28 (Tháng thứ 6 & 7)",
    babyDevelopment: "Bé phản ứng mạnh với âm thanh, ánh sáng. Nhịp thức-ngủ đã rõ ràng. Phổi bắt đầu tiết surfactant tập thở.",
    momChanges: "Đau vùng lưng dưới, phù chân, có thể bị chuột rút hoặc ợ nóng. Bụng đã to đáng kể cản trở giấc ngủ.",
    checkupsAndTests: [
      {
        title: "Nghiệm pháp dung nạp Glucose (OGTT)",
        description: "Thực hiện từ tuần 24-28 để tầm soát tiểu đường thai kỳ - vấn đề rất phổ biến hiện nay.",
      },
      {
        title: "Tiêm phòng uốn ván mũi 2",
        description: "Thực hiện cách mũi 1 ít nhất 4 tuần và trước dự sinh ít nhất 3-4 tuần.",
      },
      {
        title: "Siêu âm đánh giá sự tăng trưởng",
        description: "Đo các sinh trắc học để ước tính cân nặng thai.",
        ultrasoundNotes: "Kiểm tra bé có theo đúng đường cong tăng trưởng không. Đánh giá lượng ối, vị trí nhau thai (loại trừ nhau tiền đạo)."
      }
    ],
    tips: [
      "Quản lý đường huyết bằng chế độ ăn ít đồ ngọt, chia nhỏ bữa.",
      "Kê cao chân khi ngủ, massage bắp chân giảm chuột rút."
    ]
  },
  {
    id: "week30_34",
    period: "Tuần 30 - 34 (Tháng thứ 8)",
    babyDevelopment: "Mắt bé nhắm mở tự nhiên, tích tụ mỡ dưới da để giữ ấm sau sinh. Bé thường bắt đầu quay đầu xuống (ngôi thuận).",
    momChanges: "Cảm giác nặng nề, phù chân có thể nhiều hơn. Thỉnh thoảng xuất hiện cơn gò chuyển dạ giả (Braxton Hicks).",
    checkupsAndTests: [
      {
        title: "Siêu âm hình thái học 3 (MỐC QUAN TRỌNG: Tuần 30-32)",
        description: "Đánh giá tổng quan sự phát triển ở giai đoạn cuối.",
        ultrasoundNotes: "Phát hiện dị tật xuất hiện muộn ở tim, cấu trúc não bộ. Siêu âm Doppler đánh giá tuần hoàn rốn, động mạch não giữa để tầm soát suy thai nếu thai nhỏ."
      }
    ],
    tips: [
      "Bắt đầu chuẩn bị tâm lý và đồ dùng đi sinh (giỏ đồ đi viện).",
      "Tiếp tục đếm số lần thai máy hàng ngày, phải đạt mức cho phép."
    ]
  },
  {
    id: "week35_40",
    period: "Tuần 35 - 40 (Chờ sinh)",
    babyDevelopment: "Bé hoàn thiện toàn diện, sẵn sàng chào đời. Hộp sọ có các thóp mềm hỗ trợ thai nhi lọt qua khung chậu mẹ.",
    momChanges: "Bụng tụt xuống, thường xuyên buồn tiểu do chèn ép bàng quang. Dịch âm đạo ra nhiều hơn.",
    checkupsAndTests: [
      {
        title: "Xét nghiệm liên cầu khuẩn nhóm B (Streptococcus B - GBS)",
        description: "Tuần 35-37, phết dịch âm đạo/trực tràng để tìm GBS và điều trị dự phòng viêm phế quản/viêm màng não cho bé.",
      },
      {
        title: "Khám thai thường xuyên & Đo tim thai (CTG)",
        description: "Từ tuần 37, thường khám 1-2 lần mỗi tuần để theo dõi nhịp tim thai và cơn gò.",
        ultrasoundNotes: "Khảo sát lượng nước ối (lưu ý cạn ối), độ trưởng thành (canxi hóa) của bánh nhau, vị trí dây rốn."
      }
    ],
    tips: [
      "Nắm rõ các dấu hiệu chuyển dạ: vỡ ối, ra máu cá hoặc gò tử cung đều đặn 5-10 phút/lần thì báo bác sĩ và nhập viện.",
      "Đi bộ nhẹ nhàng, thư giãn tâm lý giúp sinh nở dễ dàng hơn."
    ]
  }
];
