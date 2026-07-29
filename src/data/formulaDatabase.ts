export interface FormulaNutrients {
  // 1. Năng lượng & Nhóm Đại lượng
  energyKcal: number;             // Năng lượng (kcal)
  proteinG: number;                // Chất đạm (g)
  fatG: number;                    // Chất béo tổng (g)
  saturatedFatG?: number;          // Axit béo no (g)
  omega3Mg?: number;               // Alpha-Linolenic acid (Omega-3) (mg)
  omega6Mg?: number;               // Linoleic acid (Omega-6) (mg)
  dhaMg: number;                   // DHA (mg)
  araMg?: number;                  // ARA (mg)
  carbG: number;                   // Carbohydrate (g)
  lactoseG?: number;               // Lactose (g)
  fiberGosFosG?: number;           // Xơ GOS/FOS (g)

  // 2. Khoáng chất (Minerals)
  calciumMg: number;               // Canxi (mg)
  phosphorusMg: number;            // Phốt pho (mg)
  ironMg: number;                  // Sắt (mg)
  zincMg: number;                  // Kẽm (mg)
  magnesiumMg?: number;            // Ma-giê (mg)
  sodiumMg?: number;               // Natri (mg)
  potassiumMg?: number;            // Kali (mg)
  chlorideMg?: number;             // Clo (mg)
  iodineUg?: number;               // I-ốt (mcg)
  copperUg?: number;               // Đồng (mcg)
  seleniumUg?: number;             // Selen (mcg)

  // 3. Vitamin (Vitamins)
  vitaminAUg: number;              // Vitamin A (mcg RE)
  vitaminD3Ug: number;             // Vitamin D3 (mcg)
  vitaminEMg?: number;             // Vitamin E (mg)
  vitaminK1Ug?: number;            // Vitamin K1 (mcg)
  vitaminCMg: number;              // Vitamin C (mg)
  vitaminB1Ug?: number;            // Vitamin B1 (mcg)
  vitaminB2Ug?: number;            // Vitamin B2 (mcg)
  vitaminB3Mg?: number;            // Niacin / B3 (mg)
  vitaminB6Ug?: number;            // Vitamin B6 (mcg)
  folicAcidUg?: number;            // Axit Folic / B9 (mcg)
  vitaminB12Ug?: number;           // Vitamin B12 (mcg)
  biotinUg?: number;               // Biotin / B7 (mcg)
  pantothenicAcidMg?: number;      // B5 (mg)

  // 4. Dưỡng chất sinh học & Kháng thể
  hmo2FlMg?: number;               // 2'-FL HMO (mg)
  lactoferrinMg?: number;          // Lactoferrin (mg)
  nucleotidesMg?: number;          // Nucleotides (mg)
  cholineMg?: number;              // Choline (mg)
  taurineMg?: number;              // Taurine (mg)
  luteinUg?: number;               // Lutein (mcg)
  arginineMg?: number;             // Arginine (mg)
  vitaminK2Ug?: number;            // Vitamin K2 (mcg)
  probioticsCfu?: string;          // Men vi sinh
}

export interface FormulaBrand {
  id: string;
  name: string;                    // Tên dòng sữa
  brand: string;                   // Hãng sản xuất
  originCountry: string;           // Xuất xứ
  stage: string;                   // Đối tượng sử dụng
  stageCode: 'stage1' | 'stage2' | 'stage3' | 'special';
  nutrientsPer100ml: FormulaNutrients; // Hàm lượng trên 100ml sữa đã pha
  scoopRatio: string;              // Tỷ lệ pha chuẩn
  waterTempC: number;              // Nhiệt độ nước pha (°C)
  highlights: string[];            // Điểm nổi bật
  description: string;             // Mô tả sản phẩm
}


export const fetchFormulaDatabase = () => import('./json/formulaDatabase.json').then(m => m.default as FormulaBrand[]);

