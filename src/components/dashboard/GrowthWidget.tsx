import React, { useState, useEffect } from 'react';
import { TrendingUp, Pin, Scale, Ruler, CheckCircle2, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { growthStorage, GrowthRecord } from '../../data/growthStorage';
import { WHO_BOYS_WEIGHT_KG, WHO_GIRLS_WEIGHT_KG, WHO_BOYS_HEIGHT_CM, WHO_GIRLS_HEIGHT_CM, evaluateGrowth } from '../../data/whoGrowthData';
import { BabyProfile } from '../../data/babyProfileStorage';
import { LocalDiaryEntry } from '../../data/localDiaryApi';
import { differenceInDays } from 'date-fns';

interface GrowthWidgetProps {
  babyProfile: BabyProfile | null;
  latestEntry: LocalDiaryEntry | null;
}

export const GrowthWidget: React.FC<GrowthWidgetProps> = ({ babyProfile, latestEntry }) => {
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [newGrowth, setNewGrowth] = useState({ dateStr: new Date().toISOString().split('T')[0], weightKg: '', heightCm: '', notes: '' });

  const fetchGrowthRecords = async () => {
    const records = await growthStorage.getAllRecords();
    setGrowthRecords(records);
  };

  useEffect(() => {
    fetchGrowthRecords();
  }, []);

  const handleSaveGrowth = async () => {
    if (!newGrowth.weightKg && !newGrowth.heightCm) return;
    let monthAge = 0;
    if (babyProfile?.birthDate) {
      const days = differenceInDays(new Date(newGrowth.dateStr), new Date(babyProfile.birthDate));
      monthAge = Math.max(0, Number((days / 30.436875).toFixed(1)));
    }
    
    await growthStorage.addRecord({
      dateStr: newGrowth.dateStr,
      monthAge,
      weightKg: newGrowth.weightKg ? Number(newGrowth.weightKg) : undefined,
      heightCm: newGrowth.heightCm ? Number(newGrowth.heightCm) : undefined,
      notes: newGrowth.notes
    });
    
    setShowGrowthModal(false);
    setNewGrowth({ dateStr: new Date().toISOString().split('T')[0], weightKg: '', heightCm: '', notes: '' });
    fetchGrowthRecords();
  };

  const latestGrowth = growthRecords.length > 0 ? growthRecords[0] : null;

  const isBoy = babyProfile?.gender === 'male';
  const whoWeightData = isBoy ? WHO_BOYS_WEIGHT_KG : WHO_GIRLS_WEIGHT_KG;
  const whoHeightData = isBoy ? WHO_BOYS_HEIGHT_CM : WHO_GIRLS_HEIGHT_CM;

  let weightEval: ReturnType<typeof evaluateGrowth> | null = null;
  if (latestGrowth?.weightKg) {
    weightEval = evaluateGrowth(latestGrowth.weightKg, whoWeightData, latestGrowth.monthAge);
  }
  let heightEval: ReturnType<typeof evaluateGrowth> | null = null;
  if (latestGrowth?.heightCm) {
    heightEval = evaluateGrowth(latestGrowth.heightCm, whoHeightData, latestGrowth.monthAge);
  }

  const chartData: any[] = [];
  const maxMonth = latestGrowth ? Math.max(24, Math.ceil(latestGrowth.monthAge)) : 24;
  for (let m = 0; m <= maxMonth; m++) {
    const wRef = whoWeightData.find(d => d.month === m) || whoWeightData.find(d => d.month > m);
    const hRef = whoHeightData.find(d => d.month === m) || whoHeightData.find(d => d.month > m);
    
    const babyRecs = growthRecords.filter(r => Math.round(r.monthAge) === m);
    const babyW = babyRecs.find(r => r.weightKg)?.weightKg;
    const babyH = babyRecs.find(r => r.heightCm)?.heightCm;

    if (wRef && hRef) {
      chartData.push({
        month: m,
        w_p3: wRef.p3,
        w_p50: wRef.p50,
        w_p97: wRef.p97,
        h_p3: hRef.p3,
        h_p50: hRef.p50,
        h_p97: hRef.p97,
        babyW: babyW || null,
        babyH: babyH || null,
      });
    }
  }

  const babyName = babyProfile?.nickname || babyProfile?.name || 'Bé';

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                Chỉ Số Phát Triển Thể Chất (Chuẩn WHO)
              </h3>
              <p className="text-xs text-gray-500">So sánh với bách phân vị chuẩn của WHO</p>
            </div>
          </div>

          <button
            onClick={() => setShowGrowthModal(true)}
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg flex items-center shadow-xs transition-colors cursor-pointer"
          >
            <Pin className="w-3.5 h-3.5 mr-1" />
            Nhập số đo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-rose-800 text-[11px] font-bold">
              <span>Cân Nặng Mới Nhất</span>
              <Scale className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-lg font-black text-rose-950">
              {latestGrowth?.weightKg ? `${latestGrowth.weightKg} kg` : '---'}
            </div>
            <span className={`text-[10px] font-semibold block ${weightEval?.color || 'text-rose-700'}`}>
              {weightEval ? `✓ ${weightEval.status} (${weightEval.percentileStr})` : 'Chưa có dữ liệu'}
            </span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-blue-800 text-[11px] font-bold">
              <span>Chiều Cao Mới Nhất</span>
              <Ruler className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-lg font-black text-blue-950">
              {latestGrowth?.heightCm ? `${latestGrowth.heightCm} cm` : '---'}
            </div>
            <span className={`text-[10px] font-semibold block ${heightEval?.color || 'text-blue-700'}`}>
              {heightEval ? `✓ ${heightEval.status} (${heightEval.percentileStr})` : 'Chưa có dữ liệu'}
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold">
              <span>Số Cữ Tã Hôm Nay</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-lg font-black text-emerald-950">
              {latestEntry ? `${latestEntry.wetDiapers || 0} ướt / ${latestEntry.dirtyDiapers || 0} dơ` : '0 ướt / 0 dơ'}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block">
              ✓ Tiêu hóa ổn định
            </span>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-extrabold text-gray-800 mb-2 flex items-center">
                <Activity className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
                Cân nặng theo tuổi (kg)
              </h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                    <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} labelFormatter={(l) => `Tháng thứ ${l}`} />
                    
                    <Line type="monotone" dataKey="w_p97" name="Vượt chuẩn (97th)" stroke="#d1d5db" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="w_p50" name="Chuẩn (50th)" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="w_p3" name="Dưới chuẩn (3rd)" stroke="#d1d5db" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                    
                    <Line type="monotone" dataKey="babyW" name={babyName} stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-gray-800 mb-2 flex items-center">
                <Ruler className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                Chiều cao theo tuổi (cm)
              </h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} labelFormatter={(l) => `Tháng thứ ${l}`} />
                    
                    <Line type="monotone" dataKey="h_p97" name="Vượt chuẩn (97th)" stroke="#d1d5db" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="h_p50" name="Chuẩn (50th)" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="h_p3" name="Dưới chuẩn (3rd)" stroke="#d1d5db" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                    
                    <Line type="monotone" dataKey="babyH" name={babyName} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showGrowthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cập nhật chỉ số phát triển</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày đo</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={newGrowth.dateStr}
                  onChange={e => setNewGrowth({...newGrowth, dateStr: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 5.5"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500"
                    value={newGrowth.weightKg}
                    onChange={e => setNewGrowth({...newGrowth, weightKg: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Chiều cao (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 60"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={newGrowth.heightCm}
                    onChange={e => setNewGrowth({...newGrowth, heightCm: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Tiêm phòng, bé ngoan..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={newGrowth.notes}
                  onChange={e => setNewGrowth({...newGrowth, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowGrowthModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveGrowth}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
              >
                Lưu chỉ số
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
