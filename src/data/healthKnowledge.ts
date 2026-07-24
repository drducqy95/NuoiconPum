export interface AbnormalCondition {
  id: string;
  title: string;
  symptoms: string;
  homeCare: string;
  whenToSeeDoctor: string;
}

export const abnormalConditions: AbnormalCondition[] = [
  {
    id: "fever",
    title: "Sốt (Fever)",
    symptoms: "Nhiệt độ cơ thể > 37.5°C mọc răng, viêm họng, hoặc phản ứng sau tiêm. Trẻ có thể quấy khóc, lừ đừ, ăn kém.",
    homeCare: "Mặc quần áo thoáng mát. Cho trẻ bú/pha sữa hoặc uống nhiều nước (Oresol nếu cần). Lau mát bằng nước ấm ở nách, bẹn. Dùng hạ sốt (Paracetamol) khi > 38.5°C.",
    whenToSeeDoctor: "Trẻ < 3 tháng sốt ≥ 38°C; sốt cao liên tục không hạ dù đã uống thuốc; sốt kèm co giật, thở bất thường, tím tái, ban xuất huyết, lừ đừ li bì."
  },
  {
    id: "diarrhea_vomiting",
    title: "Tiêu chảy & Nôn trớ",
    symptoms: "Bé đi ngoài phân lỏng, tóe nước nhiều lần trong ngày (>3 lần). Nôn trớ liên tục, không giữ được thức ăn/sữa.",
    homeCare: "Quan trọng nhất là bù nước: tăng cường bú mẹ, uống Oresol (pha đúng tỉ lệ tuyệt đối). Chia nhỏ cữ bú/ăn. Giữ vệ sinh tay và đồ chơi.",
    whenToSeeDoctor: "Trẻ có dấu hiệu mất nước (khóc không nước mắt, mắt trũng, thóp lõm, tiểu ít/không tiểu 6h liên tục), phân có máu, nôn ra dịch xanh/vàng."
  },
  {
    id: "respiratory_distress",
    title: "Khò khè, khó thở",
    symptoms: "Thở khò khè, khụt khịt mũi, ho nhiều, nhịp thở nhanh hơn bình thường, lồng ngực rút lõm khi hít vào.",
    homeCare: "Nhỏ/Rửa mũi bằng nước muối sinh lý ấm. Kê cao đầu khi ngủ. Sử dụng máy tạo ẩm phòng (nếu dùng điều hòa) để tránh không khí quá khô.",
    whenToSeeDoctor: "Trẻ thở rất nhanh (>60 lần/phút ở trẻ <2 tháng, >50 lần ở trẻ 2-12 tháng); rút lõm lồng ngực rõ rệt; tím môi, quanh miệng; khò khè kèm không chịu bú."
  },
  {
    id: "allergy_rash",
    title: "Nổi ban đỏ, dị ứng",
    symptoms: "Da mẩn đỏ, ngứa ngáy (mề đay), có thể xuất hiện sau khi đổi sữa, ăn dặm món mới, bị côn trùng đốt, hoặc do thời tiết.",
    homeCare: "Mặc đồ cotton thoáng mát. Tắm bằng nước vừa phải (không quá nóng). Tránh cọ xát mạnh, cắt ngắn móng tay của bé. Bôi kem dưỡng ẩm dịu nhẹ.",
    whenToSeeDoctor: "Ban nổi rất nhanh, lan rộng toàn thân kèm theo sưng phù mặt/môi/mắt, thở khò khè, khàn tiếng, nôn mửa (dấu hiệu Sốc phản vệ - cần ĐI CẤP CỨU NGAY)."
  },
  {
    id: "constipation",
    title: "Táo bón",
    symptoms: "Đi ngoài thưa thớt, phân cứng, lổn nhổn, khô. Bé rặn đỏ mặt, khóc hoảng sợ khi cố đi vệ sinh.",
    homeCare: "Bé ăn dặm: tăng cường chất xơ (rau dền, mồng tơi, đu đủ), uống đủ nước. Nhũ nhi: massage bụng theo chiều kim đồng hồ, tập động tác đạp xe. Không lạm dụng thụt tháo.",
    whenToSeeDoctor: "Táo bón kéo dài trên 1 tuần không cải thiện, phân có lẫn máu, bụng chướng to, ném sữa liên tục, chậm tăng cân."
  }
];

export interface FirstAidGuide {
  id: string;
  title: string;
  goldenRule: string;
  steps: string[];
  warnings: string[];
}