// Hàm tìm kiếm sữa công thức theo từ khóa & đối tượng
export function searchFormulaBrands(db: FormulaBrand[], queryStr: string = '', stageFilter: string = 'all'): FormulaBrand[] {
  const q = queryStr.trim().toLowerCase();
  return db.filter((b) => {
    const matchesQuery =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.brand.toLowerCase().includes(q) ||
      b.originCountry.toLowerCase().includes(q) ||
      b.highlights.some((h) => h.toLowerCase().includes(q));

    const matchesStage = stageFilter === 'all' || b.stageCode === stageFilter;

    return matchesQuery && matchesStage;
  });
}

export function getFormulaBrandById(db: FormulaBrand[], id: string): FormulaBrand | undefined {
  return db.find((b) => b.id === id);
}

// Bảng Nhu cầu Khuyến nghị Hàng ngày (RDA - Recommended Daily Allowance) tham khảo cho bé dưới 12 tháng
export interface DailyNutrientRDA {
  stageName: string;
  energyKcal: number;   // kcal/ngày
  proteinG: number;      // g/ngày
  fatG: number;          // g/ngày
  dhaMg: number;         // mg/ngày
  calciumMg: number;     // mg/ngày
  ironMg: number;        // mg/ngày
  zincMg: number;        // mg/ngày
  vitaminD3Ug: number;   // mcg/ngày
  vitaminCMg: number;    // mg/ngày
}

export const INFANT_RDA_0_6M: DailyNutrientRDA = {
  stageName: 'Trẻ 0 - 6 tháng tuổi',
  energyKcal: 500,
  proteinG: 11,
  fatG: 30,
  dhaMg: 100,
  calciumMg: 300,
  ironMg: 0.5,
  zincMg: 2.0,
  vitaminD3Ug: 10, // 400 IU
  vitaminCMg: 40,
};

// Hàm tính toán tổng hàm lượng vi chất bé nạp trong ngày từ sữa công thức
export function calculateDailyNutrients(
  brand: FormulaBrand,
  totalFormulaMl: number
): {
  volumeMl: number;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  dhaMg: number;
  calciumMg: number;
  ironMg: number;
  zincMg: number;
  vitaminD3Ug: number;
  vitaminCMg: number;
  hmo2FlMg: number;
  percentRdaEnergy: number;
  percentRdaProtein: number;
  percentRdaCalcium: number;
  percentRdaDha: number;
  percentRdaVitaminD: number;
} {
  const factor = totalFormulaMl / 100;
  const n = brand.nutrientsPer100ml;

  const energyKcal = Math.round(n.energyKcal * factor);
  const proteinG = Number((n.proteinG * factor).toFixed(1));
  const fatG = Number((n.fatG * factor).toFixed(1));
  const carbG = Number((n.carbG * factor).toFixed(1));
  const dhaMg = Math.round((n.dhaMg || 0) * factor);
  const calciumMg = Math.round((n.calciumMg || 0) * factor);
  const ironMg = Number(((n.ironMg || 0) * factor).toFixed(2));
  const zincMg = Number(((n.zincMg || 0) * factor).toFixed(2));
  const vitaminD3Ug = Number(((n.vitaminD3Ug || 0) * factor).toFixed(1));
  const vitaminCMg = Number(((n.vitaminCMg || 0) * factor).toFixed(1));
  const hmo2FlMg = Math.round((n.hmo2FlMg || 0) * factor);

  return {
    volumeMl: totalFormulaMl,
    energyKcal,
    proteinG,
    fatG,
    carbG,
    dhaMg,
    calciumMg,
    ironMg,
    zincMg,
    vitaminD3Ug,
    vitaminCMg,
    hmo2FlMg,
    percentRdaEnergy: Math.min(100, Math.round((energyKcal / INFANT_RDA_0_6M.energyKcal) * 100)),
    percentRdaProtein: Math.min(100, Math.round((proteinG / INFANT_RDA_0_6M.proteinG) * 100)),
    percentRdaCalcium: Math.min(100, Math.round((calciumMg / INFANT_RDA_0_6M.calciumMg) * 100)),
    percentRdaDha: Math.min(100, Math.round((dhaMg / INFANT_RDA_0_6M.dhaMg) * 100)),
    percentRdaVitaminD: Math.min(100, Math.round((vitaminD3Ug / INFANT_RDA_0_6M.vitaminD3Ug) * 100)),
  };
}

