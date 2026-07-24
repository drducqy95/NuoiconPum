export interface DevelopmentStage {
  id: string;
  title: string;
  ageRange: string;
  milestones: string[];
  commonIssues: { title: string; description: string; solution: string }[];
}

export const stagesData: DevelopmentStage[] = [
  {
    id: 'newborn',
    title: 'Trẻ sơ sinh',
    ageRange: '0 - 1 tháng tuổi',
    milestones: [
      'Ngủ rất nhiều, từ 16-20 tiếng mỗi ngày.',
      'Phản xạ bú mút mạnh mẽ.',
      'Mắt bắt đầu nhìn theo vật tĩnh ở khoảng cách gần.',
      'Giật mình khi có tiếng động lớn.'
    ],
    commonIssues: [
      {
        title: 'Khóc dạ đề',
        description: 'Bé khóc dai dẳng vào buổi tối mà không rõ nguyên nhân.',
        solution: 'Bế ấp, sử dụng âm thanh trắng (white noise), massage bụng nhẹ nhàng theo chiều kim đồng hồ.'
      },
      {
        title: 'Trớ sữa sinh lý',
        description: 'Bé hay ọc sữa sau khi bú xong.',
        solution: 'Vỗ ợ hơi kỹ sau khi bú, bế đầu cao khoảng 15-20 phút rồi mới đặt nằm.'
      }
    ]
  },
  {
    id: 'infant-1-3m',
    title: 'Giai đoạn nhũ nhi đầu',
    ageRange: '1 - 3 tháng tuổi',
    milestones: [
      'Bắt đầu hóng chuyện, mỉm cười với người chăm sóc.',
      'Cứng cáp cổ hơn, có thể giữ đầu thẳng một lúc khi nằm sấp.',
      'Bắt đầu cầm nắm đồ vật đặt vào tay.',
      'Nhìn theo chuyển động của đồ vật xa hơn.'
    ],
    commonIssues: [
      {
        title: 'Táo bón hoặc giãn ruột sinh lý',
        description: 'Bé có thể nhiều ngày không đi ngoài (nhất là bé bú mẹ hoàn toàn).',
        solution: 'Nếu bé vẫn xì hơi, ăn ngủ bình thường thì có thể là giãn ruột sinh lý. Massage bụng, tập động tác đạp xe cho bé.'
      },
      {
        title: 'Ngủ ngày thức đêm (Lẫn lộn ngày đêm)',
        description: 'Bé ngủ nhiều vào ban ngày và thức chơi, quấy khóc ban đêm.',
        solution: 'Cho bé tiếp xúc ánh sáng tự nhiên ban ngày, phòng ngủ ban đêm cần tối và yên tĩnh, hạn chế tương tác quá mức vào ban đêm.'
      }
    ]
  },
  {
    id: 'infant-3-6m',
    title: 'Khám phá thế giới',
    ageRange: '3 - 6 tháng tuổi',
    milestones: [
      'Biết lật (lẫy) từ ngửa sang sấp và ngược lại.',
      'Cười thành tiếng, phản ứng rõ rệt khi được gọi tên.',
      'Có xu hướng cho mọi thứ vào miệng để khám phá.',
      'Ngủ ít hơn vào ban ngày, có thể ngủ xuyên đêm dài hơn.'
    ],
    commonIssues: [
      {
        title: 'Sốt mọc răng',
        description: 'Bé chảy dãi nhiều, cáu gắt, sốt nhẹ, hay nhai cắn đồ vật.',
        solution: 'Cho bé gặm nướu chuyên dụng (có thể làm mát), lau dãi thường xuyên. Sốt trên 38.5°C cần tham khảo ý kiến bác sĩ để dùng thuốc.'
      },
      {
        title: 'Khủng hoảng ngủ (Sleep regression 4 tháng)',
        description: 'Bé đột nhiên khó ngủ, hay thức giấc giữa đêm dù trước đó ngủ ngoan.',
        solution: 'Duy trì trình tự ngủ (bedtime routine) ổn định, kiên nhẫn, hỗ trợ bé thư giãn không tạo thói quen phụ thuộc xấu.'
      }
    ]
  },
  {
    id: 'infant-6-12m',
    title: 'Giai đoạn hiếu động',
    ageRange: '6 - 12 tháng tuổi',
    milestones: [
      'Tập ăn dặm, làm quen nhiều hương vị mới.',
      'Biết ngồi vững không cần hỗ trợ, biết trườn, bò.',
      'Bắt đầu bám vịn để đứng lên, có thể bước những bước đi đầu tiên.',
      'Biết vẫy tay chào (bye-bye), nói những từ đơn giản như "ba", "ma".'
    ],
    commonIssues: [
      {
        title: 'Biếng ăn sinh lý hoặc do mọc răng',
        description: 'Bé từ chối ăn dặm hoặc bú ít đi trong vài ngày.',
        solution: 'Không ép bé ăn. Thay đổi đa dạng món, làm lỏng thức ăn nếu bé mọc răng. Đợi qua giai đoạn bé sẽ ăn lại bình thường.'
      },
      {
        title: 'Lo âu xa cách (Separation anxiety)',
        description: 'Bé bám mẹ/người chăm sóc chính mãnh liệt, khóc lớn khi bị để lại một mình.',
        solution: 'Chơi trò ú òa (Peek-a-boo) để bé hiểu đồ vật/người biến mất rồi sẽ trở lại. Luôn chào tạm biệt rõ ràng trước khi đi, không trốn bé.'
      }
    ]
  }
];
