import React from 'react';
import { Link } from 'react-router-dom';
import { Milk, Zap, Baby, Heart, ShieldCheck } from 'lucide-react';
import { BabyProfile } from '../../data/babyProfileStorage';
import { EasyDayLog, getDayTotalMilk, getDayTotalDiapers } from '../../data/easyStorage';

interface NutritionWidgetProps {
  babyProfile: BabyProfile | null;
  todayEasyLog: EasyDayLog | null;
}

export const NutritionWidget: React.FC<NutritionWidgetProps> = ({ babyProfile, todayEasyLog }) => {
  const milkStats = todayEasyLog ? getDayTotalMilk(todayEasyLog) : { daytimeMilk: 0, breastMilkTotal: 0, formulaMilkTotal: 0, nightMilk: 0, grandTotal: 0 };
  const diaperStats = todayEasyLog ? getDayTotalDiapers(todayEasyLog) : { dayWet: 0, dayDirty: 0, nightWet: 0, nightDirty: 0, totalWet: 0, totalDirty: 0, grandTotalDiapers: 0 };
  const totalMilkMl = milkStats.grandTotal || 0;
  const estKcal = Math.round((totalMilkMl / 100) * 67);
  const percentRdaKcal = Math.min(100, Math.round((estKcal / 500) * 100));
  const estCalciumMg = Math.round((totalMilkMl / 100) * 55);
  const estDhaMg = Math.round((totalMilkMl / 100) * 15);

  const babyName = babyProfile?.nickname || babyProfile?.name || 'Bé';

  return (
    <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-sm space-y-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-yellow-100">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider block">Bảng Dinh Dưỡng Nạp Hôm Nay của {babyName}</span>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
              Tổng Lượng Sữa & Vi Chất Nạp Vào
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-extrabold text-white border border-white/20">
            Tổng: <span className="text-yellow-200 text-sm">{totalMilkMl} ml</span>
          </div>
          <Link
            to="/easy/formula"
            className="px-3 py-1.5 bg-white text-amber-900 font-extrabold rounded-xl text-xs hover:bg-amber-50 transition-colors shadow-xs flex items-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Máy tính dinh dưỡng</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-sky-100 text-[10px] font-bold">
            <span>Tổng Tã Cả Ngày</span>
            <Baby className="w-3.5 h-3.5 text-sky-200" />
          </div>
          <div className="text-base sm:text-lg font-black text-white flex items-center space-x-1.5">
            <span>💦 {diaperStats.totalWet}</span>
            <span>💩 {diaperStats.totalDirty}</span>
          </div>
          <span className="text-[10px] text-amber-100 block">Ngày: {diaperStats.dayWet} | Đêm: {diaperStats.nightWet} ướt</span>
        </div>
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-amber-100 text-[10px] font-bold">
            <span>Năng Lượng</span>
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
          </div>
          <div className="text-base sm:text-lg font-black text-white">{estKcal} kcal</div>
          <div className="w-full bg-white/30 rounded-full h-1.5 overflow-hidden">
            <div className="bg-yellow-300 h-1.5 rounded-full" style={{ width: `${percentRdaKcal}%` }}></div>
          </div>
          <span className="text-[10px] text-amber-100 font-medium block">{percentRdaKcal}% Khuyến nghị (RDA)</span>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-rose-100 text-[10px] font-bold">
            <span>Sữa Mẹ Bú</span>
            <Heart className="w-3.5 h-3.5 text-pink-200" />
          </div>
          <div className="text-base sm:text-lg font-black text-white">{milkStats.breastMilkTotal} ml</div>
          <span className="text-[10px] text-amber-100 block">Ước tính ti mẹ + ti bình</span>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-amber-100 text-[10px] font-bold">
            <span>Sữa Công Thức</span>
            <Milk className="w-3.5 h-3.5 text-yellow-200" />
          </div>
          <div className="text-base sm:text-lg font-black text-white">{milkStats.formulaMilkTotal} ml</div>
          <span className="text-[10px] text-amber-100 block">Dạng bình công thức</span>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-amber-100 text-[10px] font-bold">
            <span>Vi Chất Thiết Yếu</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          </div>
          <div className="text-xs font-bold text-white space-y-0.5">
            <div>Canxi: <strong className="text-yellow-200">{estCalciumMg} mg</strong></div>
            <div>DHA: <strong className="text-purple-200">{estDhaMg} mg</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
