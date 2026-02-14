import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { 
  User, 
  ShieldCheck, 
  BarChart3, 
  Download, 
  CheckCircle2, 
  PlayCircle,
  StopCircle,
  FastForward,
  Trash2,
  FileText,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { 
  SUPERVISORS, 
  POSITIVE_QUESTIONS, 
  NEGATIVE_QUESTIONS, 
  POSITIVE_METRICS, 
  NEGATIVE_METRICS, 
  ADMIN_PASSWORD,
  USER_ACCOUNTS
} from './constants';
import { saveEvaluation, getEvaluationStats, downloadCSV, clearAllEvaluations, getEvaluations } from './services/cloudStorageService';
import { RadarView } from './components/RadarChart';
import SingleRadar from './components/SingleRadarChart';
import { AggregatedData } from './types';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';

// --- Helper Components ---

interface SliderInputProps {
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  colorClass: string;
  minVal?: number;
  maxVal?: number;
  description?: string;
  scoreLabel?: string;
}

const SliderInput: React.FC<SliderInputProps> = ({ 
  label, 
  value, 
  onChange, 
  colorClass,
  minVal = 1,
  maxVal = 10,
  description,
  scoreLabel
}) => (
  <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-slate-100 hover:border-slate-300 transition-colors">
    <div className="flex flex-col mb-1">
      <div className="flex justify-between items-start md:items-center gap-2 mb-1">
        <label className="text-sm font-bold text-slate-800 flex-1 leading-snug">{label}</label>
        <div className="flex flex-col items-center min-w-[50px]">
           <span className={`text-xl font-bold ${colorClass} bg-slate-50 rounded px-2`}>{value}</span>
           <span className="text-[10px] text-slate-400">分</span>
        </div>
      </div>
      
      {description && (
        <div className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed text-justify">
          {description}
        </div>
      )}
    </div>

    <div className="flex items-center gap-3">
       {scoreLabel && <span className="text-[10px] font-bold text-slate-500 w-16 text-right">{scoreLabel}:</span>}
       <input
        type="range"
        min={minVal}
        max={maxVal}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-current"
        style={{ accentColor: colorClass.includes('red') ? '#e11d48' : '#1A1A1A' }}
      />
    </div>
    
    <div className={`flex justify-between text-[10px] text-slate-400 mt-1 ${scoreLabel ? 'pl-20' : ''}`}>
      <span>{minVal}</span>
      <span>{(maxVal + minVal)/2}</span>
      <span>{maxVal}</span>
    </div>
  </div>
);

// --- Print Component ---

const PrintableReport: React.FC<{ target: string }> = ({ target }) => {
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    const loadStats = async () => {
      const data = await getEvaluationStats(target);
      setStats(data);
    };
    loadStats();
  }, [target]);

  if (!stats) return null;

  return (
    <div className="pdf-page p-12 bg-white mb-8" id={`report-${target}`} style={{ width: '1200px', minHeight: '1600px' }}>
      <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-bold text-slate-900">{target}</h1>
           <p className="text-slate-500 text-xl mt-2">360度高管互评反馈报告 (2026)</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">收到评价</div>
          <div className="text-3xl font-bold text-blue-600">{stats.count}</div>
        </div>
      </div>

      <div className="h-[500px] mb-12">
        <RadarView data={stats} disableAnimation={true} />
      </div>

      <div className="space-y-8">
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
           <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
             <PlayCircle className="w-6 h-6" /> Start (建议开始做)
           </h3>
           <ul className="space-y-3">
              {stats.commentsStart.map((c: any, i) => (
                <li key={i} className="text-slate-800 bg-white p-3 rounded shadow-sm text-lg">
                  <div className="text-sm text-slate-400 mb-1">评价人：{c.evaluator}</div>
                  <div>{typeof c === 'string' ? c : c.text}</div>
                </li>
              ))}
              {stats.commentsStart.length === 0 && <p className="text-slate-400 italic">暂无建议</p>}
           </ul>
        </div>

        <div className="bg-rose-50 rounded-xl p-6 border border-rose-100">
           <h3 className="text-xl font-bold text-rose-800 mb-4 flex items-center gap-2">
             <StopCircle className="w-6 h-6" /> Stop (建议停止做)
           </h3>
           <ul className="space-y-3">
              {stats.commentsStop.map((c: any, i) => (
                <li key={i} className="text-slate-800 bg-white p-3 rounded shadow-sm text-lg">
                  <div className="text-sm text-slate-400 mb-1">评价人：{c.evaluator}</div>
                  <div>{typeof c === 'string' ? c : c.text}</div>
                </li>
              ))}
               {stats.commentsStop.length === 0 && <p className="text-slate-400 italic">暂无建议</p>}
           </ul>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
           <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
             <FastForward className="w-6 h-6" /> Continue (建议坚持做)
           </h3>
           <ul className="space-y-3">
              {stats.commentsContinue.map((c: any, i) => (
                <li key={i} className="text-slate-800 bg-white p-3 rounded shadow-sm text-lg">
                  <div className="text-sm text-slate-400 mb-1">评价人：{c.evaluator}</div>
                  <div>{typeof c === 'string' ? c : c.text}</div>
                </li>
              ))}
               {stats.commentsContinue.length === 0 && <p className="text-slate-400 italic">暂无建议</p>}
           </ul>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
         Generated by KSI 360 System
      </div>
    </div>
  );
}

