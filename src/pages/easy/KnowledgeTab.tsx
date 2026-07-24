import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  Bed,
  Moon,
  Milk,
  Heart,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const KnowledgeTab: React.FC = () => {
  const [knowledgeCategory, setKnowledgeCategory] = useState<string>('all');
  const [knowledgeSearch, setKnowledgeSearch] = useState<string>('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>('basics_1');

  const allArticles = [
    {
      id: 'basics_1',
      category: 'basics',
      tag: 'Triết lý cốt lõi',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
      title: '1. Triết Lý EASY: Tách Biệt Ăn Và Ngủ',
      summary: 'Tại sao việc ghép đôi Ăn và Ngủ (Ti để ngủ) lại tạo ra thói quen ngủ ngắt quãng và bú vặt?',
      icon: Sparkles,
      iconColor: 'text-rose-500',
      content: (
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
          <p>
            Trong thói quen truyền thống, em bé thường được cho ti mẹ hoặc ti bình ngay trước khi đi ngủ. Điều này vô tình tạo ra phản xạ có điều kiện: <strong>"Có ti mới ngủ được"</strong>. Khi bé cựa quậy chuyển chu kỳ ngủ giữa đêm, bé không thấy ti đâu và sẽ gắt khóc đòi bú lại dù dạ dày không hề đói.
          </p>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 space-y-1">
            <span className="font-bold block">💡 Lợi ích khi tách biệt Ăn (E) và Ngủ (S):</span>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Dạ dày khỏe mạnh:</strong> Bé ăn no hoàn toàn ở đầu cữ thức, có đủ thời gian tiêu hóa trước khi ngủ.</li>
              <li><strong>Không sợ nôn trớ:</strong> Bé được vỗ ợ hơi và chơi đùa (A) từ 30-60 phút trước khi nằm ngủ.</li>
              <li><strong>Tự ngủ dễ dàng:</strong> Bé đi vào giấc ngủ nhờ sự thư giãn tự nhiên, không phụ thuộc vào ti mẹ hay ti giả.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'basics_2',
      category: 'basics',
      tag: 'Từ điển EASY',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: '2. Từ Điển & Thuật Ngữ Vàng Trong EASY',
      summary: 'Nút chờ (Pause), Wake Window, Catnap, Sleep Cycle nghĩa là gì?',
      icon: BookOpen,
      iconColor: 'text-blue-500',
      content: (
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900 block">• Nút chờ (Pause):</span>
              <span>Khoảng thời gian 3 - 5 phút cha mẹ bình tĩnh quan sát khi bé ẹ hẹ, không vội lao vào bế hay đút ti ngay.</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900 block">• Wake Window (Thời gian thức):</span>
              <span>Tổng thời gian bé thức giữa 2 giấc ngủ (bao gồm giờ ăn, chơi và trình tự vào giấc).</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900 block">• Catnap (Giấc ngắn):</span>
              <span>Giấc ngủ chỉ kéo dài 30 - 45 phút (đúng 1 chu kỳ ngủ nông) bé đã giật mình thức giấc.</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900 block">• Wind-down (Thư giãn vào giấc):</span>
              <span>Trình tự 5 - 10 phút chuyển tiếp từ môi trường sáng/sôi động sang phòng tối giúp não bộ bé hạ nhiệt.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sleep_1',
      category: 'sleep',
      tag: 'Phòng ngủ chuẩn',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      title: '3. Môi Trường Ngủ An Toàn Standard Y Khoa',
      summary: 'Nhiệt độ phòng, độ tối, tiếng ồn trắng & quy tắc chống đột tử sơ sinh (SIDS).',
      icon: Bed,
      iconColor: 'text-purple-500',
      content: (
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
          <ul className="space-y-2 list-disc pl-4">
            <li><strong>Nhiệt độ phòng lý tưởng:</strong> Duy trì 20 - 22°C (hoặc 22 - 24°C tùy vùng miền). Trẻ sơ sinh thân nhiệt cao hơn người lớn, phòng nóng gây giật mình và quấy khóc.</li>
            <li><strong>Độ tối phòng ngủ:</strong> Đóng rèm tối 95 - 100% cho cả giấc ngày và đêm để kích thích hormone buồn ngủ Melatonin.</li>
            <li><strong>Tiếng ồn trắng (White Noise):</strong> Mở liên tục suốt giấc ngủ với âm lượng 50 - 60 dB (tương đương tiếng mưa rơi nhẹ) giúp tái tạo môi trường tử cung và lọc tiếng ồn ngoài.</li>
            <li><strong>Nằm ngửa hoàn toàn:</strong> Đặt bé nằm ngửa trên đệm phẳng, không dùng gối cao, không để thú bông hay chăn dày quanh mặt bé.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'sleep_2',
      category: 'sleep',
      tag: 'Trình tự 4S / 5S',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      title: '4. Hướng Dẫn Trình Tự Vào Giấc 4S Thần Tốc',
      summary: 'Quy trình 4 bước chuẩn giúp bé nhận biết tín hiệu đi ngủ mà không cần bế ru.',
      icon: Moon,
      iconColor: 'text-purple-600',
      content: (
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
          <div className="space-y-2">
            <div className="flex space-x-2">
              <span className="font-extrabold text-purple-600">Bước 1S - Sleep Space:</span>
              <span>Bế bé vào phòng tối, bật tiếng ồn trắng, hạ giọng thì thầm.</span>
            </div>
            <div className="flex space-x-2">
              <span className="font-extrabold text-purple-600">Bước 2S - Swaddle:</span>
              <span>Quấn chũn hoặc mặc nhộng chũn giữ chặt hai tay giúp bé không giật mình phản xạ Moro.</span>
            </div>
            <div className="flex space-x-2">
              <span className="font-extrabold text-purple-600">Bước 3S - Sit:</span>
              <span>Bế đứng bé trên vai từ 3 - 5 phút thư giãn, vỗ nhẹ lưng đến khi bé thả lỏng hoàn toàn.</span>
            </div>
            <div className="flex space-x-2">
              <span className="font-extrabold text-purple-600">Bước 4S - Shush/Pat:</span>
              <span>Đặt bé xuống cũi khi bé vẫn còn thiêm thiếp (chưa ngủ hẳn), vỗ nhẹ và suỵt nhẹ giúp bé tự chìm vào giấc.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'feeding_1',
      category: 'feeding',
      tag: 'Bú chủ động',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: '5. Quy Tắc Cho Bé Bú Chủ Động & Tính Lượng Sữa',
      summary: 'Nhận biết bé ngụm nuốt thật sự vs ti gật, công thức tính ml sữa chuẩn theo cân nặng.',
      icon: Milk,
      iconColor: 'text-amber-600',
      content: (
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
          <p>
            <strong>Công thức tính tổng lượng sữa cả ngày:</strong> <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">Cân nặng (kg) x 150ml</span> (Ví dụ: bé 5kg cần khoảng 750ml/ngày).
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 space-y-1.5">
            <span className="font-bold text-gray-900 block">• Phân biệt Bú Chủ Động (Active Feeding) và Bú Ngủ:</span>
            <p>Bú chủ động: Mắt bé mở hoặc lim dim nhưng cơ hàm cằm cử động sâu, nghe tiếng ngụm "ực... ực" rõ ràng. Cữ bú hiệu quả kết thúc trong 15 - 25 phút.</p>
            <p>Bú ngủ/ngậm ti: Bé mút chíp chíp tẻ nhạt ở đầu núm ti, mút vài cái rồi dừng hẳn, không nuốt.</p>
          </div>
        </div>
      )
    },
    {
      id: 'feeding_2',
      category: 'feeding',
      tag: 'Mẹ & Công thức',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: '6. Vỗ Ợ Hơi 3 Tư Thế Vàng Ngừa Nôn Trớ',
      summary: 'Tại sao ợ hơi lại quyết định 80% chất lượng giấc ngủ của bé sơ sinh?',
      icon: Heart,
      iconColor: 'text-rose-500',
      content: (
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
          <p>Trong quá trình bú, bé nuốt rất nhiều không khí vào dạ dày. Bọt khí kẹt lại làm bé đau bụng, đầy hơi và giật mình thức giấc sau 30 phút ngủ.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
              <span className="font-bold text-rose-900 block">Tư thế 1: Vỗ trên vai</span>
              <span className="text-[11px] text-gray-600">Áp ngực bé vào vai mẹ, một tay đỡ mông, một tay khum lại vỗ nhẹ từ dưới lên.</span>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
              <span className="font-bold text-rose-900 block">Tư thế 2: Vỗ ngồi đỡ cằm</span>
              <span className="text-[11px] text-gray-600">Cho bé ngồi trên đùi mẹ, tay mẹ đỡ cằm & cổ bé hơi nghiêng về trước, vỗ lưng nhẹ.</span>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
              <span className="font-bold text-rose-900 block">Tư thế 3: Nằm sấp đùi</span>
              <span className="text-[11px] text-gray-600">Đặt bé nằm sấp ngang qua đùi mẹ, đầu cao hơn bụng, nhẹ nhàng vuốt và vỗ lưng.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshoot_1',
      category: 'troubleshoot',
      tag: 'Khắc phục Catnap',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
      title: '7. Khắc Phục Triệt Để Bé Ngủ Catnap (30-45 Phút)',
      summary: 'Nguyên nhân bé tỉnh giấc khi vừa kết thúc 1 chu kỳ ngủ nông và các bước nối giấc.',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
      content: (
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-950 space-y-1">
            <span className="font-bold block">🚨 4 Nguyên nhân chính gây Catnap:</span>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Thời gian thức chưa đủ:</strong> Bé chưa tích lũy đủ áp lực ngủ (Sleep Pressure).</li>
              <li><strong>Quá giấc (Overtired):</strong> Bé thức quá lâu khiến hormone Stress Cortisol tăng cao.</li>
              <li><strong>Còn kẹt hơi trong bụng:</strong> Chưa được vỗ ợ kỹ trước khi đặt ngủ.</li>
              <li><strong>Chưa biết tự chuyển chu kỳ:</strong> Bé phụ thuộc ti mẹ/bế ru nên khi tỉnh giấc không biết tự ngủ lại.</li>
            </ul>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950">
            <span className="font-bold block">✅ Các bước hỗ trợ nối giấc:</span>
            <p className="mt-1">Khi thấy bé cựa quậy lúc 35-40 phút: Áp dụng nút chờ 3-5 phút ➔ Nếu bé khóc tăng dần, vào phòng giữ nhẹ tay bé, vỗ nhịp nhàng và suỵt suỵt ➔ Giúp bé băng qua điểm giao chu kỳ.</p>
          </div>
        </div>
      )
    },
    {
      id: 'regression_1',
      category: 'regression',
      tag: 'Khủng hoảng ngủ',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: '8. Các Mốc Khủng Hoảng Ngủ & Cách Vượt Qua',
      summary: 'Mốc 4 tháng, 8-10 tháng, 12 tháng: Tại sao bé đang ngoan đột nhiên quấy khóc?',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      content: (
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
          <p>Khủng hoảng ngủ (Sleep Regression) xảy ra khi não bộ em bé có bước nhảy vọt về phát triển vận động (lẫy, bò, đứng) hoặc cấu trúc giấc ngủ biến đổi giống người lớn.</p>
          <div className="space-y-2">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900 block">• Khủng hoảng 4 tháng (Mốc quan trọng nhất):</span>
              <span>Cấu trúc giấc ngủ của bé chuyển từ 2 giai đoạn sang 4 giai đoạn. Bé dễ thức giấc sau mỗi 45 phút. Cần kiên trì giữ nếp tự ngủ và không tạo thêm thói quen xấu mới.</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900 block">• Khủng hoảng 8 - 10 tháng:</span>
              <span>Bé tập bò, tập đứng và bám víu thành cũi. Thường đứng dậy trong cũi khóc. Hãy dạy bé cách ngồi xuống an toàn thay vì bế bé ra khỏi cũi.</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredArticles = allArticles.filter((art) => {
    const matchesCategory = knowledgeCategory === 'all' || art.category === knowledgeCategory;
    const matchesSearch = !knowledgeSearch || 
      art.title.toLowerCase().includes(knowledgeSearch.toLowerCase()) || 
      art.summary.toLowerCase().includes(knowledgeSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Cẩm Nang Khoa Học E.A.S.Y</h2>
              <p className="text-xs text-gray-500">Kiến thức Y khoa & Kinh nghiệm thực chiến giúp rèn nếp sống tự lập cho bé</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, mẹo..."
              value={knowledgeSearch}
              onChange={(e) => setKnowledgeSearch(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Core EASY Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">E</div>
              <h3 className="font-bold text-xs text-amber-950">Eat (Ăn)</h3>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Bé ăn ngay sau khi vừa ngủ dậy. Tỉnh táo nhất để nạp đủ lượng sữa cần thiết, tuyệt đối không vừa ti vừa ngủ.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500 text-white font-black text-xs flex items-center justify-center">A</div>
              <h3 className="font-bold text-xs text-blue-950">Activity (Chơi)</h3>
            </div>
            <p className="text-[11px] text-blue-900/80 leading-relaxed">
              Ợ hơi, vận động tay chân, tummy time, trò chuyện. Tạo môi trường kích thích giác quan giúp bé xả năng lượng.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500 text-white font-black text-xs flex items-center justify-center">S</div>
              <h3 className="font-bold text-xs text-purple-950">Sleep (Ngủ)</h3>
            </div>
            <p className="text-[11px] text-purple-900/80 leading-relaxed">
              Thực hiện trình tự wind-down và đặt bé tự ngủ khi có tín hiệu gắt ngủ. Giúp não bộ phục hồi và phát triển chiều cao.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center">Y</div>
              <h3 className="font-bold text-sm text-emerald-950">Your time (Mẹ)</h3>
            </div>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed">
              Khoảng thời gian nghỉ ngơi riêng tư cho mẹ khi bé đang trong giấc ngủ: thư giãn, hút sữa, giải trí tái tạo sức lao động.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        {[
          { id: 'all', label: 'Tất cả bài viết' },
          { id: 'basics', label: '1. Triết lý & Thuật ngữ' },
          { id: 'sleep', label: '2. Giấc ngủ & Tự ngủ' },
          { id: 'feeding', label: '3. Sữa & Dinh dưỡng' },
          { id: 'troubleshoot', label: '4. Xử lý Catnap & Gắt ngủ' },
          { id: 'regression', label: '5. Khủng hoảng & Chuyển lịch' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setKnowledgeCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl border whitespace-nowrap cursor-pointer transition-all ${
              knowledgeCategory === cat.id
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Age Schedule Comparison Matrix */}
      {(knowledgeCategory === 'all' || knowledgeCategory === 'basics') && !knowledgeSearch && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center">
            <Sparkles className="w-4 h-4 text-rose-500 mr-2" />
            So Sánh Chi Tiết Các Mẫu Lịch EASY Theo Độ Tuổi
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 font-bold">
                  <th className="p-2.5">Lịch EASY</th>
                  <th className="p-2.5">Độ tuổi phù hợp</th>
                  <th className="p-2.5">Thời gian Thức (A)</th>
                  <th className="p-2.5">Thời gian Ngủ (S)</th>
                  <th className="p-2.5">Lượng cữ ăn ngày</th>
                  <th className="p-2.5">Đặc điểm chính</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                <tr className="hover:bg-rose-50/20">
                  <td className="p-2.5 font-extrabold text-rose-600">EASY 3</td>
                  <td className="p-2.5 font-bold text-gray-900">0 - 3 tháng</td>
                  <td className="p-2.5 font-semibold text-amber-800">1.0 - 1.5 tiếng</td>
                  <td className="p-2.5 font-semibold text-indigo-800">1.5 - 2.0 tiếng</td>
                  <td className="p-2.5">5 cữ ngày + đêm</td>
                  <td className="p-2.5">Bé mới sinh, dạ dày nhỏ, cần ăn liên tục mỗi 3h.</td>
                </tr>
                <tr className="hover:bg-rose-50/20">
                  <td className="p-2.5 font-extrabold text-rose-600">EASY 4</td>
                  <td className="p-2.5 font-bold text-gray-900">3 - 6 tháng</td>
                  <td className="p-2.5 font-semibold text-amber-800">1.5 - 2.0 tiếng</td>
                  <td className="p-2.5 font-semibold text-indigo-800">1.5 - 2.0 tiếng</td>
                  <td className="p-2.5">4 cữ ngày + 1 cữ catnap</td>
                  <td className="p-2.5">Sức chứa dạ dày lớn hơn, giãn cữ bú lên 4h. Giảm bú đêm.</td>
                </tr>
                <tr className="hover:bg-rose-50/20">
                  <td className="p-2.5 font-extrabold text-rose-600">EASY 2-3-4</td>
                  <td className="p-2.5 font-bold text-gray-900">7 - 11 tháng</td>
                  <td className="p-2.5 font-semibold text-amber-800">2h ➔ 3h ➔ 4h</td>
                  <td className="p-2.5 font-semibold text-indigo-800">1.5 - 2.0 tiếng / giấc</td>
                  <td className="p-2.5">3 cữ sữa + 2 cữ ăn dặm</td>
                  <td className="p-2.5">Gồm 2 giấc ngày. Kết hợp hoàn hảo với nếp ăn dặm.</td>
                </tr>
                <tr className="hover:bg-rose-50/20">
                  <td className="p-2.5 font-extrabold text-rose-600">EASY 5-6</td>
                  <td className="p-2.5 font-bold text-gray-900">12 - 18+ tháng</td>
                  <td className="p-2.5 font-semibold text-amber-800">5.0 - 6.0 tiếng</td>
                  <td className="p-2.5 font-semibold text-indigo-800">1.5 - 2.5 tiếng</td>
                  <td className="p-2.5">3 cữ ăn chính + sữa</td>
                  <td className="p-2.5">Chuyển sang 1 giấc trưa duy nhất giống sinh hoạt người lớn.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Knowledge Articles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center">
            <BookOpen className="w-4 h-4 text-rose-500 mr-2" />
            Danh Sách Chuyên Đề Kiến Thức ({filteredArticles.length} bài)
          </h3>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 text-xs">
            Không tìm thấy bài viết phù hợp với từ khóa "{knowledgeSearch}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((art) => {
              const IconComp = art.icon;
              const isExpanded = expandedCardId === art.id;

              return (
                <div
                  key={art.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded ? 'border-rose-300 shadow-md ring-1 ring-rose-200' : 'border-gray-200 shadow-xs hover:border-rose-200'
                  }`}
                >
                  <div
                    onClick={() => setExpandedCardId(isExpanded ? null : art.id)}
                    className="p-4 cursor-pointer flex items-start justify-between gap-3 select-none"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2.5 rounded-xl bg-slate-50 ${art.iconColor} flex-shrink-0 mt-0.5`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border mb-1.5 ${art.tagColor}`}>
                          {art.tag}
                        </span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {art.summary}
                        </p>
                      </div>
                    </div>

                    <button className="p-1 rounded-lg hover:bg-slate-100 text-gray-400 flex-shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded Content View */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      {art.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeTab;
