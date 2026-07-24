import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  Stethoscope, 
  Pill, 
  Baby, 
  ChevronRight, 
  ChevronDown,
  BookOpen, 
  ArrowLeft,
  CheckCircle2,
  Heart,
  Info,
  Menu
} from 'lucide-react';
import { stagesData } from '../data/stages';
import { pregnancyData } from '../data/pregnancy';
import { abnormalConditions, firstAidGuides, medicinesList, medicineCabinetItems } from '../data/healthKnowledge';

type CategoryId = 'pregnancy' | 'stages' | 'abnormal' | 'firstaid' | 'medicine';

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

  // Determine active category (defaulting to the first category 'pregnancy' if invalid or missing)
  const activeCatId = (category && CATEGORIES.some(c => c.id === category)) ? category : 'pregnancy';
  const activeCat = CATEGORIES.find(c => c.id === activeCatId)!;
  const Icon = activeCat.icon;

  return (
    <div className="flex-1 overflow-y-auto w-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-sans">
        <div className="flex flex-col max-w-4xl mx-auto items-start">
          
          {/* Header block with Back, Menu icon -> Dropdown */}
          <div className="flex items-center space-x-3 mb-6 relative z-20 w-full" ref={dropdownRef}>
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

              {/* Dropdown Options */}
              {isOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-30 divide-y divide-gray-50">
                  {CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = cat.id === activeCat.id;
                    return (
                      <Link
                        key={cat.id}
                        to={`/knowledge/${cat.id}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                          isSelected 
                            ? 'bg-rose-50 text-rose-700 font-bold' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-rose-600'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? cat.bgClass : 'bg-gray-100 text-gray-500'} flex-shrink-0 flex items-center justify-center`}>
                          <CatIcon className="w-4 h-4" />
                        </div>
                        <span className="truncate flex-1">{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Breadcrumb Title */}
            <div className="hidden sm:flex items-center space-x-2 text-sm pl-2">
               <span className="font-semibold text-gray-500">Cẩm nang Kiến thức</span>
               <ChevronRight className="w-4 h-4 text-gray-400" />
               <span className="font-bold text-gray-900">{activeCat.name}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6 w-full">
            {/* Sub-page Header banner */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
              <div className="flex items-start space-x-3.5">
                <div className={`p-3 rounded-xl ${activeCat.bgClass} flex-shrink-0 flex items-center justify-center shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${activeCat.tagColorClass}`}>
                    Cẩm nang khoa học
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-1.5">{activeCat.name}</h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed max-w-2xl">{activeCat.desc}</p>
                </div>
              </div>
            </div>

            {/* Core Content Views per sub-page */}
            {activeCat.id === 'pregnancy' && (
              <div className="space-y-5">
                {pregnancyData.map((milestone) => (
                  <div key={milestone.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-violet-300 transition-colors">
                    <div className="px-5 py-4 border-b border-gray-100 bg-violet-50/20 flex justify-between items-center">
                      <h2 className="text-base sm:text-lg font-bold text-violet-900 flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-violet-500" />
                        {milestone.period}
                      </h2>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 flex items-center">
                            <span className="w-1.5 h-3 bg-violet-500 rounded-full mr-2"></span>
                            Sự phát triển của thai nhi
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{milestone.babyDevelopment}</p>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
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
                          {milestone.checkupsAndTests.map((item, idx) => (
                            <div key={idx} className="text-xs sm:text-sm text-gray-600 border-l-2 border-violet-300 pl-3.5 py-0.5">
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

                      <div className="bg-violet-50/30 border border-violet-100 rounded-lg p-3.5">
                        <h3 className="text-xs sm:text-sm font-bold text-violet-900 mb-2 flex items-center">
                          🌟 Lời khuyên vàng dưỡng thai
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {milestone.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-600">
                              <CheckCircle2 className="w-4 h-4 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeCat.id === 'stages' && (
              <div className="space-y-5">
                {stagesData.map((stage) => (
                  <div key={stage.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-orange-300 transition-colors">
                    <div className="px-5 py-4 border-b border-gray-100 bg-orange-50/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">{stage.title}</h2>
                      <span className="text-xs font-bold text-orange-600 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100">
                        Độ tuổi: {stage.ageRange}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Cột mốc phát triển cốt lõi</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                        {stage.milestones.map((item, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">⚠️ Vấn đề thường gặp & Cách xử trí</h3>
                        <div className="space-y-4">
                          {stage.commonIssues.map((issue, idx) => (
                            <div key={idx} className="text-xs sm:text-sm text-gray-600 border-l-2 border-orange-200 pl-4 py-1">
                              <strong className="text-gray-900 block font-semibold text-sm mb-1">{issue.title}</strong>
                              <span className="block text-xs sm:text-sm leading-relaxed mb-2.5">{issue.description}</span>
                              <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100 text-orange-900 text-xs">
                                <span className="font-bold block mb-1">💡 Hướng dẫn cho ba mẹ:</span>
                                {issue.solution}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeCat.id === 'abnormal' && (
              <div className="space-y-5">
                {abnormalConditions.map((condition) => (
                  <div key={condition.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-amber-300 transition-colors">
                    <div className="px-5 py-4 border-b border-gray-100 bg-amber-50/20">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                        {condition.title}
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                          <strong className="text-gray-900 text-xs sm:text-sm font-bold block mb-1.5">🔍 Dấu hiệu & Triệu chứng:</strong>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{condition.symptoms}</p>
                        </div>
                        <div className="bg-emerald-50/30 p-3.5 rounded-lg border border-emerald-100">
                          <strong className="text-emerald-800 text-xs sm:text-sm font-bold block mb-1.5">🏡 Chăm sóc & Theo dõi tại nhà:</strong>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{condition.homeCare}</p>
                        </div>
                      </div>

                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start space-x-3">
                        <div className="bg-red-100 p-1.5 rounded-lg text-red-600 flex-shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="text-red-800 text-xs sm:text-sm block mb-1 font-bold">🚨 Khi nào cần cho bé đi viện gấp?</strong>
                          <p className="text-red-900/95 text-xs sm:text-sm leading-relaxed font-medium">{condition.whenToSeeDoctor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeCat.id === 'firstaid' && (
              <div className="space-y-5">
                {firstAidGuides.map((guide) => (
                  <div key={guide.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-red-300 transition-colors">
                    <div className="px-5 py-4 border-b border-gray-100 bg-red-50/20">
                      <h3 className="text-base sm:text-lg font-bold text-red-800 flex items-center">
                        <Stethoscope className="w-5 h-5 mr-2 text-red-500" />
                        {guide.title}
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-100 shadow-inner">
                        <p className="text-amber-800 text-xs sm:text-sm font-semibold flex items-start">
                          <span className="mr-2 text-sm">⚠️ Nguyên tắc vàng:</span>
                          <span>{guide.goldenRule}</span>
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2.5 uppercase tracking-wide">Các bước xử lý khẩn cấp</h4>
                        <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                          {guide.steps.map((step, idx) => (
                            <li key={idx} className="pl-1 text-gray-800">{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="border-t border-gray-100 pt-4 bg-rose-50/20 -mx-5 -mb-5 p-5 mt-4">
                        <h4 className="text-xs sm:text-sm font-bold text-red-700 mb-2 flex items-center">
                          🚫 Tuyệt đối tránh sai lầm này:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-red-900">
                          {guide.warnings.map((warning, idx) => (
                            <li key={idx} className="pl-1 leading-relaxed font-medium">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeCat.id === 'medicine' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-blue-50 text-blue-800 border border-blue-100 text-xs sm:text-sm flex items-start space-x-2.5">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Khuyến cáo an toàn:</strong> Tất cả các thông tin về thuốc chỉ mang tính chất tham khảo khoa học. Ba mẹ tuyệt đối không tự ý cho bé uống kháng sinh hoặc thuốc liều cao nếu chưa có chỉ định từ Bác sĩ hoặc Dược sĩ nhi khoa. Hãy kiểm tra hạn sử dụng định kỳ mỗi 3 tháng.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
                    Danh sách thuốc nhi khoa thông dụng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medicinesList.map((medicine, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                        <h4 className="font-bold text-blue-900 text-sm sm:text-base">{medicine.name}</h4>
                        <div className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                          <p><strong className="text-gray-800">Tác dụng:</strong> {medicine.usage}</p>
                          <p><strong className="text-gray-800">Liều dùng tiêu chuẩn:</strong> {medicine.dosageNotes}</p>
                          <p className="text-rose-700 bg-rose-50 p-2 rounded border border-rose-100 mt-2 font-medium">
                            <strong className="text-rose-800">Chống chỉ định/Cảnh báo:</strong> {medicine.warnings}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full mr-2"></span>
                    Các dụng cụ & vật tư y tế tủ thuốc gia đình cần sẵn có
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {medicineCabinetItems.map((item, idx) => (
                      <div key={idx} className="flex items-center text-xs sm:text-sm text-gray-700 bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-inner">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
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
