export interface VaccineInfo {
  id: string;
  ageMilestone: string;
  vaccineName: string;
  diseaseTarget: string;
  doseNumber: string;
  topBrands: string[];
  commonSideEffects: string[];
  contraindications: string[];
  postCareTips: string;
}

export interface VaccineCategoryDetail {
  id: string;
  title: string;
  code: string;
  diseasePrevented: string;
  totalDoses: string;
  manufacturers: string;
  sideEffects: string;
  contraindications: string;
  importantNotes: string;
}

export interface NationalVaccineMatrixRow {
  id: string;
  vaccineName: string;
  programType: 'TCMR' | 'DV' | 'BOTH'; // TCMR: Tiêm chủng mở rộng, DV: Dịch vụ, BOTH: Cả 2
  newborn?: string;
  month2?: string;
  month3?: string;
  month4?: string;
  month6?: string;
  month9?: string;
  month12?: string;
  month18_24?: string;
  years4_6?: string;
  notes?: string;
}

// Brand-Based Vaccine Catalog Preset (Phân loại theo Nhóm vắc-xin & Tên Biệt dược cụ thể)
export interface VaccineBrandPreset {
  id: string;
  categoryName: string;      // Nhóm loại vắc-xin
  brandName: string;         // Tên biệt dược cụ thể
  manufacturer: string;      // Hãng sản xuất & Quốc gia
  targetDiseases: string;    // Bệnh phòng ngừa
  totalDosesText: string;    // Phác đồ tổng số mũi
  defaultLocation: string;
}

