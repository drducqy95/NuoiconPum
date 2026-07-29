export interface NutritionAndWeaningInfo {
  milkAndCalories: string;       // Nhu cầu sữa & Năng lượng
  mealsCount: string;            // Số bữa ăn dặm & sữa trong ngày
  essentialNutrients: string[];  // Các nhóm dinh dưỡng quan trọng
  recommendedFoods: string[];    // Danh sách THỰC PHẨM NÊN ĂN
  foodsToAvoid: string[];        // Danh sách THỰC PHẨM CẦN TRÁNH
  weaningTips: string;           // Mẹo ăn dặm chuẩn khoa học
}

export interface SkillAndGameInfo {
  targetSkills: string[];        // Các kỹ năng trọng tâm cần rèn luyện
  recommendedGames: Array<{      // Danh sách các trò chơi tương tác
    gameTitle: string;
    howToPlay: string;
    benefit: string;
  }>;
  parentTips: string;            // Lời khuyên cho bố mẹ khi chơi cùng bé
}

export interface DevelopmentStage {
  id: string;
  title: string;
  ageRange: string;
  milestones: string[];
  nutritionAndWeaning?: NutritionAndWeaningInfo;
  skillsAndGames?: SkillAndGameInfo;
  commonIssues: { title: string; description: string; solution: string }[];
}

export const fetchStagesData = () => import("./json/stages.json").then(m => m.default as DevelopmentStage[]);