export const firstAidGuides: FirstAidGuide[] = [
  {
    id: "choking",
    title: "Hóc dị vật (Nghẹt thở)",
    goldenRule: "Giải quyết TỪNG GIÂY. Tuyệt đối không dùng ngón tay móc mù vào họng bé vì có thể đẩy dị vật sâu hơn.",
    steps: [
      "Trẻ < 1 tuổi: Đặt trẻ nằm sấp dọc theo cánh tay bạn, đầu thấp hơn ngực. Dùng gót bàn tay vỗ mạnh 5 cái vào giữa hai xương bả vai. Nếu dị vật chưa rớt, lật ngửa bé, dùng 2 ngón tay ấn mạnh 5 cái ở giữa ngực.",
      "Trẻ > 1 tuổi: Đứng phía sau, ôm vòng qua bụng trẻ (Heimlich). Đặt một nắm đấm ngay vùng thượng vị (trên rốn), bàn tay kia ôm lấy nắm đấm, giật mạnh từ trước ra sau, từ dưới lên trên 5 lần.",
      "Lặp lại tới khi dị vật bật ra hoặc xe cấp cứu tớ."
    ],
    warnings: [
      "Không bao giờ bế xốc ngược lên dốc đầu xuống đập lưng khi bé đang cố ho vì dị vật có thể rớt ngược lại che kín đường thở.",
      "Chỉ làm khi bé ho yếu, tiếng ho tắt nghẹn, tím tái. Nếu bé vẫn đang khóc lớn và ho mạnh được, hãy để bé tự ho."
    ]
  },
  {
    id: "seizure",
    title: "Co giật do sốt cao",
    goldenRule: "Bình tĩnh bảo vệ bé khỏi chấn thương. Cơn giật thường tự hết sau 1-3 phút. CHỐNG CHỈ ĐỊNH nhét bất kỳ vật gì vào miệng.",
    steps: [
      "Đặt bé nằm nghiêng sang một bên trên mặt phẳng an toàn (để đờm dãi chảy ra ngoài, tránh hít sặc).",
      "Nới lỏng quần áo khu vực cổ, ngực.",
      "Ghi nhớ cụ thể thời điểm bắt đầu và kết thúc cơn giật (để báo bác sĩ).",
      "Sau khi dứt cơn giật, bé có thể ngủ lịm đi. Cần lau mát bằng nước ấm và cho uống thuốc hạ sốt khi bé đã tỉnh."
    ],
    warnings: [
      "Tuyệt đối không nhét ngón tay, thìa, đũa hay vắt chanh vào miệng bé (dễ gây gãy răng, sặc nghẹt đường thở).",
      "Không ôm cố ghì chặt bé lại trong lúc co giật.",
      "Đưa đi cấp cứu ngay nếu giật trên 5 phút hoặc có nhiều cơn giật liên tiếp chưa kịp tỉnh."
    ]
  },
  {
    id: "burn",
    title: "Phỏng (Bỏng)",
    goldenRule: "Hạ nhiệt ngay lập tức bằng NƯỚC MÁT SẠCH trong ít nhất 15-20 phút.",
    steps: [
      "Ngay lập tức để vùng bị bỏng dưới vòi nước chảy nhẹ, mát và sạch (nước máy nhiệt độ phòng) từ 15 - 20 phút.",
      "Nhẹ nhàng cởi bỏ quần áo hoặc trang sức ở vùng bị bỏng (trừ khi quần áo dính sát vào vết bỏng thì phải để bác sĩ cắt).",
      "Dùng gạc vô trùng hoặc khăn sạch và ẩm che lỏng vết bỏng.",
      "Đưa trẻ đi khám, đặc biệt với các vết bỏng ở mặt, bàn tay, bàn chân, vùng sinh dục."
    ],
    warnings: [
      "Tuyệt đối KHÔNG bôi kem đánh răng, nước mắm, mỡ trăn, hay đắp lá rễ cây (nguy cơ nhiễm trùng và làm sâu vết bỏng).",
      "KHÔNG dùng nước đá lạnh chườm trực tiếp vì có thể gây bỏng lạnh, hoại tử mô tế bào."
    ]
  },
  {
    id: "head_injury",
    title: "Chấn thương đầu (Té ngã)",
    goldenRule: "Theo dõi sát sao ý thức và biểu hiện của trẻ trong vòng 24 - 48 giờ sau khi ngã.",
    steps: [
      "Trấn an bé. Chườm lạnh nhẹ nhàng ngay tại chỗ sưng (bọc đá trong khăn) khoảng 10-15 phút để giảm sưng bầm.",
      "Quan sát bé, nếu bé khóc một lúc rồi chơi bình thường, ăn ngủ bình thường thì ba mẹ có thể an tâm theo dõi tại nhà.",
      "Trong 2 đêm đầu, ba mẹ cần kiểm tra bé vài lần trong lúc ngủ xem nhịp thở đều không."
    ],
    warnings: [
      "KHÔNG xoa dầu nóng, chườm nóng hay các loại rượu thuốc lên vết sưng bầm trên đầu bé (làm mạch máu giãn ra, sưng/chảy máu trong nhiều hơn).",
      "Cần ĐI CẤP CỨU NGAY nếu: Bé bất tỉnh, nôn vọt (nôn nhiều lần), lờ đờ/li bì khó đánh thức, khóc ré liên tục dỗ không nín, co giật, hoặc chảy máu/khoảng dịch trong ra từ tai/mũi."
    ]
  }
];

