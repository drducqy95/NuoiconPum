import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { localDiaryApi } from '../data/localDiaryApi';
import { ArrowLeft, Save, ImagePlus, X } from 'lucide-react';

export const DiaryEntryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [images, setImages] = useState<string[]>([]);
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [breastMilkVolume, setBreastMilkVolume] = useState<number | ''>('');
  const [formulaVolume, setFormulaVolume] = useState<number | ''>('');
  const [formulaType, setFormulaType] = useState('');
  const [dirtyDiapers, setDirtyDiapers] = useState<number | ''>('');
  const [wetDiapers, setWetDiapers] = useState<number | ''>('');
  const [abnormalNotes, setAbnormalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit) {
      const fetchDoc = async () => {
        try {
          const data = await localDiaryApi.getEntry(id!);
          if (data) {
            setTitle(data.title || '');
            setContent(data.content || '');
            setDateStr(data.dateStr || new Date().toISOString().split('T')[0]);
            setImages(data.images || []);
            setHeight(data.height ?? '');
            setWeight(data.weight ?? '');
            setBreastMilkVolume(data.breastMilkVolume ?? '');
            setFormulaVolume(data.formulaVolume ?? '');
            setFormulaType(data.formulaType || '');
            setDirtyDiapers(data.dirtyDiapers ?? '');
            setWetDiapers(data.wetDiapers ?? '');
            setAbnormalNotes(data.abnormalNotes || '');
          } else {
            navigate('/diary');
          }
        } catch (error) {
          console.error("Failed to fetch local entry", error);
        }
      };
      fetchDoc();
    }
  }, [id, navigate, isEdit]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // max width/height

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // compress to base64 jpg
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    if (images.length >= 5) {
      alert("Bạn chỉ có thể tải lên tối đa 5 ảnh.");
      return;
    }

    const file = e.target.files[0];
    const base64Img = await resizeImage(file);
    setImages(prev => [...prev, base64Img]);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const entryData = {
        userId: user ? user.uid : null, // Store if user is logged in
        title: title.trim(),
        content: content.trim(),
        dateStr,
        images,
        height: height === '' ? null : Number(height),
        weight: weight === '' ? null : Number(weight),
        breastMilkVolume: breastMilkVolume === '' ? null : Number(breastMilkVolume),
        formulaVolume: formulaVolume === '' ? null : Number(formulaVolume),
        formulaType: formulaType.trim() ? formulaType.trim() : null,
        dirtyDiapers: dirtyDiapers === '' ? null : Number(dirtyDiapers),
        wetDiapers: wetDiapers === '' ? null : Number(wetDiapers),
        abnormalNotes: abnormalNotes.trim() ? abnormalNotes.trim() : null,
      };

      if (isEdit) {
        await localDiaryApi.updateEntry(id!, entryData);
        navigate(`/diary/${id}`);
      } else {
        const newId = await localDiaryApi.addEntry(entryData);
        navigate(`/diary/${newId}`);
      }
    } catch (error) {
       console.error("Failed to save entry", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-4 py-3.5 border-b border-gray-200 bg-gray-50">
           <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Sửa nhật ký' : 'Viết trang nhật ký mới'}</h2>
         </div>
         <form onSubmit={handleSubmit} className="p-4 sm:p-5">
            <div className="space-y-4">
               <div>
                  <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">
                    Ngày tháng
                  </label>
                  <div className="mt-2 text-rose-500">
                    <input
                      type="date"
                      id="date"
                      required
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="block w-full max-w-sm rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"
                    />
                  </div>
               </div>

               <div>
                 <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                   Tiêu đề <span className="text-red-500">*</span>
                 </label>
                 <div className="mt-2">
                   <input
                     type="text"
                     id="title"
                     required
                     maxLength={150}
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6 font-medium"
                     placeholder="Ví dụ: Bé yêu tròn 1 tháng tuổi..."
                   />
                 </div>
               </div>

               <div>
                 <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">
                   Nội dung nhật ký <span className="text-red-500">*</span>
                 </label>
                 <div className="mt-2">
                   <textarea
                     id="content"
                     rows={5}
                     required
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6 leading-relaxed"
                     placeholder="Viết những suy nghĩ, khoảnh khắc đáng yêu của bé ngày hôm nay..."
                   />
                 </div>
               </div>

               <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Các chỉ số & Theo dõi</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="height" className="block text-sm font-medium leading-6 text-gray-900">Chiều cao (cm)</label>
                        <div className="mt-2">
                          <input type="number" id="height" step="0.1" value={height} onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="weight" className="block text-sm font-medium leading-6 text-gray-900">Cân nặng (kg)</label>
                        <div className="mt-2">
                          <input type="number" id="weight" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="breastMilkVolume" className="block text-sm font-medium leading-6 text-gray-900">Sữa mẹ (ml)</label>
                        <div className="mt-2">
                          <input type="number" id="breastMilkVolume" value={breastMilkVolume} onChange={(e) => setBreastMilkVolume(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="formulaVolume" className="block text-sm font-medium leading-6 text-gray-900">Sữa công thức (ml)</label>
                        <div className="mt-2">
                          <input type="number" id="formulaVolume" value={formulaVolume} onChange={(e) => setFormulaVolume(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                        </div>
                     </div>
                     <div className="sm:col-span-2">
                        <label htmlFor="formulaType" className="block text-sm font-medium leading-6 text-gray-900">Loại sữa công thức</label>
                        <div className="mt-2">
                          <input type="text" id="formulaType" value={formulaType} onChange={(e) => setFormulaType(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" placeholder="Ví dụ: Aptamil, Meiji..." />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="dirtyDiapers" className="block text-sm font-medium leading-6 text-gray-900">Số lượng tã dơ (đi ngoài)</label>
                        <div className="mt-2">
                          <input type="number" id="dirtyDiapers" value={dirtyDiapers} onChange={(e) => setDirtyDiapers(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="wetDiapers" className="block text-sm font-medium leading-6 text-gray-900">Số lượng tã ướt (đi tè)</label>
                        <div className="mt-2">
                          <input type="number" id="wetDiapers" value={wetDiapers} onChange={(e) => setWetDiapers(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-4 border-t border-gray-200">
                 <label htmlFor="abnormalNotes" className="block text-sm font-medium leading-6 text-gray-900">
                   Ghi chú các vấn đề bất thường (nếu có)
                 </label>
                 <div className="mt-2">
                   <textarea
                     id="abnormalNotes"
                     rows={3}
                     value={abnormalNotes}
                     onChange={(e) => setAbnormalNotes(e.target.value)}
                     className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6 leading-relaxed"
                     placeholder="Bé có bị nôn trớ, quấy khóc lạ, hay nổi mẩn đỏ không...?"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                   Hình ảnh (Tối đa 5 ảnh)
                 </label>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                         <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                         <button 
                           type="button"
                           onClick={() => removeImage(idx)}
                           className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white text-red-500 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                            <X className="w-4 h-4" />
                         </button>
                      </div>
                    ))}
                    
                    {images.length < 5 && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-rose-500 hover:border-rose-400 hover:bg-rose-50 cursor-pointer transition-colors"
                      >
                         <ImagePlus className="w-8 h-8 mb-2" />
                         <span className="text-xs font-medium">Thêm ảnh</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                 </div>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="inline-flex items-center rounded-md bg-rose-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50"
              >
                {loading ? (
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                ) : (
                   <Save className="-ml-1 mr-2 h-4 w-4" />
                )}
                {isEdit ? 'Lưu thay đổi' : 'Đăng nhật ký'}
              </button>
            </div>
         </form>
      </div>
    </div>
    </div>
  );
};
