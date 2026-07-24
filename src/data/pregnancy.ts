export interface PregnancyMilestone {
  id: string;
  period: string;
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
    babyDevelopment: "Phôi thai hình thành và cấy vào niêm mạc tử cung. Ống thần kinh (tiền thân của não và tủy sống) bắt đầu phát triển.",
    momChanges: "Xuất hiện máu báo thai hồng nhẹ. Bắt đầu có dấu hiệu nghén nhẹ, trễ kinh, ngực căng tức, mệt mỏi.",
    checkupsAndTests: [
      {
        title: "Thử thai & Khám thai lần đầu",
        description: "Thử que 2 vạch hoặc xét nghiệm máu Beta-hCG để xác định có thai. Khám phụ khoa ban đầu.",
        ultrasoundNotes: "Xác định vị trí túi thai trong lòng tử cung, đo đường kính túi thai (GS), loại trừ thai ngoài tử cung."
      }
    ],
    tips: [
      "Bổ sung Axit Folic ngay lập tức (400-800mcg/ngày) để phòng ngừa dị tật ống thần kinh thai nhi.",
      "Tuyệt đối tránh rượu bia, thuốc lá, chất kích thích và các nguồn hóa chất độc hại.",
      "Không tự ý uống bất kỳ loại thuốc tây hay thảo dược nào mà không có chỉ định từ Bác sĩ sản khoa."
    ]
  },
  {
    id: "week5_8",
    period: "Tuần 5 - 8 (Tháng thứ 2)",
    babyDevelopment: "Tim thai bắt đầu đập mạnh. Các cơ quan quan trọng như não bộ, tủy sống, mầm mắt, tai, mũi, cánh tay và chân hình thành.",
    momChanges: "Giai đoạn ốm nghén bùng phát (buồn nôn, nhạy cảm mùi thức ăn, chán ăn, kiệt sức). Tần suất đi tiểu tăng do tử cung to lên.",
    checkupsAndTests: [
      {
        title: "Siêu âm kiểm tra tim thai & chiều dài phôi",
        description: "Thực hiện ở tuần 6-8 để kiểm tra sự sống của phôi thai và xác định thai đơn hay thai đôi.",
        ultrasoundNotes: "Đo chiều dài đầu mông (CRL), túi noãn hoàng (yolk sac) và đo nhịp tim thai bắp đập rõ ràng (bình thường 120-160 nhịp/phút)."
      }
    ],
    tips: [
      "Chia nhỏ cữ ăn thành 5-6 bữa nhẹ mỗi ngày. Uống trà gừng ấm hoặc dùng bánh quy giòn để làm dịu cảm giác buồn nôn.",
      "Bổ sung thêm Vitamin tổng hợp cho bà bầu chứa Sắt, Canxi, DHA.",
      "Nghỉ ngơi nhiều, tránh vận động mạnh hay bê vác vật nặng."
    ]
  },
  {
    id: "week9_13",
    period: "Tuần 9 - 13 (MỐC VÀNG SÀNG LỌC DỊ TẬT 3 THÁNG ĐẦU)",
    babyDevelopment: "Bé đã có hình dáng con người hoàn chỉnh, các khớp tay chân cử động nhẹ, móng tay móng chân xuất hiện.",
    momChanges: "Ốm nghén bắt đầu giảm dần ở tuần 12-13. Bụng dưới hơi tròn nhô lên. Tâm trạng vui vẻ trở lại.",
    checkupsAndTests: [
      {
        title: "Siêu âm đo Độ mờ da gáy (NT) (Tuần 11 - 13 tuần 6 ngày)",
        description: "Mốc siêu âm quan trọng bậc nhất 3 tháng đầu giúp sàng lọc sớm nguy cơ Hội chứng Down và dị tật tim bẩm sinh.",
        ultrasoundNotes: "Đo khoảng sáng sau gáy (NT < 2.5mm là bình thường). Khảo sát sự có mặt của xương mũi (NB), dòng máu qua van 3 lá và ống tĩnh mạch."
      },
      {
        title: "Xét nghiệm sàng lọc di truyền NIPT hoặc Double Test",
        description: "NIPT (xét nghiệm ADN tự do của thai trong máu mẹ) cho độ chính xác >99% với Hội chứng Down, Edwards, Patau và các đột biến nhiễm sắc thể giới tính.",
      }
    ],
    tips: [
      "TUYỆT ĐỐI KHÔNG BỎ LỠ mốc siêu âm đo độ mờ da gáy tuần 11 - 13 tuần 6 ngày vì sau 14 tuần lớp dịch gáy sẽ biến mất.",
      "Ưu tiên chọn xét nghiệm NIPT nếu có điều kiện để an tâm tối đa."
    ]
  },
  {
    id: "week14_19",
    period: "Tuần 14 - 19 (Giai đoạn 'Trăng mật' Thai kỳ)",
    babyDevelopment: "Bé nghe được âm thanh ngoài bụng mẹ. Hệ xương cứng cáp hơn. Bé bắt đầu đạp, đạp nhẹ (thai máy).",
    momChanges: "Nghén biến mất hoàn toàn, mẹ khỏe mạnh, thèm ăn ngon miệng. Cân nặng bắt đầu tăng 0.5kg/tuần. Vùng bụng tròn rõ.",
    checkupsAndTests: [
      {
        title: "Xét nghiệm Triple Test (nếu chưa làm NIPT/Double Test)",
        description: "Thực hiện ở tuần 15-18 để kiểm tra nguy cơ dị tật ống thần kinh (vô sọ, nứt đốt sống).",
      },
      {
        title: "Tiêm vắc-xin Uốn ván (VAT) mũi 1",
        description: "Bắt đầu tiêm vắc-xin ngừa uốn ván sơ sinh từ quý 2 thai kỳ.",
      }
    ],
    tips: [
      "Theo dõi cảm giác thai máy (thường rõ nhất từ tuần 18-20 ở mẹ mang thai con so).",
      "Tăng cường bổ sung thực phẩm giàu Canxi (sữa, cua, tôm) và uống Canxi kèm Vitamin D3 theo đơn bác sĩ."
    ]
  },
  {
    id: "week20_23",
    period: "Tuần 20 - 23 (MỐC VÀNG SIÊU ÂM HÌNH THÁI HỌC 4D/5D)",
    babyDevelopment: "Lớp mỡ dưới da phát triển. Não bộ phát triển bùng nổ. Bé cảm nhận được giọng nói của bố mẹ.",
    momChanges: "Đau lưng nhẹ, rạn da bụng/đùi bắt đầu xuất hiện. Rốn hơi lồi ra. Có thể bị sưng phù nhẹ cổ chân vào cuối ngày.",
    checkupsAndTests: [
      {
        title: "Siêu âm hình thái học chi tiết (MỐC 20 - 22 TUẦN)",
        description: "Bác sĩ rà soát 100% hình thái cấu trúc nội tạng thai nhi để phát hiện mọi dị tật hình thái bẩm sinh.",
        ultrasoundNotes: "Kiểm tra chi tiết: 4 buồng tim, não thất, cột sống, môi (sứt môi hở hàm ếch), 2 bàn tay bàn chân đủ ngón, thận, dạ dày, bánh nhau và lượng nước ối."
      }
    ],
    tips: [
      "Trò chuyện thai giáo với bé hàng ngày: nghe nhạc nhẹ, bố mẹ trò chuyện cùng bé.",
      "Dùng kem/dầu dưỡng ẩm hữu cơ thoa nhẹ vùng bụng và đùi để phòng hạn chế rạn da."
    ]
  },
  {
    id: "week24_28",
    period: "Tuần 24 - 28 (Tầm soát Tiểu đường thai kỳ)",
    babyDevelopment: "Mắt bé đã biết đóng mở, nhịp thở-ngủ ổn định. Phổi bắt đầu sản xuất chất Surfactant giúp phế nang không bị xẹp.",
    momChanges: "Xuất hiện cơn gò tử cung sinh lý (Braxton Hicks - gò không đau). Ợ nóng, táo bón do tử cung chèn ép ruột.",
    checkupsAndTests: [
      {
        title: "Nghiệm pháp dung nạp Glucose (OGTT) (Tuần 24-28)",
        description: "Xét nghiệm máu tầm soát Tiểu đường thai kỳ (lấy máu lúc đói, sau uống 75g glucose 1h và 2h).",
      },
      {
        title: "Tiêm vắc-xin Uốn ván mũi 2",
        description: "Tiêm mũi 2 cách mũi 1 ít nhất 1 tháng và trước ngày sinh dự kiến ít nhất 1 tháng.",
      }
    ],
    tips: [
      "Ăn chế độ giảm tinh bột đường đơn, tăng cường chất xơ để giữ đường huyết ổn định.",
      "Kê cao chân khi nằm nghỉ để giảm phù nề tĩnh mạch chân."
    ]
  },
  {
    id: "week29_34",
    period: "Tuần 29 - 34 (Tam cá nguyệt thứ 3)",
    babyDevelopment: "Bé tăng cân rất nhanh (mỗi tuần tăng khoảng 150-200g). Não bộ hoàn thiện các nếp nhăn. Ngôi thai bắt đầu xoay đầu xuống dưới.",
    momChanges: "Khó thở nhẹ do tử cung chèn ép cơ hoành. Khó ngủ vào ban đêm. Thường xuyên buồn đi tiểu.",
    checkupsAndTests: [
      {
        title: "Siêu âm đánh giá tăng trưởng & Dòng chảy Doppler (Tuần 30-32)",
        description: "Đánh giá tốc độ tăng trưởng cân nặng thai nhi, lượng nước ối và phổ Doppler động mạch rốn, động mạch não giữa.",
        ultrasoundNotes: "Phát hiện sớm tình trạng thai chậm phát triển trong tử cung (IUGR) hoặc cạn ối."
      }
    ],
    tips: [
      "Đếm cử động thai (Thai máy): Đếm 3 lần/ngày sau bữa ăn. Bé cử động ít nhất 4 lần trong 1 giờ là bình thường.",
      "Nằm nghiêng về bên trái khi ngủ để tối ưu hóa lưu lượng máu nuôi thai nhi."
    ]
  },
  {
    id: "week35_40",
    period: "Tuần 35 - 40 (CHUẨN BỊ CHÀO ĐỜI)",
    babyDevelopment: "Phổi và các cơ quan đã sẵn sàng 100% cho cuộc sống bên ngoài. Bé tụt dần xuống vùng xương chậu của mẹ.",
    momChanges: "Bụng tụt xuống giúp mẹ dễ thở hơn nhưng đi tiểu liên tục. Xuất hiện dịch nhầy âm đạo (nút nhầy tử cung). Cơn gò dồn dập.",
    checkupsAndTests: [
      {
        title: "Xét nghiệm Liên cầu khuẩn nhóm B (GBS) (Tuần 35-37)",
        description: "Quệt dịch âm đạo/hậu môn tầm soát vi khuẩn GBS để dự phòng kháng sinh khi sinh thường.",
      },
      {
        title: "Chạy máy Non-Stress Test (NST) đo tim thai & cơn gò",
        description: "Theo dõi nhịp tim thai và sức khỏe thai nhi hàng tuần khi cận ngày sinh.",
      }
    ],
    tips: [
      "Chuẩn bị sẵn Giỏ đồ đi sinh (Hồ sơ khám thai, quần áo sơ sinh, tã bỉm, giấy tờ cá nhân).",
      "🚨 Đến Bệnh viện ngay khi có dấu hiệu: Rỉ/Vỡ ối, Ra máu âm đạo (báo hiệu chuyển dạ) hoặc Cơn gò tử cung dồn dập 5 phút/lần."
    ]
  }
];