// --- Main Pages ---

const EvaluationMode = ({ 
  currentUser, 
  onSuccess 
}: { 
  currentUser: string; 
  onSuccess: () => void; 
}) => {
  const targets = useMemo(() => SUPERVISORS.filter(s => s !== currentUser), [currentUser]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [posScores, setPosScores] = useState<Record<string, number>>({});
  const [negScores, setNegScores] = useState<Record<string, number>>({});
  
  const [textStart, setTextStart] = useState("");
  const [textStop, setTextStop] = useState("");
  const [textContinue, setTextContinue] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTarget = targets[currentIndex];

  useEffect(() => {
    const loadExistingRecord = async () => {
      if (currentTarget) {
        const allRecords = await getEvaluations();
        const existingRecord = allRecords.find(r => r.evaluator === currentUser && r.target === currentTarget);

        if (existingRecord) {
           setPosScores(existingRecord.pos_scores);
           setNegScores(existingRecord.neg_scores);
           setTextStart(existingRecord.text_start || "");
           setTextStop(existingRecord.text_stop || "");
           setTextContinue(existingRecord.text_continue || "");
        } else {
           const pInit: Record<string, number> = {};
           const nInit: Record<string, number> = {};
           POSITIVE_QUESTIONS.forEach(q => pInit[q] = 5);
           NEGATIVE_QUESTIONS.forEach(q => nInit[q] = 0);
           setPosScores(pInit);
           setNegScores(nInit);
           setTextStart("");
           setTextStop("");
           setTextContinue("");
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    loadExistingRecord();
  }, [currentTarget, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTarget) return;
    
    const defaultPosScores: Record<string, number> = {};
    const defaultNegScores: Record<string, number> = {};
    POSITIVE_QUESTIONS.forEach(q => defaultPosScores[q] = 5);
    NEGATIVE_QUESTIONS.forEach(q => defaultNegScores[q] = 0);
    
    const isDefaultPosScores = POSITIVE_QUESTIONS.every(q => posScores[q] === defaultPosScores[q]);
    const isDefaultNegScores = NEGATIVE_QUESTIONS.every(q => negScores[q] === defaultNegScores[q]);
    const hasNoText = !textStart && !textStop && !textContinue;
    
    if (isDefaultPosScores && isDefaultNegScores && hasNoText) {
      if (!window.confirm("还未做出评价，确认提交吗？\n\n您还没有修改任何评分或填写建议。")) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    await saveEvaluation({
      evaluator: currentUser,
      target: currentTarget,
      pos_scores: posScores,
      neg_scores: negScores,
      text_start: textStart,
      text_stop: textStop,
      text_continue: textContinue
    });
    
    onSuccess();

    if (currentIndex < targets.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
    
    setIsSubmitting(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in px-4">
        <div className="bg-white p-8 md:p-12 ksi-card max-w-2xl w-full shadow-glow">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">填写完成</h2>
            <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
              您已完成所有主管的评价。<br/>
              感谢您的认真反馈！数据已安全保存。
            </p>
        </div>
      </div>
    );
  }

  if (targets.length === 0) {
    return <div className="text-center mt-20 text-slate-500">没有需要评价的对象。</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in pb-24">
      <div className="sticky top-14 z-20 bg-slate-50/95 backdrop-blur-sm py-2 md:static md:bg-transparent md:py-0 md:mb-6 transition-all">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-6 mx-0 sticky-header">
          <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                 <div className="text-[10px] text-slate-500 font-medium mb-0.5">评价人</div>
                 <div className="text-base md:text-xl font-bold text-slate-900 flex items-center gap-1">
                   <span className="truncate">{currentUser}</span>
                 </div>
              </div>
              <div className="w-px h-8 bg-slate-200 mx-3 md:mx-6 shrink-0"></div>
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-1 mb-0.5">
                   <span className="text-[10px] text-ksi-black font-bold">正在评价</span>
                   <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded-full">{currentIndex + 1}/{targets.length}</span>
                 </div>
                 <div className="text-lg md:text-3xl font-bold text-ksi-black truncate">
                   {currentTarget}
                 </div>
              </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <div className="bg-ksi-yellow text-ksi-black p-3 md:p-4 rounded-t-xl shadow-sm flex items-center gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-ksi-black/10 flex items-center justify-center font-extrabold text-sm md:text-base">1</div>
              <h3 className="text-base md:text-xl font-black uppercase">正向价值雷达 (1-10分)</h3>
            </div>
            <div className="bg-white border-x border-b border-slate-200 p-3 md:p-6 rounded-b-xl shadow-sm">
              <p className="text-xs md:text-sm text-slate-600 italic mb-4 bg-yellow-50 p-2 md:p-3 rounded border border-yellow-100">
                *请基于该主管全年的实际表现打分。<strong>1分=完全不具备，10分=行业标杆/公司典范</strong>。*
              </p>
              
              <div className="space-y-3 md:space-y-6">
                {POSITIVE_METRICS.map((metric, idx) => (
                  <SliderInput
                    key={metric.title}
                    label={metric.title}
                    value={posScores[metric.title] ?? 5}
                    onChange={(val) => setPosScores(prev => ({ ...prev, [metric.title]: val }))}
                    colorClass="text-ksi-black"
                    minVal={1}
                    maxVal={10}
                    description={metric.description}
                  />
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="bg-rose-600 text-white p-3 md:p-4 rounded-t-xl shadow-sm flex items-center gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm md:text-base">2</div>
              <h3 className="text-base md:text-xl font-bold">负向行为警示 (0-10分)</h3>
            </div>
            <div className="bg-white border-x border-b border-slate-200 p-3 md:p-6 rounded-b-xl shadow-sm">
              <p className="text-xs md:text-sm text-slate-600 italic mb-4 bg-rose-50 p-2 md:p-3 rounded border border-rose-100">
                *⚠️注意：此处为<strong>负面打分</strong>。请评价该主管出现以下行为的<strong>频率</strong>。<br/>
                <strong>0分=从未出现（完美），5分=偶尔出现，10分=非常严重/经常出现</strong>。*
              </p>

              <div className="space-y-3 md:space-y-6">
                {NEGATIVE_METRICS.map((metric, idx) => (
                  <SliderInput
                    key={metric.title}
                    label={metric.title}
                    value={negScores[metric.title] ?? 0}
                    onChange={(val) => setNegScores(prev => ({ ...prev, [metric.title]: val }))}
                    colorClass="text-rose-600"
                    minVal={0}
                    maxVal={10}
                    description={metric.description}
                    scoreLabel={metric.scoreLabel}
                  />
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="bg-ksi-black text-white p-3 md:p-4 rounded-t-xl shadow-sm flex items-center gap-2">
               <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm md:text-base">3</div>
              <h3 className="text-base md:text-xl font-bold">一针见血 (Start, Stop, Continue)</h3>
            </div>
            <div className="bg-white border-x border-b border-slate-200 p-3 md:p-6 rounded-b-xl shadow-sm">
              <p className="text-xs md:text-sm text-slate-600 italic mb-4 bg-slate-50 p-2 md:p-3 rounded border border-slate-100">
                *请用<strong>极简短的语言</strong>（一句话）给出你的核心建议，直击要害。* <span className="text-ksi-black font-bold ml-1">如无建议可以不写</span>
              </p>

              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" /> 
                    1. Start (建议开始做)：
                  </label>
                  <textarea
                    value={textStart}
                    onChange={(e) => setTextStart(e.target.value)}
                    className="w-full h-16 md:h-20 p-3 ksi-input focus:ring-2 focus:ring-ksi-black text-sm"
                    placeholder="答："
                  ></textarea>
                </div>

                <div className="space-y-2 pt-3 md:pt-4 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                    <StopCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-600" /> 
                    2. Stop (建议停止做)：
                  </label>
                  <textarea
                    value={textStop}
                    onChange={(e) => setTextStop(e.target.value)}
                    className="w-full h-16 md:h-20 p-3 ksi-input focus:ring-2 focus:ring-ksi-black text-sm"
                    placeholder="答："
                  ></textarea>
                </div>

                <div className="space-y-2 pt-3 md:pt-4 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FastForward className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> 
                    3. Continue (建议坚持做)：
                  </label>
                  <textarea
                    value={textContinue}
                    onChange={(e) => setTextContinue(e.target.value)}
                    className="w-full h-16 md:h-20 p-3 ksi-input focus:ring-2 focus:ring-ksi-black text-sm"
                    placeholder="答："
                  ></textarea>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-center pt-2 pb-12 gap-3">
             {currentIndex > 0 ? (
               <button
                 type="button"
                 onClick={handlePrevious}
                 disabled={isSubmitting}
                 className="px-6 py-3 rounded-xl font-bold text-ksi-black bg-white border-2 border-ksi-black text-base shadow-md flex items-center justify-center gap-2 hover:bg-slate-50 transition-all w-full md:w-auto"
               >
                 <ArrowLeft className="w-4 h-4" />
                 <span className="md:hidden">上一位</span>
                 <span className="hidden md:inline">返回上一位</span>
               </button>
             ) : (
               <div className="hidden md:block w-[180px]"></div>
             )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full md:w-auto px-10 py-3 rounded-xl font-extrabold text-white text-base shadow-xl flex items-center justify-center gap-2 transform transition-all
                ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'btn-ksi-primary'}
              `}
            >
              {isSubmitting ? '提交中...' : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {currentIndex < targets.length - 1 ? '提交并评价下一位' : '完成所有评价'}
                </>
              )}
            </button>
          </div>
      </form>
    </div>
  );
};

const AdminDashboard = () => {
  const [selectedTarget, setSelectedTarget] = useState<string>(SUPERVISORS[0]);
  const [stats, setStats] = useState<AggregatedData | null>(null);
  const [givenByTarget, setGivenByTarget] = useState<any[]>([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await getEvaluationStats(selectedTarget);
      setStats(data);
      
      const allEvaluations = await getEvaluations();
      const targetEvaluations = allEvaluations.filter((e: any) => e.evaluator === selectedTarget);
      setGivenByTarget(targetEvaluations);
    };
    loadData();
  }, [selectedTarget]);

  useEffect(() => {
    if (isExporting) {
      const generatePDF = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const container = document.getElementById('pdf-export-container');
          if (!container) throw new Error("Export container not found.");

          const doc = new jsPDF('p', 'pt', 'a4');
          const reports = container.querySelectorAll('.pdf-page');
          let pageAdded = false;

          for (let i = 0; i < reports.length; i++) {
            const report = reports[i] as HTMLElement;
            if (!report.offsetParent && report.offsetHeight === 0) continue;

            if (pageAdded) doc.addPage();
            const canvas = await html2canvas(report, { 
              scale: 2, 
              useCORS: true, 
              logging: false,
              backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pageAdded = true;
          }

          if (pageAdded) {
            doc.save(`ksi_360_full_report_${new Date().toISOString().slice(0, 10)}.pdf`);
          } else {
            alert("没有可导出的数据。");
          }

        } catch (error) {
          console.error("PDF Export failed", error);
          alert("导出PDF失败，请重试。");
        } finally {
          setIsExporting(false);
        }
      };
      generatePDF();
    }
  }, [isExporting]);

  const handleClearData = async () => {
    if (window.confirm("⚠️ 警告：确定要清空所有调研数据吗？\n\n此操作将：\n1. 清空所有评价数据\n2. 重置所有用户的提交状态\n3. 允许所有用户重新填写评价\n\n此操作不可恢复！")) {
      await clearAllEvaluations();
      localStorage.removeItem('ksi_evaluations_reset');
      localStorage.setItem('ksi_evaluations_reset', new Date().toISOString());
      setStats(null);
      alert("数据已清空，所有用户的提交状态已重置。");
    }
  };

  const handleTestDB = async () => {
    try {
      const randomId = Math.random().toString(36).substring(2, 8);
      const sample = {
        evaluator: `debug_tester_${randomId}`,
        target: selectedTarget || 'debug_target',
        pos_scores: POSITIVE_QUESTIONS.reduce((acc, q) => ({ ...acc, [q]: 5 }), {} as any),
        neg_scores: NEGATIVE_QUESTIONS.reduce((acc, q) => ({ ...acc, [q]: 0 }), {} as any),
        text_start: '测试写入 - start',
        text_stop: '测试写入 - stop',
        text_continue: '测试写入 - continue'
      };
      // @ts-ignore
      await saveEvaluation(sample);
      alert('测试写入成功，已插入 evaluations 集合。');
      const data = await getEvaluationStats(sample.target);
      setStats(data);
    } catch (err: any) {
      console.error(err);
      alert('测试写入失败：' + (err?.message || String(err)));
    }
  };

  const handleExportPDF = () => {
    if (isExporting) return;
    setIsExporting(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-ksi-black" />
          管理驾驶舱
        </h2>
        
        <div className="flex items-center gap-3">
          <button onClick={handleTestDB} className="bg-white border border-slate-200 hover:bg-slate-50 text-ksi-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm">
            DB 测试写入
          </button>
          <button onClick={handleClearData} className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm">
            <Trash2 className="w-4 h-4" /> 清空记录
          </button>
          <button onClick={handleExportPDF} disabled={isExporting} className="btn-ksi-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm disabled:opacity-50">
            <FileText className="w-4 h-4" /> {isExporting ? '生成中...' : '导出PDF'}
          </button>
          <button onClick={downloadCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm">
            <Download className="w-4 h-4" /> 导出CSV
          </button>
        </div>
      </div>

      {isExporting && (
        <div id="pdf-export-container" className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none">
          {SUPERVISORS.map(s => <PrintableReport key={s} target={s} />)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* 合并模块：选择查看对象(80%) + 收到评价(20%) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1" style={{ width: '80%' }}>
                <label className="block text-sm font-bold text-slate-500 mb-1">选择查看对象</label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">选择查看对象</option>
                  {SUPERVISORS.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-shrink-0 text-right" style={{ width: '20%', minWidth: '80px' }}>
                <div className="text-xs text-slate-400 uppercase font-bold mb-1">收到评价</div>
                <div className="text-xl font-bold text-blue-600">{stats?.count || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {stats ? (
            <>
              <RadarView data={stats} disableAnimation={true} />
              
              {/* 给出的评价模块 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-blue-600" />
                    {selectedTarget} 给出的评价
                  </h3>
                  
                  {/* 下拉菜单选择被评价人 */}
                  <select
                    value={selectedEvaluator}
                    onChange={(e) => setSelectedEvaluator(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">选择被评价人</option>
                    {Array.from(new Set(givenByTarget.map(r => r.target))).sort().map(target => (
                      <option key={target} value={target}>{target}</option>
                    ))}
                  </select>
                </div>
                
                {selectedEvaluator ? (
                  <div className="space-y-4">
                    {givenByTarget.filter((r: any) => r.target === selectedEvaluator).map((record: any, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                        title={`评价人：${record.evaluator || '未知'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-sm font-bold text-slate-800">评价对象：{record.target}</span>
                          <span className="text-xs text-slate-400">{record.timestamp ? new Date(record.timestamp).toLocaleDateString() : ''}</span>
                        </div>
                        
                        {/* 雷达图展示评价详情 */}
                        <SingleRadar 
                          posScores={record.pos_scores || {}} 
                          negScores={record.neg_scores || {}} 
                          disableAnimation={true} 
                        />
                        
                        {record.text_start && (
                          <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-1">
                              <FastForward className="w-4 h-4" /> Continue
                            </h4>
                            <p className="text-sm text-slate-700">{record.text_start}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm italic">请选择被评价人查看详细评价</div>
                )}
              </div>
              
              {/* 收到的建议模块 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Start", icon: PlayCircle, color: "emerald", list: stats.commentsStart },
                  { title: "Stop", icon: StopCircle, color: "rose", list: stats.commentsStop },
                  { title: "Continue", icon: FastForward, color: "blue", list: stats.commentsContinue }
                ].map((section, idx) => (
                  <div key={idx} className={`bg-white rounded-xl shadow-sm border border-${section.color}-100 overflow-hidden`}>
                    <div className={`bg-${section.color}-50 px-4 py-3 border-b border-${section.color}-100 flex items-center gap-2`}>
                      <section.icon className={`w-5 h-5 text-${section.color}-600`} />
                      <h3 className={`font-bold text-slate-800`}>{section.title}</h3>
                    </div>
                    <div className="p-4 max-h-[300px] overflow-y-auto">
                      <ul className="space-y-3">
                        {section.list.map((c: any, i) => (
                          <li 
                            key={i} 
                            className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                            title={`评价人：${c.evaluator || '未知'}`}
                          >
                            {typeof c === 'string' ? c : c.text}
                          </li>
                        ))}
                        {section.list.length === 0 && <div className="text-slate-400 text-sm italic">暂无建议</div>}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center text-slate-400">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>暂无该主管的评价数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'login' | 'eval' | 'admin'>('login');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleStart = async () => {
    const user = USER_ACCOUNTS.find(u => u.username === username && u.password === loginPassword);
    if (user) {
      const allEvaluations = await getEvaluations();
      const userEvaluations = allEvaluations.filter((e: any) => e.evaluator === user.name);
      const targets = SUPERVISORS.filter(s => s !== user.name);
      
      const resetTimestamp = localStorage.getItem('ksi_evaluations_reset');
      
      if (userEvaluations.length >= targets.length && !resetTimestamp) {
        setHasSubmitted(true);
        alert("已完成提交\n\n您已经完成了所有评价，感谢您的参与！");
        return;
      }
      
      setCurrentUser(user.name);
      setView('eval');
      alert("温馨提示\n\n本次评价结果仅供公司CEO参考，不对工作业绩和绩效结果产生影响，数据不做公开和使用。");
    } else {
      alert("账号或密码错误");
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setView('admin');
    } else {
      alert("管理员密码错误");
    }
  };

  const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt0v71RoqPf_-xPhJBYxxvJ-dWSbLhjzM7Mg&s";

  return (
    <div className="min-h-screen bg-ksi-yellow font-sans text-slate-900 transition-colors duration-300">
      {view === 'login' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
          <div className="ksi-card p-8 md:p-12 max-w-md w-full shadow-glow">
            <div className="flex justify-center mb-8">
              <img 
                src={logoUrl} 
                alt="KSI Logo" 
                className="w-full h-auto max-h-24 object-contain"
              />
            </div>
            
            <h1 className="text-2xl font-black text-center text-ksi-black mb-1 tracking-tight">360评价反馈系统</h1>
            <p className="text-center text-slate-400 mb-10 text-sm font-bold uppercase tracking-widest">KSI Management Evaluation</p>

            <div className="space-y-8">
               <div className="space-y-3">
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                   我是评价人 · USER LOGIN
                 </label>
                 <div className="flex flex-col gap-4">
                   <input 
                     type="text" 
                     placeholder="请输入账号"
                     className="w-full p-4 ksi-input appearance-none text-slate-800 font-bold focus:ring-2 focus:ring-ksi-black transition-all bg-white"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                   />
                   <input 
                     type="password" 
                     placeholder="请输入密码"
                     className="w-full p-4 ksi-input appearance-none text-slate-800 font-bold focus:ring-2 focus:ring-ksi-black transition-all bg-white"
                     value={loginPassword}
                     onChange={(e) => setLoginPassword(e.target.value)}
                   />
                   <button 
                     onClick={handleStart}
                     disabled={!username || !loginPassword}
                     className="w-full py-4 btn-ksi-primary rounded-xl font-black text-lg shadow-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                   >
                     进入评价系统
                   </button>
                 </div>
               </div>

               <div className="relative py-2">
                 <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-slate-100"></div>
                 </div>
                 <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-slate-300 font-black bg-white px-3">
                   ADMINISTRATION
                 </div>
               </div>

               <form onSubmit={handleAdminLogin} className="space-y-3">
                 <div className="flex gap-3">
                   <input 
                     type="password" 
                     placeholder="输入管理员密码"
                     className="flex-1 p-3 ksi-input font-medium bg-white"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                   <button 
                     type="submit"
                     className="px-6 bg-slate-100 text-ksi-black rounded-xl font-black hover:bg-slate-200 transition-all border border-slate-200"
                   >
                     管理
                   </button>
                 </div>
               </form>
            </div>
          </div>
          <p className="mt-8 text-ksi-black/60 text-[10px] font-black tracking-widest uppercase">© 2026 KR STAR INNOVATION</p>
        </div>
      )}

      {view === 'eval' && (
        <div className="relative min-h-screen pb-12 bg-slate-50">
           <div className="fixed top-0 left-0 right-0 h-14 bg-ksi-yellow border-b border-ksi-black/10 z-30 flex items-center justify-between px-3 md:px-8 shadow-md">
              <div className="flex items-center gap-3">
                 <button 
                  onClick={() => setView('login')}
                  className="flex items-center gap-2 text-ksi-black font-black transition-colors py-1.5 px-3 rounded-lg hover:bg-ksi-black/5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">退出系统</span>
                </button>
              </div>
              <div className="font-black text-ksi-black text-xs uppercase tracking-tighter">
                EVALUATOR: {currentUser}
              </div>
           </div>
           
           <div className="pt-16 px-3 md:px-8">
              <EvaluationMode 
                currentUser={currentUser} 
                onSuccess={() => {}} 
              />
           </div>
        </div>
      )}

      {view === 'admin' && (
        <div className="relative min-h-screen bg-slate-100">
           <div className="bg-white shadow-md sticky top-0 z-30">
              <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt0v71RoqPf_-xPhJBYxxvJ-dWSbLhjzM7Mg&s" alt="氪星创服" className="h-8" />
                </div>
                <button 
                  onClick={() => setView('login')}
                  className="flex items-center gap-2 text-slate-800 hover:text-black font-medium transition-colors py-1 px-3 rounded hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                  退出管理
                </button>
              </div>
           </div>

           <div className="pt-8 pb-12 px-4 md:px-8">
              <AdminDashboard />
           </div>
        </div>
      )}
    </div>
  );
}