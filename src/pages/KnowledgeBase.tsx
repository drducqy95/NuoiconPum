import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  Stethoscope, 
  Pill, 
  Baby, 
  ArrowLeft,
  CheckCircle2,
  Heart,
  Menu,
  Moon,
  Clock,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { stagesData } from '../data/stages';
import { pregnancyData } from '../data/pregnancy';
import { abnormalConditions, firstAidGuides, medicinesList, medicineCabinetItems } from '../data/healthKnowledge';
import { sleepKnowledgeData } from '../data/sleepKnowledge';

type CategoryId = 'pregnancy' | 'stages' | 'sleep' | 'abnormal' | 'firstaid' | 'medicine';

interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: React.ComponentType<any>;
  desc: string;
  colorClass: string;
  bgClass: string;
  iconColorClass: string;
  borderColorClass: string;
  tagColorClass: string;
}

const CATEGORIES: CategoryInfo[] = [
  { 
    id: 'pregnancy', 
    name: 'Thai kỳ', 
    icon: Baby, 
    desc: 'Theo dõi sự phát triển của thai nhi từng tuần, các lưu ý vàng và các mốc khám thai siêu âm quan trọng nhất cho mẹ bầu.',
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50 text-violet-700',
    iconColorClass: 'text-violet-500 bg-violet-50',
    borderColorClass: 'group-hover:border-violet-200 hover:border-violet-300',
    tagColorClass: 'bg-violet-100 text-violet-800 border-violet-200'
  },
  { 
    id: 'stages', 
    name: 'Giai đoạn phát triển', 
    icon: Activity, 
    desc: 'Cột mốc phát triển thể chất, vận động thô - tinh, ngôn ngữ và nhận thức của trẻ theo từng giai đoạn tháng tuổi.',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50 text-orange-700',
    iconColorClass: 'text-orange-500 bg-orange-50',
    borderColorClass: 'group-hover:border-orange-200 hover:border-orange-300',
    tagColorClass: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  { 
    id: 'sleep', 
    name: 'Tập tự ngủ', 
    icon: Moon, 
    desc: 'Cẩm nang rèn nếp ngủ ngoan chuẩn khoa học, nhận biết dấu hiệu buồn ngủ, trình tự ngủ 4 bước và các phương pháp 5S/Nút chờ/GNS/Ferber.',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50 text-indigo-700',
    iconColorClass: 'text-indigo-500 bg-indigo-50',
    borderColorClass: 'group-hover:border-indigo-200 hover:border-indigo-300',
    tagColorClass: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  { 
    id: 'abnormal', 
    name: 'Mẹo & Bệnh', 
    icon: AlertTriangle, 
    desc: 'Nhận biết các dấu hiệu bất thường thường gặp ở trẻ nhỏ (sốt, ho, rôm sảy...), cách chăm sóc tại nhà và cảnh báo khẩn cấp.',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 text-amber-700',
    iconColorClass: 'text-amber-500 bg-amber-50',
    borderColorClass: 'group-hover:border-amber-200 hover:border-amber-300',
    tagColorClass: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  { 
    id: 'firstaid', 
    name: 'Sơ cấp cứu', 
    icon: Stethoscope, 
    desc: 'Cẩm nang hướng dẫn từng bước sơ cứu chuẩn khoa học cho các tai nạn khẩn cấp thường gặp ở trẻ nhỏ như sặc sữa, hóc dị vật, bỏng.',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50 text-red-700',
    iconColorClass: 'text-red-500 bg-red-50',
    borderColorClass: 'group-hover:border-red-200 hover:border-red-300',
    tagColorClass: 'bg-red-100 text-red-800 border-red-200'
  },
  { 
    id: 'medicine', 
    name: 'Tủ thuốc y tế', 
    icon: Pill, 
    desc: 'Bí quyết chuẩn bị tủ thuốc gia đình đầy đủ, các loại thuốc hạ sốt, bổ sung thông dụng cùng chỉ dẫn an toàn liều lượng chuẩn.',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 text-blue-700',
    iconColorClass: 'text-blue-500 bg-blue-50',
    borderColorClass: 'group-hover:border-blue-200 hover:border-blue-300',
    tagColorClass: 'bg-blue-100 text-blue-800 border-blue-200'
  },
];

export const KnowledgeBase: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Accordion Expand/Collapse State per block ID
  // Default first block to expanded (true), others collapsed (false)
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

  // Global All Expanded / Collapsed toggle
  const [isAllExpanded, setIsAllExpanded] = useState<boolean>(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine active category (defaulting to 'pregnancy')
  const activeCatId = (category && CATEGORIES.some(c => c.id === category)) ? category : 'pregnancy';
  const activeCat = CATEGORIES.find(c => c.id === activeCatId)!;
  const Icon = activeCat.icon;

  const isBlockExpanded = (id: string, defaultState: boolean = false) => {
    if (expandedBlocks[id] !== undefined) {
      return expandedBlocks[id];
    }
    return isAllExpanded || defaultState;
  };

  const toggleBlock = (id: string, defaultState: boolean = false) => {
    setExpandedBlocks(prev => {
      const current = prev[id] !== undefined ? prev[id] : (isAllExpanded || defaultState);
      return { ...prev, [id]: !current };
    });
  };

  const toggleAll = () => {
    const nextState = !isAllExpanded;
    setIsAllExpanded(nextState);
    // Clear individual overrides to inherit global state
    setExpandedBlocks({});
  };

  return (
    <div className="flex-1 overflow-y-auto w-full bg-gray-50 pb-12 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col max-w-5xl mx-auto items-start">
          
          {/* Header block with Back, Menu icon -> Dropdown */}
          <div className="flex items-center justify-between mb-6 relative z-20 w-full">
            <div className="flex items-center space-x-3" ref={dropdownRef}>
              {/* Back button */}
              <Link 
                to="/" 
                className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-colors focus:outline-none"
                title="Về trang chủ"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              {/* Dropdown menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2.5 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:border-rose-300 transition-all focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                  title="Danh mục kiến thức"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </button>

                {/* Dropdown Menu Items */}
                {isOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Chọn danh mục kiến thức
                    </div>
                    {CATEGORIES.map((cat) => {
                      const CatIcon = cat.icon;
                      const isActive = cat.id === activeCatId;
                      return (
                        <Link
                          key={cat.id}
                          to={`/knowledge/${cat.id}`}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center px-4 py-2.5 text-xs font-bold transition-all ${
                            isActive 
                              ? 'bg-rose-50 text-rose-700 border-l-4 border-rose-600' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <CatIcon className={`w-4 h-4 mr-2.5 ${isActive ? 'text-rose-600' : 'text-gray-400'}`} />
                          <span>{cat.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Title Badge of Active Category */}
              <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs">
                <Icon className={`w-5 h-5 ${activeCat.colorClass}`} />
                <h1 className="text-sm sm:text-base font-extrabold text-gray-900">{activeCat.name}</h1>
              </div>
            </div>

            {/* Toggle All Expand/Collapse Button */}
            <button
              type="button"
              onClick={toggleAll}
              className="bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs px-3 py-2 rounded-xl border border-gray-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {isAllExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span className="hidden sm:inline">{isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}</span>
            </button>
          </div>

          {/* Description Card */}
          <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs mb-6 space-y-2">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              {activeCat.desc}
            </p>
          </div>

          {/* Dynamic Content Views */}
          <div className="w-full">
            
            {/* 1. THAI KỲ */}
            {activeCat.id === 'pregnancy' && (
              <div className="space-y-3.5">
                {pregnancyData.map((milestone, idx) => {
                  const expanded = isBlockExpanded(milestone.id, idx === 0);
                  return (
                    <div key={milestone.id} className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => toggleBlock(milestone.id, idx === 0)}
                        className="w-full px-5 py-3.5 bg-violet-50/30 hover:bg-violet-50/60 flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <h2 className="text-sm sm:text-base font-extrabold text-violet-900 flex items-center">
                          <Heart className="w-4 h-4 mr-2 text-violet-500 flex-shrink-0" />
                          {milestone.period}
                        </h2>
                        <div className="flex items-center space-x-2 text-xs font-bold text-violet-700">
                          <span className="hidden sm:inline">{expanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
                          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {expanded && (
                        <div className="p-5 space-y-4 border-t border-gray-100 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 flex items-center">
                                <span className="w-1.5 h-3 bg-violet-500 rounded-full mr-2"></span>
                                Sự phát triển của thai nhi
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{milestone.babyDevelopment}</p>
                            </div>
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 flex items-center">
                                <span className="w-1.5 h-3 bg-pink-500 rounded-full mr-2"></span>
                                Thay đổi cơ thể mẹ
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{milestone.momChanges}</p>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-4">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-3 flex items-center">
                              📌 Xét nghiệm & Mốc khám quan trọng
                            </h3>
                            <div className="space-y-3">
                              {milestone.checkupsAndTests.map((item, cIdx) => (
                                <div key={cIdx} className="text-xs sm:text-sm text-gray-600 border-l-2 border-violet-300 pl-3.5 py-0.5">
                                  <strong className="text-gray-900 block font-semibold">{item.title}</strong>
                                  <span className="block mt-1 leading-relaxed">{item.description}</span>
                                  {item.ultrasoundNotes && (
                                    <div className="bg-amber-50 p-2.5 mt-2 rounded-lg border border-amber-100 text-amber-850 text-xs flex items-start space-x-2">
                                      <span className="text-base leading-none">💡</span>
                                      <div>
                                        <span className="font-bold text-amber-900 block mb-0.5">Lưu ý siêu âm:</span>
                                        {item.ultrasoundNotes}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-violet-50/30 border border-violet-100 rounded-xl p-3.5">
                            <h3 className="text-xs sm:text-sm font-bold text-violet-900 mb-2 flex items-center">
                              🌟 Lời khuyên vàng dưỡng thai
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {milestone.tips.map((tip, tIdx) => (
                                <li key={tIdx} className="flex items-start text-xs sm:text-sm text-gray-600">
                                  <CheckCircle2 className="w-4 h-4 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. GIAI ĐOẠN PHÁT TRIỂN & ĂN DẶM CỤ THỂ TỪNG THÁNG */}
            {activeCat.id === 'stages' && (
              <div className="space-y-3.5">
                {stagesData.map((stage, idx) => {
                  const expanded = isBlockExpanded(stage.id, idx === 0);
                  return (
                    <div key={stage.id} className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                      
                      {/* Accordion Header Bar */}
                      <button
                        type="button"
                        onClick={() => toggleBlock(stage.id, idx === 0)}
                        className="w-full px-5 py-3.5 bg-orange-50/20 hover:bg-orange-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0"></span>
                          <h2 className="text-sm sm:text-base font-extrabold text-gray-900">{stage.title}</h2>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-orange-700 px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-200">
                            Độ tuổi: {stage.ageRange}
                          </span>
                          <div className="flex items-center text-xs font-bold text-slate-500 ml-1">
                            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {expanded && (
                        <div className="p-5 space-y-4 border-t border-gray-100 animate-fade-in">
                          
                          {/* Milestones */}
                          <div>
                            <h3 className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">Cột mốc phát triển thể chất & tư duy</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {stage.milestones.map((item, mIdx) => (
                                <div key={mIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start space-x-2">
                                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Nutrition & Weaning Block */}
                          {stage.nutritionAndWeaning && (
                            <div className="border-t border-gray-100 pt-4 space-y-3">
                              <h3 className="text-xs sm:text-sm font-extrabold text-orange-950 flex items-center bg-orange-100/60 px-3 py-1.5 rounded-lg border border-orange-200/80">
                                🥣 Dinh Dưỡng & Chế Độ Ăn DẶM Chuẩn Khoa Học
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                
                                <div className="bg-orange-50/40 p-3 rounded-lg border border-orange-100 space-y-1">
                                  <strong className="text-orange-900 font-bold block text-[11px]">🥛 Nhu cầu Sữa & Số bữa ăn:</strong>
                                  <p className="text-gray-800 font-medium">{stage.nutritionAndWeaning.milkAndCalories}</p>
                                  <p className="text-orange-950 font-bold mt-1">🍽️ {stage.nutritionAndWeaning.mealsCount}</p>
                                </div>

                                <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 space-y-1">
                                  <strong className="text-emerald-900 font-bold block text-[11px]">🥑 Thực Phẩm NÊN ĂN:</strong>
                                  <ul className="space-y-0.5">
                                    {stage.nutritionAndWeaning.recommendedFoods.map((food, fIdx) => (
                                      <li key={fIdx} className="text-emerald-950 font-semibold">{food}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-rose-50/40 p-3 rounded-lg border border-rose-100 space-y-1">
                                  <strong className="text-rose-900 font-bold block text-[11px]">⛔ Thực Phẩm CẦN TRÁNH:</strong>
                                  <ul className="space-y-0.5">
                                    {stage.nutritionAndWeaning.foodsToAvoid.map((bad, bIdx) => (
                                      <li key={bIdx} className="text-rose-950 font-semibold">{bad}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-indigo-50/40 p-3 rounded-lg border border-indigo-100 space-y-1">
                                  <strong className="text-indigo-900 font-bold block text-[11px]">💡 Nguyên Tắc & Mẹo Ăn Dặm:</strong>
                                  <p className="text-indigo-950 font-medium leading-relaxed">{stage.nutritionAndWeaning.weaningTips}</p>
                                </div>

                              </div>
                            </div>
                          )}

                          {/* Skills & Games Block */}
                          {stage.skillsAndGames && (
                            <div className="border-t border-gray-100 pt-4 space-y-3">
                              <h3 className="text-xs sm:text-sm font-extrabold text-indigo-950 flex items-center bg-indigo-100/60 px-3 py-1.5 rounded-lg border border-indigo-200/80">
                                🎮 Kỹ Năng Cần Rèn Luyện & Trò Chơi Tương Tác Phát Triển Trí Tuệ
                              </h3>

                              {/* Target skills tags */}
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <span className="font-bold text-gray-700">🎯 Kỹ năng trọng tâm:</span>
                                {stage.skillsAndGames.targetSkills.map((sk, sIdx) => (
                                  <span key={sIdx} className="bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200 text-[11px]">
                                    {sk}
                                  </span>
                                ))}
                              </div>

                              {/* Recommended Games Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {stage.skillsAndGames.recommendedGames.map((game, gIdx) => (
                                  <div key={gIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                                    <h4 className="font-extrabold text-indigo-950 text-xs flex items-center">
                                      {game.gameTitle}
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed font-medium">
                                      <strong>Cách chơi:</strong> {game.howToPlay}
                                    </p>
                                    <div className="bg-indigo-50/60 p-2 rounded-lg text-indigo-950 font-bold text-[11px] border border-indigo-100">
                                      ✨ Lợi ích trí tuệ: {game.benefit}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Parent tips */}
                              <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-950">
                                <strong>💡 Lời khuyên chơi cùng bé:</strong> {stage.skillsAndGames.parentTips}
                              </div>
                            </div>
                          )}

                          {/* Common Issues */}
                          <div className="border-t border-gray-100 pt-4">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">⚠️ Vấn đề thường gặp & Cách xử trí</h3>
                            <div className="space-y-3">
                              {stage.commonIssues.map((issue, iIdx) => (
                                <div key={iIdx} className="text-xs sm:text-sm text-gray-600 border-l-2 border-orange-200 pl-4 py-1">
                                  <strong className="text-gray-900 block font-semibold text-sm mb-1">{issue.title}</strong>
                                  <span className="block text-xs sm:text-sm leading-relaxed mb-2">{issue.description}</span>
                                  <div className="bg-orange-50/50 p-2.5 rounded-lg border border-orange-100 text-orange-900 text-xs">
                                    <span className="font-bold block mb-0.5">💡 Hướng dẫn cho ba mẹ:</span>
                                    {issue.solution}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. TẬP TỰ NGỦ (SLEEP TRAINING GUIDE) */}
            {activeCat.id === 'sleep' && (
              <div className="space-y-3.5">
                
                {/* 1. Sleep Cues */}
                {(() => {
                  const expanded = isBlockExpanded('sleep_cues', true);
                  return (
                    <div className="bg-white rounded-2xl border border-indigo-200 shadow-2xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleBlock('sleep_cues', true)}
                        className="w-full px-5 py-3.5 bg-indigo-50/40 hover:bg-indigo-50/70 flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <h3 className="text-sm sm:text-base font-extrabold text-indigo-950 flex items-center">
                          <Moon className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                          1. Nhận Biết Dấu Hiệu Buồn Ngủ (Sleep Cues)
                        </h3>
                        {expanded ? <ChevronUp size={18} className="text-indigo-600" /> : <ChevronDown size={18} className="text-indigo-600" />}
                      </button>

                      {expanded && (
                        <div className="p-5 border-t border-indigo-100 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                              <strong className="text-emerald-900 font-bold block text-xs">🟢 DẤU HIỆU SỚM (Mẹ nên cho bé đi ngủ ngay):</strong>
                              <ul className="space-y-1">
                                {sleepKnowledgeData.sleepCues.earlyCues.map((c, idx) => (
                                  <li key={idx} className="flex items-start text-emerald-950">
                                    <span className="mr-1.5 font-bold text-emerald-600">•</span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200 space-y-2">
                              <strong className="text-rose-900 font-bold block text-xs">🚨 DẤU HIỆU MUỘN (Bé đã bị QUÁ GIẤC - Overtired):</strong>
                              <ul className="space-y-1">
                                {sleepKnowledgeData.sleepCues.lateCues.map((c, idx) => (
                                  <li key={idx} className="flex items-start text-rose-950 font-medium">
                                    <span className="mr-1.5 text-rose-600">⚠</span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2. 4-Step Bedtime Routine */}
                {(() => {
                  const expanded = isBlockExpanded('bedtime_routine', false);
                  return (
                    <div className="bg-white rounded-2xl border border-indigo-200 shadow-2xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleBlock('bedtime_routine', false)}
                        className="w-full px-5 py-3.5 bg-indigo-50/40 hover:bg-indigo-50/70 flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <h3 className="text-sm sm:text-base font-extrabold text-indigo-950 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                          2. Trình Tự Ngủ 4 Bước Chuẩn Khoa Học (Bedtime Routine)
                        </h3>
                        {expanded ? <ChevronUp size={18} className="text-indigo-600" /> : <ChevronDown size={18} className="text-indigo-600" />}
                      </button>

                      {expanded && (
                        <div className="p-5 border-t border-indigo-100 animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {sleepKnowledgeData.bedtimeRoutine.map((step) => (
                              <div key={step.stepNumber} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                                <h4 className="font-extrabold text-indigo-950 text-xs">{step.title}</h4>
                                <p className="text-gray-700 leading-relaxed font-medium">{step.action}</p>
                                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-900 font-bold text-[11px]">
                                  💡 {step.tips}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 3. Sleep Training Methods */}
                {(() => {
                  const expanded = isBlockExpanded('sleep_methods', true);
                  return (
                    <div className="bg-white rounded-2xl border border-indigo-200 shadow-2xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleBlock('sleep_methods', true)}
                        className="w-full px-5 py-3.5 bg-indigo-50/40 hover:bg-indigo-50/70 flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <h3 className="text-sm sm:text-base font-extrabold text-indigo-950 flex items-center">
                          🌟 3. Các Phương Pháp Tập Tự Ngủ Phổ Biến (GNS, 5S, Nút Chờ...)
                        </h3>
                        {expanded ? <ChevronUp size={18} className="text-indigo-600" /> : <ChevronDown size={18} className="text-indigo-600" />}
                      </button>

                      {expanded && (
                        <div className="p-5 border-t border-indigo-100 space-y-4 text-xs animate-fade-in">
                          {sleepKnowledgeData.methods.map((m, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                                <h4 className="font-extrabold text-indigo-950 text-sm">{m.name}</h4>
                                <span className="bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                                  {m.suitableAge}
                                </span>
                              </div>
                              <p className="text-gray-700 font-medium italic">{m.description}</p>
                              <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                                <strong className="text-slate-900 font-bold block mb-1">Các bước thực hiện:</strong>
                                {m.steps.map((s, sIdx) => (
                                  <div key={sIdx} className="flex items-start text-gray-700 font-medium">
                                    <span className="mr-1.5 text-indigo-600 font-bold">•</span>
                                    <span>{s}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="text-indigo-900 font-bold bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-[11px]">
                                ✨ {m.prosAndCons}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 4. EASY Schedules Summary & Safe Sleep Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* EASY Schedules */}
                  <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-2xs space-y-3">
                    <h3 className="text-sm font-extrabold text-indigo-950 border-b border-indigo-100 pb-2">
                      ⏰ Tóm Tắt Nếp Sinh Hoạt EASY Theo Tháng
                    </h3>
                    <div className="space-y-2 text-xs">
                      {sleepKnowledgeData.easySchedulesSummary.map((easy, eIdx) => (
                        <div key={eIdx} className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                          <div>
                            <div className="font-extrabold text-indigo-950 text-xs">{easy.name} ({easy.age})</div>
                            <div className="text-[11px] text-gray-600 font-medium">{easy.wakeWindow}</div>
                          </div>
                          <span className="bg-white text-indigo-900 font-bold px-2 py-1 rounded-lg border border-indigo-200 text-[10px]">
                            {easy.napsCount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safe Sleep Rules */}
                  <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-2xs space-y-3">
                    <h3 className="text-sm font-extrabold text-indigo-950 border-b border-indigo-100 pb-2 flex items-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
                      Quy Tắc Môi Trường Ngủ An Toàn (Chống SIDS)
                    </h3>
                    <div className="space-y-2 text-xs">
                      {sleepKnowledgeData.safeSleepRules.map((rule, rIdx) => (
                        <div key={rIdx} className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-emerald-950 font-medium leading-relaxed">
                          {rule}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 4. MẸO & BỆNH */}
            {activeCat.id === 'abnormal' && (
              <div className="space-y-3.5">
                {abnormalConditions.map((condition, idx) => {
                  const expanded = isBlockExpanded(condition.id, idx === 0);
                  return (
                    <div key={condition.id} className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleBlock(condition.id, idx === 0)}
                        className="w-full px-5 py-3.5 bg-amber-50/20 hover:bg-amber-50/50 flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0" />
                          {condition.title}
                        </h3>
                        {expanded ? <ChevronUp size={18} className="text-amber-600" /> : <ChevronDown size={18} className="text-amber-600" />}
                      </button>

                      {expanded && (
                        <div className="p-5 space-y-4 border-t border-gray-100 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 flex items-center">
                                <span className="w-1.5 h-3 bg-amber-500 rounded-full mr-2"></span>
                                Triệu chứng & Biểu hiện
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{condition.symptoms}</p>
                            </div>
                            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 flex items-center">
                                <span className="w-1.5 h-3 bg-emerald-500 rounded-full mr-2"></span>
                                Hướng dẫn chăm sóc tại nhà
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{condition.homeCare}</p>
                            </div>
                          </div>

                          <div className="bg-rose-50 border border-rose-100 rounded-lg p-3.5">
                            <h4 className="text-xs sm:text-sm font-bold text-rose-900 mb-1.5 flex items-center">
                              🚨 Khi nào cần đưa trẻ đi khám Bác sĩ ngay?
                            </h4>
                            <p className="text-xs sm:text-sm text-rose-950 font-medium leading-relaxed">{condition.whenToSeeDoctor}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. SƠ CẤP CỨU */}
            {activeCat.id === 'firstaid' && (
              <div className="space-y-3.5">
                {firstAidGuides.map((guide, idx) => {
                  const expanded = isBlockExpanded(guide.id, idx === 0);
                  return (
                    <div key={guide.id} className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleBlock(guide.id, idx === 0)}
                        className="w-full px-5 py-3.5 bg-red-50/20 hover:bg-red-50/50 flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <h3 className="text-sm sm:text-base font-bold text-red-950 flex items-center">
                          <Stethoscope className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                          {guide.title}
                        </h3>
                        {expanded ? <ChevronUp size={18} className="text-red-600" /> : <ChevronDown size={18} className="text-red-600" />}
                      </button>

                      {expanded && (
                        <div className="p-5 space-y-4 border-t border-gray-100 animate-fade-in">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5">
                            <strong className="text-xs sm:text-sm font-bold text-red-900 block mb-1">⚡ QUY TẮC VÀNG TỐI QUAN TRỌNG:</strong>
                            <p className="text-xs sm:text-sm text-red-950 font-semibold leading-relaxed">{guide.goldenRule}</p>
                          </div>

                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">📋 Các bước sơ cứu khẩn cấp từng bước:</h4>
                            <div className="space-y-2.5">
                              {guide.steps.map((step, sIdx) => (
                                <div key={sIdx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start space-x-3 text-xs sm:text-sm">
                                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 font-extrabold flex items-center justify-center flex-shrink-0 text-xs">
                                    {sIdx + 1}
                                  </span>
                                  <span className="text-gray-700 font-medium leading-relaxed mt-0.5">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5">
                            <h4 className="text-xs sm:text-sm font-bold text-amber-900 mb-2 flex items-center">
                              ⚠️ CẢNH BÁO TỐI KỴ (NHỮNG VIỆC KHÔNG ĐƯỢC LÀM):
                            </h4>
                            <ul className="space-y-1.5">
                              {guide.warnings.map((warn, wIdx) => (
                                <li key={wIdx} className="flex items-start text-xs sm:text-sm text-amber-950 font-medium">
                                  <span className="text-amber-600 mr-2 font-bold">•</span>
                                  <span>{warn}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 6. TỦ THUỐC Y TẾ */}
            {activeCat.id === 'medicine' && (
              <div className="space-y-4">
                
                {/* List of Essential Items */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-3">
                  <h3 className="text-base font-bold text-blue-950 border-b border-gray-100 pb-2 flex items-center">
                    📦 Danh Mục Vật Dụng Cần Có Trong Tủ Thuốc Gia Đình
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    {medicineCabinetItems.map((item, idx) => (
                      <div key={idx} className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-center space-x-2 text-blue-950 font-medium">
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medicines List & Safety Dosage */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900">💊 Hướng Dẫn Sử Dụng & Liều Dùng Thuốc An Toàn</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {medicinesList.map((med, idx) => {
                      const expanded = isBlockExpanded(`med_${idx}`, true);
                      return (
                        <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                          <button
                            type="button"
                            onClick={() => toggleBlock(`med_${idx}`, true)}
                            className="w-full px-5 py-3 bg-blue-50/20 hover:bg-blue-50/50 flex items-center justify-between text-left transition-colors cursor-pointer"
                          >
                            <h4 className="text-sm sm:text-base font-extrabold text-blue-900">
                              {med.name}
                            </h4>
                            {expanded ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-blue-600" />}
                          </button>

                          {expanded && (
                            <div className="p-5 space-y-3 border-t border-gray-100 animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <strong className="text-gray-900 font-bold block mb-1">Công dụng:</strong>
                                  <p className="text-gray-700 font-medium">{med.usage}</p>
                                </div>
                                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-blue-950">
                                  <strong className="text-blue-900 font-bold block mb-1">Liều dùng & Cách dùng:</strong>
                                  <p className="font-semibold">{med.dosageNotes}</p>
                                </div>
                              </div>
                              <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-rose-950 text-xs sm:text-sm font-medium flex items-start space-x-2">
                                <span className="text-rose-600 font-bold flex-shrink-0">⚠️ Lưu ý an toàn:</span>
                                <span>{med.warnings}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