export const BRAND_VACCINE_CATALOG: VaccineBrandPreset[] = [
  // 1. Lao & Viêm gan B
  { id: 'bcg_ivac', categoryName: 'Lao sơ sinh', brandName: 'BCG (Lao sơ sinh)', manufacturer: 'IVAC (Việt Nam)', targetDiseases: 'Bệnh Lao sơ sinh', totalDosesText: '1 mũi (24-48h sau sinh)', defaultLocation: 'Bệnh viện phụ sản' },
  { id: 'vgb_engerix', categoryName: 'Viêm gan B', brandName: 'Engerix B', manufacturer: 'GSK (Bỉ)', targetDiseases: 'Viêm gan B lây từ mẹ & cộng đồng', totalDosesText: 'Mũi sơ sinh trong 24h đầu', defaultLocation: 'Bệnh viện phụ sản' },
  { id: 'vgb_euvax', categoryName: 'Viêm gan B', brandName: 'Euvax B', manufacturer: 'LG Life Sciences (Hàn Quốc)', targetDiseases: 'Viêm gan B', totalDosesText: 'Mũi sơ sinh trong 24h đầu', defaultLocation: 'Bệnh viện phụ sản' },

  // 2. Vắc-xin 6 trong 1
  { id: '6in1_hexaxim', categoryName: '6 trong 1 (6in1)', brandName: 'Hexaxim', manufacturer: 'Sanofi Pasteur (Pháp)', targetDiseases: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B, Hib', totalDosesText: '4 mũi (2, 3, 4 tháng & 18 tháng)', defaultLocation: 'VNVC' },
  { id: '6in1_infanrix', categoryName: '6 trong 1 (6in1)', brandName: 'Infanrix Hexa', manufacturer: 'GSK (Bỉ)', targetDiseases: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B, Hib', totalDosesText: '4 mũi (2, 3, 4 tháng & 18 tháng)', defaultLocation: 'VNVC' },

  // 3. Vắc-xin 5 trong 1 TCMR
  { id: '5in1_tcmr', categoryName: '5 trong 1 (TCMR)', brandName: 'DPT-VGB-Hib (TCMR)', manufacturer: 'Chương trình TCMR Quốc gia', targetDiseases: 'Bạch hầu, Ho gà, Uốn ván, Viêm gan B, Hib', totalDosesText: '4 mũi (2, 3, 4 tháng & 18 tháng)', defaultLocation: 'Trạm Y Tế Xã/Phường' },

  // 4. Phế cầu khuẩn
  { id: 'phecau_prevenar13', categoryName: 'Phế cầu khuẩn', brandName: 'Prevenar 13', manufacturer: 'Pfizer (Mỹ - 13 chủng)', targetDiseases: 'Viêm phổi phế cầu, Viêm màng não, Viêm tai giữa', totalDosesText: '4 mũi (2, 4, 6 tháng & 12 tháng)', defaultLocation: 'VNVC' },
  { id: 'phecau_synflorix', categoryName: 'Phế cầu khuẩn', brandName: 'Synflorix', manufacturer: 'GSK (Bỉ - 10 chủng)', targetDiseases: 'Viêm phổi phế cầu, Viêm tai giữa cấp', totalDosesText: '4 mũi (2, 4, 6 tháng & 12 tháng)', defaultLocation: 'VNVC' },

  // 5. Tiêu chảy do Rota Virus
  { id: 'rota_rotarix', categoryName: 'Tiêu chảy Rota Virus', brandName: 'Rotarix', manufacturer: 'GSK (Bỉ - 2 liều uống)', targetDiseases: 'Tiêu chảy cấp nôn mửa Rota Virus', totalDosesText: '2 liều uống (lúc 2 & 3 tháng)', defaultLocation: 'VNVC' },
  { id: 'rota_rotateq', categoryName: 'Tiêu chảy Rota Virus', brandName: 'Rotateq', manufacturer: 'MSD (Mỹ - 3 liều uống)', targetDiseases: 'Tiêu chảy cấp Rota Virus 5 chủng', totalDosesText: '3 liều uống (lúc 2, 3, 4 tháng)', defaultLocation: 'VNVC' },
  { id: 'rota_rotavin', categoryName: 'Tiêu chảy Rota Virus', brandName: 'Rotavin', manufacturer: 'Polyvac (Việt Nam - 2 liều)', targetDiseases: 'Tiêu chảy cấp Rota Virus', totalDosesText: '2 liều uống (lúc 2 & 3 tháng)', defaultLocation: 'VNVC' },

  // 6. Cúm mùa
  { id: 'cum_vaxigrip', categoryName: 'Cúm mùa', brandName: 'Vaxigrip Tetra', manufacturer: 'Sanofi Pasteur (Pháp)', targetDiseases: 'Cúm A/H1N1, A/H3N2 & Cúm B', totalDosesText: '2 mũi đầu (từ 6 tháng) + Nhắc hàng năm', defaultLocation: 'VNVC' },
  { id: 'cum_influvac', categoryName: 'Cúm mùa', brandName: 'Influvac Tetra', manufacturer: 'Abbott (Hà Lan)', targetDiseases: 'Cúm A & Cúm B 4 chủng', totalDosesText: '2 mũi đầu (từ 6 tháng) + Nhắc hàng năm', defaultLocation: 'VNVC' },

  // 7. Não mô cầu
  { id: 'naomocau_bc', categoryName: 'Não mô cầu', brandName: 'Mengoc BC', manufacturer: 'CIGB (Cu-ba - Chủng B+C)', targetDiseases: 'Viêm màng nào Não mô cầu nhóm B, C', totalDosesText: '2 mũi (từ 6 tháng tuổi)', defaultLocation: 'VNVC' },
  { id: 'naomocau_menactra', categoryName: 'Não mô cầu', brandName: 'Menactra', manufacturer: 'Sanofi Pasteur (Pháp - Chủng ACYW)', targetDiseases: 'Viêm màng nào Não mô cầu ACYW', totalDosesText: '1-2 mũi (từ 9 tháng tuổi)', defaultLocation: 'VNVC' },
  { id: 'naomocau_menquadfi', categoryName: 'Não mô cầu', brandName: 'MenQuadfi', manufacturer: 'Sanofi Pasteur (Pháp - Chủng ACYW)', targetDiseases: 'Viêm màng nào Não mô cầu ACYW', totalDosesText: '1 mũi (từ 12 tháng tuổi)', defaultLocation: 'VNVC' },

  // 8. Sởi & Sởi - Quai bị - Rubella (MMR)
  { id: 'soi_mvvac', categoryName: 'Sởi đơn', brandName: 'MVVac (Sởi đơn)', manufacturer: 'Polyvac (Việt Nam)', targetDiseases: 'Bệnh Sởi nguy hiểm', totalDosesText: '1 mũi lúc 9 tháng tuổi (TCMR)', defaultLocation: 'Trạm Y Tế Xã/Phường' },
  { id: 'mmr_priorix', categoryName: 'Sởi - Quai bị - Rubella', brandName: 'Priorix (MMR)', manufacturer: 'GSK (Bỉ)', targetDiseases: 'Sởi, Quai bị, Rubella', totalDosesText: '2 mũi (12 tháng & 4-6 tuổi)', defaultLocation: 'VNVC' },
  { id: 'mmr_mmr2', categoryName: 'Sởi - Quai bị - Rubella', brandName: 'MMR II', manufacturer: 'MSD (Mỹ)', targetDiseases: 'Sởi, Quai bị, Rubella', totalDosesText: '2 mũi (12 tháng & 4-6 tuổi)', defaultLocation: 'VNVC' },

  // 9. Thủy đậu
  { id: 'thuydau_varilrix', categoryName: 'Thủy đậu', brandName: 'Varilrix', manufacturer: 'GSK (Bỉ)', targetDiseases: 'Bệnh Thủy đậu (Trái rạ)', totalDosesText: '2 mũi (từ 9-12 tháng tuổi)', defaultLocation: 'VNVC' },
  { id: 'thuydau_varivax', categoryName: 'Thủy đậu', brandName: 'Varivax', manufacturer: 'MSD (Mỹ)', targetDiseases: 'Bệnh Thủy đậu (Trái rạ)', totalDosesText: '2 mũi (từ 12 tháng tuổi)', defaultLocation: 'VNVC' },

  // 10. Viêm não Nhật Bản
  { id: 'vnnb_imojev', categoryName: 'Viêm não Nhật Bản', brandName: 'Imojev', manufacturer: 'Sanofi Pasteur (Pháp - Tái tổ hợp)', targetDiseases: 'Viêm não Nhật Bản B', totalDosesText: '1-2 mũi (từ 9-12 tháng tuổi)', defaultLocation: 'VNVC' },
  { id: 'vnnb_jevax', categoryName: 'Viêm não Nhật Bản', brandName: 'Jevax', manufacturer: 'Vabiotech (Việt Nam)', targetDiseases: 'Viêm não Nhật Bản B', totalDosesText: '3 mũi cơ bản (từ 12 tháng tuổi)', defaultLocation: 'Trạm Y Tế Xã/Phường' },

  // 11. Viêm gan A & Thương hàn
  { id: 'vga_avaxim', categoryName: 'Viêm gan A', brandName: 'Avaxim', manufacturer: 'Sanofi Pasteur (Pháp)', targetDiseases: 'Viêm gan virus A', totalDosesText: '2 mũi (từ 12-24 tháng tuổi)', defaultLocation: 'VNVC' },
  { id: 'vga_havax', categoryName: 'Viêm gan A', brandName: 'Havax', manufacturer: 'Vabiotech (Việt Nam)', targetDiseases: 'Viêm gan virus A', totalDosesText: '2 mũi (từ 12-24 tháng tuổi)', defaultLocation: 'Trạm Y Tế Xã/Phường' }
];

export const NATIONAL_VACCINE_MATRIX: NationalVaccineMatrixRow[] = [
  {
    id: 'bcg',
    vaccineName: 'Lao (BCG)',
    programType: 'TCMR',
    newborn: '● Mũi 1',
    notes: 'Tiêm 24-48h sau sinh (Miễn phí TCMR)'
  },
  {
    id: 'vgb',
    vaccineName: 'Viêm gan B sơ sinh',
    programType: 'TCMR',
    newborn: '● Mũi 1',
    notes: 'Tiêm trong 24h đầu sau sinh'
  },
  {
    id: '6in1',
    vaccineName: '6 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, VGB, Hib)',
    programType: 'DV',
    month2: '● Mũi 1',
    month3: '● Mũi 2',
    month4: '● Mũi 3',
    month18_24: '★ Nhắc 4',
    notes: 'Hexaxim (Pháp) / Infanrix Hexa (Bỉ)'
  },
  {
    id: '5in1_tcmr',
    vaccineName: '5 trong 1 (DPT-VGB-Hib) + Uống/Tiêm Bại liệt (OPV/IPV)',
    programType: 'TCMR',
    month2: '● Mũi 1',
    month3: '● Mũi 2',
    month4: '● Mũi 3',
    month18_24: '★ Nhắc 4',
    notes: 'Chương trình Tiêm chủng mở rộng Quốc gia'
  },
  {
    id: 'rota',
    vaccineName: 'Tiêu chảy Rota Virus (Uống)',
    programType: 'DV',
    month2: '● Liều 1',
    month3: '● Liều 2',
    month4: '● Liều 3',
    notes: 'Rotarix (2 liều) / Rotateq (3 liều)'
  },
  {
    id: 'phecau',
    vaccineName: 'Phế cầu khuẩn (Synflorix / Prevenar 13)',
    programType: 'DV',
    month2: '● Mũi 1',
    month4: '● Mũi 2',
    month6: '● Mũi 3',
    month12: '★ Nhắc 4',
    notes: 'Ngừa viêm phổi, viêm tai giữa, viêm màng nào'
  },
  {
    id: 'cum',
    vaccineName: 'Cúm mùa (Vaxigrip Tetra / Influvac)',
    programType: 'DV',
    month6: '● Mũi 1',
    month9: '● Mũi 2',
    years4_6: '★ Nhắc năm',
    notes: 'Tiêm nhắc 1 lần/năm trước mùa dịch'
  },
  {
    id: 'naomocau',
    vaccineName: 'Viêm màng não Não mô cầu (B+C / ACYW)',
    programType: 'DV',
    month6: '● Mũi 1 (BC)',
    month9: '● Mũi 1 (ACYW)',
    month12: '★ Mũi 2',
    notes: 'Mengoc BC / Menactra'
  },
  {
    id: 'soi',
    vaccineName: 'Sởi đơn / Sởi - Quai bị - Rubella (MMR)',
    programType: 'BOTH',
    month9: '● Mũi 1 (Sởi)',
    month12: '● Mũi 1 (MMR)',
    month18_24: '★ Mũi 2',
    years4_6: '★ Nhắc MMR',
    notes: 'Sởi 9 tháng (TCMR) & MMR 12 tháng (Dịch vụ)'
  },
  {
    id: 'thuydau',
    vaccineName: 'Thủy đậu (Varilrix / Varivax)',
    programType: 'DV',
    month12: '● Mũi 1',
    month18_24: '★ Mũi 2',
    years4_6: '★ Mũi 2',
    notes: 'Tiêm từ 12 tháng tuổi (2 mũi)'
  },
  {
    id: 'vnnb',
    vaccineName: 'Viêm brain Nhật Bản (Imojev / Jevax)',
    programType: 'BOTH',
    month12: '● Mũi 1',
    month18_24: '★ Mũi 2',
    years4_6: '★ Mũi 3',
    notes: 'Jevax (TCMR 3 mũi) / Imojev (Sanofi 1-2 mũi)'
  },
  {
    id: 'vga',
    vaccineName: 'Viêm gan A (Avaxim / Havax)',
    programType: 'DV',
    month12: '● Mũi 1',
    month18_24: '★ Mũi 2',
    notes: '2 mũi cách nhau 6 tháng'
  }
];

export const VACCINE_SCHEDULE: VaccineInfo[] = [
  {
    id: 'newborn',
    ageMilestone: 'Sơ sinh (24-48 giờ đầu sau sinh)',
    vaccineName: 'Vắc-xin Viêm gan B (VGB) & Lao (BCG)',
    diseaseTarget: 'Phòng bệnh Viêm gan B lây truyền từ mẹ và bệnh Lao sơ sinh',
    doseNumber: '1 mũi Viêm gan B sơ sinh + 1 mũi Lao (BCG)',
    topBrands: ['Engerix B (GSK - Bỉ)', 'Euvax B (LG Life Sciences - Hàn Quốc)', 'Vắc-xin Lao BCG (IVAC - Việt Nam)'],
    commonSideEffects: [
      'BCG: Sau 2-4 tuần xuất hiện nốt mưng mủ tự vỡ tạo sẹo (dấu hiệu đáp ứng miễn dịch tốt)',
      'Viêm gan B: Sốt nhẹ <38°C, sưng nhẹ chỗ tiêm, tự khỏi sau 24-48h'
    ],
    contraindications: [
      'Trẻ sinh thiếu tháng dưới 2kg (tạm hoãn tiêm BCG)',
      'Trẻ đang sốt cao, mắc các bệnh nhiễm trùng cấp tính',
      'Trẻ bị suy giảm miễn dịch bẩm sinh nặng'
    ],
    postCareTips: 'Giữ vệ sinh nốt tiêm khô ráo. Nốt BCG mưng mủ KHÔNG tự ý bôi thuốc hay nặn mủ, chỉ cần lau bằng nước muối sinh lý ấm.'
  },
  {
    id: 'month2',
    ageMilestone: '2 tháng tuổi',
    vaccineName: 'Vắc-xin 6 trong 1 + Phế cầu + Tiêu chảy do Rota virus',
    diseaseTarget: 'Phòng 6 bệnh (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B, Viêm màng nào do Hib) + Viêm phổi/Viêm tai giữa do Phế cầu + Tiêu chảy cấp',
    doseNumber: 'Mũi 1 (6in1) + Mũi 1 (Phế cầu) + Liều 1 (Nhỏ Rota)',
    topBrands: ['Hexaxim (Sanofi Pasteur - Pháp)', 'Infanrix Hexa (GSK - Bỉ)', 'Synflorix (GSK - Bỉ)', 'Prevenar 13 (Pfizer - Mỹ)', 'Rotarix (GSK - Bỉ)', 'Rotateq (MSD - Mỹ)'],
    commonSideEffects: [
      'Sốt 37.5 - 38.5°C sau khi tiêm 6-12 tiếng',
      'Đau, đỏ, sưng nhẹ ở đùi vị trí tiêm',
      'Bé hơi quấy khóc, chán ăn nhẹ sau khi uống vắc-xin Rota'
    ],
    contraindications: [
      'Trẻ từng có phản ứng dị ứng sốc bảo vệ với mũi tiêm trước',
      'Trẻ đang bị tiêu chảy cấp hoặc sốt cao >38°C',
      'Trẻ bị lồng ruột hoặc có dị tật bẩm sinh đường tiêu hóa (chống chỉ định vắc-xin Rota)'
    ],
    postCareTips: 'Cho bé bú nhiều cữ. Chườm mát vị trí tiêm bằng khăn sạch. Nếu sốt >38.5°C uống Paracetamol đúng liều 10-15mg/kg.'
  },
  {
    id: 'month3',
    ageMilestone: '3 tháng tuổi',
    vaccineName: 'Vắc-xin 6 trong 1 + Tiêu chảy do Rota virus (Lần 2)',
    diseaseTarget: 'Tiếp tục củng cố kháng thể 6 bệnh nguy hiểm & phòng tiêu chảy cấp do Rota virus',
    doseNumber: 'Mũi 2 (6in1) + Liều 2 (Nhỏ Rota)',
    topBrands: ['Hexaxim (Sanofi - Pháp)', 'Infanrix Hexa (GSK - Bỉ)', 'Rotarix (GSK - Bỉ)', 'Rotateq (MSD - Mỹ)'],
    commonSideEffects: [
      'Sốt nhẹ 38°C, dị ứng da mẩn đỏ thoáng qua',
      'Vùng đùi tiêm sưng cứng nhẹ 1-2 ngày'
    ],
    contraindications: [
      'Đang sốt cấp tính hoặc nhiễm trùng chưa ổn định'
    ],
    postCareTips: 'Cần cách thời điểm nhỏ Rota với cữ bú 15-30 phút để bé không bị nôn trớ vắc-xin.'
  },
  {
    id: 'month4',
    ageMilestone: '4 tháng tuổi',
    vaccineName: 'Vắc-xin 6 trong 1 + Phế cầu + Tiêu chảy Rota (Lần 3)',
    diseaseTarget: 'Hoàn thành phác đồ cơ bản 6in1 + Phế cầu khuẩn + Rota virus',
    doseNumber: 'Mũi 3 (6in1) + Mũi 2 (Phế cầu) + Liều 3 (Rotateq nếu dùng phác đồ 3 liều)',
    topBrands: ['Hexaxim (Sanofi - Pháp)', 'Prevenar 13 (Pfizer - Mỹ)', 'Synflorix (GSK - Bỉ)', 'Rotateq (MSD - Mỹ)'],
    commonSideEffects: [
      'Sốt nhẹ, rên rẩm nhẹ, vị trí tiêm sưng đỏ vừa'
    ],
    contraindications: [
      'Trẻ đang mắc bệnh nhiễm trùng nặng hoặc suy hô hấp'
    ],
    postCareTips: 'Theo dõi nhiệt độ bé mỗi 2-3 tiếng. Duy trì chườm mát và cho bé bú mẹ gia tăng miễn dịch.'
  },
  {
    id: 'month6',
    ageMilestone: '6 tháng tuổi',
    vaccineName: 'Vắc-xin Cúm mùa + Viêm màng nào do Não mô cầu B+C',
    diseaseTarget: 'Phòng nhiễm cúm A/H1N1, A/H3N2, Cúm B & Viêm màng nào do vi khuẩn Não mô cầu nhóm B, C',
    doseNumber: 'Mũi 1 (Cúm mùa) + Mũi 1 (BCPS / Mengoc BC)',
    topBrands: ['Vaxigrip Tetra (Sanofi - Pháp)', 'Influvac Tetra (Abbott - Hà Lan)', 'Mengoc BC (CIGB - Cu-ba)'],
    commonSideEffects: [
      'Tiêm Cúm: Sốt nhẹ 37.8°C, chảy mũi nhẹ',
      'Mengoc BC: Có thể sưng đau vừa tại vị trí tiêm bắp tay/đùi'
    ],
    contraindications: [
      'Trẻ bị dị ứng nặng với protein trứng gà (đối với vắc-xin Cúm)',
      'Đang có đợt sốt cao hoặc cấp cứu'
    ],
    postCareTips: 'Nhắc lại mũi Cúm thứ 2 sau 1 tháng. Mũi Mengoc BC tiêm nhắc lại mũi 2 sau 2 tháng.'
  },
  {
    id: 'month9',
    ageMilestone: '9 tháng tuổi',
    vaccineName: 'Vắc-xin Sởi đơn / 3in1 (Sởi - Quai bị - Rubella) + Sốt xuất huyết + Não mô cầu ACYW',
    diseaseTarget: 'Phòng bệnh Sởi nguy hiểm, Quai bị, Rubella, Viêm màng nào ACYW & Sốt xuất huyết Dengue',
    doseNumber: 'Mũi 1 (Sởi/MMR) + Mũi 1 (Menactra/MenQuadfi)',
    topBrands: ['MVVac (Polyvac - Việt Nam)', 'Priorix (GSK - Bỉ)', 'MMR II (MSD - Mỹ)', 'Menactra (Sanofi - Pháp)', 'Qdenga (Takeda - Nhật Bản)'],
    commonSideEffects: [
      'Sau 5-12 ngày tiêm vắc-xin Sởi có thể phát ban nhẹ thoáng qua như sởi lành tính',
      'Sốt nhẹ 38°C sau tiêm 1-2 ngày'
    ],
    contraindications: [
      'Trẻ đang dùng thuốc ức chế miễn dịch liều cao',
      'Dị ứng nghiêm trọng với Gelatin hay Neomycin'
    ],
    postCareTips: 'Phát ban sau tiêm Sởi là phản ứng miễn dịch bình thường, không tự ý bôi lá thuốc dân gian.'
  },
  {
    id: 'month12',
    ageMilestone: '12 tháng tuổi (1 tuổi)',
    vaccineName: 'Vắc-xin Thủy đậu + Viêm nào Nhật Bản + Thủy đậu + MMR + Phế cầu mũi nhắc',
    diseaseTarget: 'Phòng bệnh Thủy đậu, Viêm nào Nhật Bản B, Sởi-Quai bị-Rubella & Nhắc lại Phế cầu',
    doseNumber: 'Mũi 1 Thủy đậu + Mũi 1 Viêm nào Nhật Bản + Mũi 3/4 Phế cầu',
    topBrands: ['Varilrix (GSK - Bỉ)', 'Varivax (MSD - Mỹ)', 'Imojev (Sanofi - Pháp)', 'Jevax (Vabiotech - Việt Nam)'],
    commonSideEffects: [
      'Nốt sẩn ngứa nhẹ mọc tơ rải rác sau tiêm Thủy đậu (tự biến mất)',
      'Sốt nhẹ 38°C sau tiêm Viêm nào Nhật Bản'
    ],
    contraindications: [
      'Trẻ vừa truyền máu hoặc chế phẩm máu trong vòng 3-11 tháng'
    ],
    postCareTips: 'Imojev (Sanofi) tiêm 1 mũi duy nhất từ 9 tháng hoặc 12 tháng. Jevax tiêm 3 mũi cơ bản.'
  },
  {
    id: 'month18to24',
    ageMilestone: '18 - 24 tháng tuổi',
    vaccineName: 'Mũi nhắc 6 trong 1 / 5 trong 1 + Viêm gan A + Thương hàn',
    diseaseTarget: 'Củng cố miễn dịch lâu dài cho 6 bệnh nguy hiểm + Phòng bệnh Viêm gan A & Thương hàn',
    doseNumber: 'Mũi 4 (6in1 / Tetraxim) + Mũi 1 Viêm gan A',
    topBrands: ['Tetraxim (Sanofi - Pháp)', 'Hexaxim (Sanofi - Pháp)', 'Avaxim (Sanofi - Pháp)', 'Typhim Vi (Sanofi - Pháp)'],
    commonSideEffects: ['Đau sưng nhẹ cánh tay/đùi, sốt nhẹ thoáng qua.'],
    contraindications: ['Đang sốt cấp tính chưa rõ nguyên nhân.'],
    postCareTips: 'Đây là mũi tiêm vô cùng quan trọng để duy trì kháng thể trước khi trẻ đi lớp mầm non.'
  }
];

export const DETAILED_VACCINES: VaccineCategoryDetail[] = [
  {
    id: '6in1',
    title: 'Vắc-xin phối hợp 6 trong 1 (Hexaxim / Infanrix Hexa)',
    code: '6in1',
    diseasePrevented: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B, Viêm phổi/Viêm màng nào mủ do vi khuẩn Hib.',
    totalDoses: '4 mũi (2, 3, 4 tháng tuổi & mũi nhắc thứ 4 lúc 18-24 tháng tuổi).',
    manufacturers: 'Sanofi Pasteur (Pháp - Hexaxim pha sẵn) & GSK (Bỉ - Infanrix Hexa đông khô).',
    sideEffects: 'Sốt nhẹ 37.5-38.5°C sau tiêm 6-24h, sưng đỏ đau nhẹ vùng đùi tiêm, quấy khóc nhẹ. Tự khỏi sau 1-2 ngày.',
    contraindications: 'Tiền sử sốc phản vệ mũi trước; Trẻ đang sốt cao cấp tính >38°C hoặc suy hô hấp.',
    importantNotes: 'Hexaxim (Sanofi) & Infanrix Hexa (GSK) có hiệu quả bảo vệ >98%, giảm tối đa số lần tiêm cho trẻ.'
  },
  {
    id: 'phecau',
    title: 'Vắc-xin ngừa Phế cầu khuẩn (Prevenar 13 / Synflorix)',
    code: 'Phế cầu (PCV)',
    diseasePrevented: 'Viêm phổi phế cầu, Viêm màng nào mủ, Viêm tai giữa cấp, Nhiễm trùng huyết do Streptococcus pneumoniae.',
    totalDoses: '3 mũi cơ bản (2, 4, 6 tháng) + 1 mũi nhắc lại (12-15 tháng tuổi).',
    manufacturers: 'Pfizer (Mỹ - Prevenar 13 chứa 13 chủng phế cầu) & GSK (Bỉ - Synflorix chứa 10 chủng).',
    sideEffects: 'Sốt nhẹ, quấy khóc, chán ăn tạm thời, vết tiêm sưng đỏ hoặc nổi nốt cứng nhẹ.',
    contraindications: 'Dị ứng với độc tố bạch hầu CRM197 hoặc thành phần của vắc-xin.',
    importantNotes: 'Prevenar 13 bao phủ thêm 3 chủng phế cầu nguy hiểm (19A, 6A, 3) và dùng được cho trẻ nhỏ lẫn người lớn.'
  },
  {
    id: 'rota',
    title: 'Vắc-xin đường uống ngừa Tiêu chảy cấp do Rota Virus (Rotarix / Rotateq / Rotavin)',
    code: 'Rota Virus',
    diseasePrevented: 'Tiêu chảy cấp nôn mửa, mất nước nồng độ cao nguy hiểm do Rota Virus.',
    totalDoses: 'Rotarix (2 liều: 2, 3 tháng); Rotateq (3 liều: 2, 3, 4 tháng); Rotavin (2 liều). Hoàn thành trước 6-8 tháng tuổi.',
    manufacturers: 'GSK (Bỉ - Rotarix), MSD (Mỹ - Rotateq), Polyvac (Việt Nam - Rotavin).',
    sideEffects: 'Nôn trớ nhẹ thoáng qua, phân hơi lỏng 1-2 ngày.',
    contraindications: 'Trẻ bị dị tật lồng ruột bẩm sinh, suy giảm miễn dịch nặng, sốt cao hoặc đang tiêu chảy.',
    importantNotes: 'Vắc-xin dạng nhỏ giọt đường uống (KHÔNG tiêm). Không bú mẹ 15-30 phút trước & sau khi uống để đạt tối đa hiệu quả.'
  },
  {
    id: 'cum',
    title: 'Vắc-xin Cúm mùa 4 chủng (Vaxigrip Tetra / Influvac Tetra)',
    code: 'Cúm Mùa',
    diseasePrevented: 'Bệnh Cúm mùa cấp tính (Cúm A/H1N1, A/H3N2 & 2 dòng Cúm B), ngừa biến chứng viêm phổi cúm.',
    totalDoses: 'Trẻ 6 tháng - 9 tuổi: 2 mũi đầu cách nhau 1 tháng; Sau đó tiêm nhắc lại 1 mũi mỗi năm.',
    manufacturers: 'Sanofi Pasteur (Pháp - Vaxigrip Tetra) & Abbott (Hà Lan - Influvac Tetra).',
    sideEffects: 'Sốt nhẹ 37.5-38°C, sưng đau nhẹ tại chỗ tiêm, chảy mũi nhẹ thoáng qua.',
    contraindications: 'Trẻ bị tiền sử sốc phản vệ nặng với protein trứng gà hoặc nhạy cảm với neomycin.',
    importantNotes: 'Chủng cúm thay đổi liên tục hàng năm. Tiêm chủng cúm định kỳ giúp giảm 80% nguy cơ nhập viện do biến chứng hô hấp.'
  },
  {
    id: 'soi_mmr',
    title: 'Vắc-xin Sởi đơn (MVVac) & 3in1 Sởi - Quai Bị - Rubella (Priorix / MMR II)',
    code: 'MMR / Sởi',
    diseasePrevented: 'Bệnh Sởi (biến chứng viêm phổi/viêm màng não), Quai bị (viêm tinh hoàn/buồng trứng), Rubella dị tật thai nhi.',
    totalDoses: 'Mũi 1 Sởi đơn (9 tháng) hoặc MMR (12 tháng); Mũi 2 MMR lúc 18 tháng hoặc 4-6 tuổi.',
    manufacturers: 'GSK (Bỉ - Priorix), MSD (Mỹ - MMR II), Polyvac (Việt Nam - MVVac).',
    sideEffects: 'Sau 5-12 ngày có thể phát ban sẩn nhẹ rải rác thoáng qua giống sởi lành tính, sốt nhẹ 38°C.',
    contraindications: 'Trẻ bị suy giảm miễn dịch nặng, dùng corticosteroid liều cao, dị ứng nấm men/neomycin.',
    importantNotes: 'Sởi lây nhiễm cực nhanh qua không khí. Việc hoàn thành 2 mũi MMR đạt bảo vệ 99% suốt đời.'
  },
  {
    id: 'naomocau',
    title: 'Vắc-xin Viêm màng não Não mô cầu (Mengoc BC / Menactra / MenQuadfi)',
    code: 'Não Mô Cầu',
    diseasePrevented: 'Viêm màng nào mủ tối cấp, nhiễm trùng huyết hoại tử tử vong nhanh do vi khuẩn Não mô cầu (Neisseria meningitidis).',
    totalDoses: 'Mengoc BC (2 mũi: từ 6 tháng, cách 2 tháng); Menactra ACYW (1-2 mũi: từ 9 tháng); MenQuadfi (1 mũi từ 12 tháng).',
    manufacturers: 'CIGB (Cu-ba - Mengoc BC), Sanofi Pasteur (Pháp - Menactra & MenQuadfi).',
    sideEffects: 'Đau sưng nhẹ ở bắp tay/đùi, sốt nhẹ 37.8°C.',
    contraindications: 'Trẻ bị dị ứng nghiêm trọng thành phần độc tố bạch hầu hoặc sốt cấp tính.',
    importantNotes: 'Bệnh não mô cầu diễn tiến cấp tính tử vong trong vòng 24h. Nên tiêm kết hợp cả nhóm B+C và ACYW để bảo vệ toàn diện.'
  },
  {
    id: 'thuydau',
    title: 'Vắc-xin ngừa bệnh Thủy đậu / Trái rạ (Varilrix / Varivax)',
    code: 'Thủy Đậu',
    diseasePrevented: 'Bệnh Thủy đậu (Trái rạ), ngừa biến chứng nhiễm trùng da, viêm phổi thủy đậu và Zona thần kinh sau này.',
    totalDoses: '2 mũi: Mũi 1 từ 9-12 tháng tuổi; Mũi 2 cách mũi 1 ít nhất 3 tháng (hoặc lúc 4-6 tuổi).',
    manufacturers: 'GSK (Bỉ - Varilrix) & MSD (Mỹ - Varivax).',
    sideEffects: 'Nổi nốt sẩn ngứa mụn nước nhỏ rải rác sau tiêm 1-3 tuần (tự lặn), sốt nhẹ.',
    contraindications: 'Trẻ suy giảm miễn dịch bẩm sinh/bệnh bạch cầu, vừa truyền máu/chế phẩm máu trong 3-11 tháng.',
    importantNotes: 'Vắc-xin sống giảm độc lực. Đạt hiệu quả bảo vệ 98%, tránh sẹo lồi thủy đậu và nguy cơ bùng phát dịch học đường.'
  },
  {
    id: 'vnnb',
    title: 'Vắc-xin Viêm não Nhật Bản B (Imojev / Jevax)',
    code: 'Viêm Não Nhật Bản',
    diseasePrevented: 'Bệnh Viêm não Nhật Bản B lây truyền qua muỗi Culex (gây tổn thương não vĩnh viễn, di chứng liệt/tử vong).',
    totalDoses: 'Imojev (Sanofi): Mũi 1 từ 9-12 tháng, Mũi 2 sau 1 năm; Jevax (Việt Nam): 3 mũi cơ bản.',
    manufacturers: 'Sanofi Pasteur (Pháp - Imojev tái tổ hợp) & Vabiotech (Việt Nam - Jevax bất hoạt).',
    sideEffects: 'Sốt nhẹ 38°C sau tiêm 24-48h, sưng đau nhẹ chỗ tiêm, mệt mỏi nhẹ.',
    contraindications: 'Trẻ bị sốt cao cấp tính, dị ứng nặng thành phần vắc-xin.',
    importantNotes: 'Imojev tạo kháng thể nhanh chỉ sau 1 mũi và hiệu quả bảo vệ kéo dài lâu hơn vắc-xin thế hệ cũ.'
  },
  {
    id: 'vga',
    title: 'Vắc-xin Viêm gan virus A (Avaxim / Havax)',
    code: 'Viêm Gan A',
    diseasePrevented: 'Viêm gan virus A lây truyền qua đường tiêu hóa/thức ăn nhiễm khuẩn, ngừa tổn thương gan cấp.',
    totalDoses: '2 mũi: Mũi 1 từ 12-24 tháng tuổi; Mũi 2 nhắc lại sau mũi 1 từ 6-12 tháng.',
    manufacturers: 'Sanofi Pasteur (Pháp - Avaxim) & Vabiotech (Việt Nam - Havax).',
    sideEffects: 'Sưng nhẹ chỗ tiêm, chán ăn nhẹ, tự khỏi sau 24h.',
    contraindications: 'Đang mắc bệnh nhiễm trùng cấp tính hoặc dị ứng thành phần vắc-xin.',
    importantNotes: 'Kháng thể hình thành sau 2 mũi có độ bền bảo vệ trên 20 năm.'
  },
  {
    id: 'bcg_vgb',
    title: 'Vắc-xin Lao sơ sinh (BCG) & Viêm gan B sơ sinh (Engerix B / Euvax B)',
    code: 'Lao & VGB Sơ sinh',
    diseasePrevented: 'Lao màng não sơ sinh & Viêm gan B lây truyền từ mẹ sang con trong khi sinh.',
    totalDoses: '1 mũi Lao BCG + 1 mũi Viêm gan B sơ sinh (Tiêm trong 24-48h đầu sau sinh).',
    manufacturers: 'IVAC (Việt Nam - BCG), GSK (Bỉ - Engerix B), LG (Hàn Quốc - Euvax B).',
    sideEffects: 'BCG: Sau 2-4 tuần xuất hiện mụn mủ tự vỡ tạo sẹo lõm (phản ứng tốt); VGB: Sốt nhẹ 37.5°C.',
    contraindications: 'Trẻ sinh thiếu tháng dưới 2kg (tạm hoãn BCG), sốt cao cấp tính.',
    importantNotes: 'Mũi Viêm gan B trong 24h vàng đầu sau sinh giúp ngăn chặn 95% nguy cơ lây truyền từ mẹ sang con.'
  },
  {
    id: 'dengue',
    title: 'Vắc-xin ngừa Sốt xuất huyết Dengue (Qdenga)',
    code: 'Sốt Xuất Huyết',
    diseasePrevented: 'Sốt xuất huyết Dengue do 4 tuýp virus Dengue (DEN-1, DEN-2, DEN-3, DEN-4).',
    totalDoses: '2 mũi tiêm cách nhau 3 tháng (Dành cho trẻ từ 4 tuổi trở lên và người lớn).',
    manufacturers: 'Takeda (Nhật Bản - Qdenga).',
    sideEffects: 'Đau sưng chỗ tiêm, sốt nhẹ, đau đầu, mệt mỏi nhẹ 1-2 ngày.',
    contraindications: 'Phụ nữ mang thai/cho con bú, trẻ suy giảm miễn dịch nặng.',
    importantNotes: 'Vắc-xin phòng ngừa hiệu quả cho cả người từng hoặc chưa từng nhiễm Sốt xuất huyết Dengue.'
  },
  {
    id: 'hpv',
    title: 'Vắc-xin ngừa Virus HPV (Gardasil 9)',
    code: 'HPV / Gardasil 9',
    diseasePrevented: 'Ung thư cổ tử cung, ung thư hậu môn, âm hộ, sùi mào gà do 9 chủng virus HPV (6, 11, 16, 18, 31, 33, 45, 52, 58).',
    totalDoses: 'Từ 9-14 tuổi: 2 mũi cách nhau 6-12 tháng; Từ 15-45 tuổi: 3 mũi (0, 2, 6 tháng).',
    manufacturers: 'MSD (Mỹ - Gardasil 9).',
    sideEffects: 'Đau, sưng đỏ chỗ tiêm, sốt nhẹ thoáng qua.',
    contraindications: 'Dị ứng nghiêm trọng với nấm men, đang mang thai.',
    importantNotes: 'Tiêm HPV càng sớm (từ 9 tuổi) hiệu quả sinh kháng thể bảo vệ càng cao.'
  }
];

export const VACCINE_RULES = [
  {
    title: 'Quy tắc trước khi đưa bé đi tiêm',
    points: [
      'Theo dõi sức khỏe bé 3 ngày trước tiêm: Bé không sốt, không ho nặng, tiêu hóa bình thường.',
      'Mang theo Sổ tiêm chủng cá nhân của bé.',
      'Vệ sinh thân thể bé sạch sẽ, mặc quần áo thoáng mát dễ cởi bộc lộ vị trí tiêm.',
      'Khai báo đầy đủ tiền sử dị ứng, sinh thiếu tháng hoặc bệnh lý của bé cho Bác sĩ khám phân loại.'
    ]
  },
  {
    title: 'Quy tắc theo dõi sau khi tiêm chủng',
    points: [
      'Theo dõi TẠI CƠ SỞ TIÊM CHỦNG ít nhất 30 phút để phát hiện sớm phản ứng vệ/sốc tức thì.',
      'Theo dõi TẠI NHÀ liên tục trong 24 - 48 giờ sau tiêm: Thân nhiệt, tinh thần, cữ bú, nếp thở, vị trí tiêm.',
      'Nếu sốt 38.5°C: Uống Paracetamol 10-15mg/kg mỗi 4-6h. Chườm mát trán, nách, bẹn.',
      'KHÔNG đắp chanh, khoai tây, hay bôi thuốc dân gian lên vết tiêm.'
    ]
  },
  {
    title: '🚨 Dấu hiệu CẦN ĐƯA BÉ ĐI CẤP CỨU GẤP',
    points: [
      'Sốt cao liên tục >39°C không hạ dù đã uống thuốc hạ sốt.',
      'Trẻ lơ mơ, li bì, khó đánh thức, co giật hoặc khóc thét liên tục >3 tiếng.',
      'Trẻ khó thở, thở gấp, tím tái môi và đầu ngón tay.',
      'Vết tiêm sưng to bọng mủ lan rộng trên 2cm, phát ban mề đai toàn thân.'
    ]
  }
];