export interface MedicineItem {
  name: string;
  usage: string;
  dosageNotes: string;
  warnings: string;
}

export const medicinesList: MedicineItem[] = [
  {
    name: "Paracetamol",
    usage: "Hạ sốt, giảm đau (đau do tiêm, đau mọc răng).",
    dosageNotes: "10-15mg/kg cân nặng mỗi lần. Lặp lại sau 4-6 tiếng nếu vẫn còn sốt. Tối đa không quá 4-5 cữ/ngày.",
    warnings: "Đây là thuốc lành tính nhất cho trẻ nhỏ. Hết sức chú ý liều lượng dùng chính xác theo CÂN NẶNG, không tính theo tuổi."
  },
  {
    name: "Ibuprofen",
    usage: "Hạ sốt mạnh hơn, kháng viêm.",
    dosageNotes: "Chỉ dùng cho trẻ TRÊN 6 tháng tuổi, thường dùng khi sốt cao khó hạ bằng Paracetamol (theo hướng dẫn y tế).",
    warnings: "Tuyệt đối KHÔNG DÙNG nếu nghi ngờ Sốt xuất huyết. Không dùng cho trẻ bị hen suyễn, bệnh gan thận, loét dạ dày."
  },
  {
    name: "Nước muối sinh lý (NaCl 0.9%)",
    usage: "Vệ sinh mắt, mũi hàng ngày, làm sạch ráy tai ngoài hoặc rửa vết thương nông.",
    dosageNotes: "Nhỏ 1-2 giọt vào mỗi bên mũi/mắt rồi dùng tăm bông/khăn mềm lai sạch.",
    warnings: "An toàn. Khi bé nghẹt mũi nặng có thể kết hợp với các loại dung dịch xịt ưu trương (theo chỉ định) nhưng màng nhầy trẻ em rất mỏng manh, không nên lạm dụng xịt/rửa quá mạnh."
  },
  {
    name: "Oresol (Bù nước và điện giải)",
    usage: "Dùng khi bé tiêu chảy, nôn mửa, sốt nhiều mồ hôi.",
    dosageNotes: "PHA ĐÚNG TỈ LỆ NƯỚC GHI TRÊN GÓI (Ví dụ: pha với chính xác 200ml hoặc 1000ml nước đun sôi để nguội).",
    warnings: "Pha quá loãng (không có tác dụng) hoặc pha quá đặc (kéo nước vào ruột, làm đi ngoài nặng hơn, ngộ độc muối). Không chia nhỏ bột để pha."
  },
  {
    name: "Thuốc ho / Siro ho thảo dược",
    usage: "Làm dịu họng, giảm ho tự nhiên (Prospan, chanh đào mật ong...).",
    dosageNotes: "Theo chỉ định trên chai tùy độ tuổi. Mật ong CHỈ dùng cho trẻ > 1 tuổi (phòng ngừa ngộ độc Botulism).",
    warnings: "Trẻ dưới 2 tuổi không nên dùng các loại thuốc tân dược cắt phản xạ ho (trừ khi bác sĩ kê đơn), vì ho là phản xạ tự nhiên giúp tống đờm ra ngoài."
  }
];

export const medicineCabinetItems = [
  "Cặp nhiệt độ (nhiệt kế điện tử hồng ngoại hoặc kẹp nách).",
  "Thuốc hạ sốt (Paracetamol) dạng siro cho uống hoặc dạng viên đạn nhét hậu môn (dùng lúc bé không uống được/bị nôn).",
  "Nước muối sinh lý, tăm bông, miếng gạc y tế, băng dán cá nhân (urgo).",
  "Gói bù nước Oresol.",
  "Kem chống hăm, kem bôi sau khi bị muỗi đốt/côn trùng cắn (dịu nhẹ).",
  "Cồn sát trùng (Povidone Iodine - Betadine) hoặc Cồn 70 độ để sát khuẩn rìa vết thương ngoài da.",
  "Nước muối ưu trương, ống hút mũi dự phòng."
];
