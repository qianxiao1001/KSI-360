import { EvaluationRecord, AggregatedData } from '../types';
import { POSITIVE_QUESTIONS, NEGATIVE_QUESTIONS } from '../constants';
import { db, loginAnonymous } from './tcbConfig';

const COLLECTION_NAME = 'evaluations';

export const saveEvaluation = async (record: Omit<EvaluationRecord, 'id' | 'timestamp'>): Promise<void> => {
  await loginAnonymous();
  
  const collection = db.collection(COLLECTION_NAME);
  
  // 删除已有记录（避免重复）
  const existRes = await collection
    .where({
      evaluator: record.evaluator,
      target: record.target
    })
    .get();
    
  if (existRes.data && existRes.data.length > 0) {
    for (const doc of existRes.data) {
      await collection.doc(doc._id).remove();
    }
  }
  
  // 插入新记录
  await collection.add({
    ...record,
    timestamp: new Date().toISOString(),
    createdAt: db.serverDate()
  });
};

export const getEvaluations = async (): Promise<EvaluationRecord[]> => {
  await loginAnonymous();
  
  const res = await db.collection(COLLECTION_NAME)
    .orderBy('timestamp', 'desc')
    .get();
    
  return res.data || [];
};

export const clearAllEvaluations = async (): Promise<number> => {
  await loginAnonymous();
  
  const collection = db.collection(COLLECTION_NAME);
  console.log('[clearAllEvaluations] 开始获取所有记录...');
  
  const res = await collection.get();
  console.log('[clearAllEvaluations] 查询结果:', res);
  
  let deleteCount = 0;
  
  if (res.data && res.data.length > 0) {
    console.log(`[clearAllEvaluations] 共找到 ${res.data.length} 条记录，开始删除...`);
    
    for (const doc of res.data) {
      try {
        console.log(`[clearAllEvaluations] 正在删除记录:`, doc._id);
        const deleteRes = await collection.doc(doc._id).remove();
        console.log(`[clearAllEvaluations] 删除结果:`, deleteRes);
        deleteCount++;
        console.log(`[clearAllEvaluations] 已删除 ${deleteCount}/${res.data.length} 条记录`);
      } catch (err: any) {
        console.error('[clearAllEvaluations] 删除记录失败:', doc._id, err);
        
        let errorMessage = '删除失败！\n\n';
        if (err.message && err.message.includes('permission')) {
          errorMessage += '❌ 数据库权限不足\n\n';
        } else {
          errorMessage += '❌ 发生错误: ' + (err.message || String(err)) + '\n\n';
        }
        
        errorMessage += '🔧 解决方案：\n';
        errorMessage += '1. 请登录腾讯云控制台\n';
        errorMessage += '2. 进入云开发 → 数据库\n';
        errorMessage += '3. 找到 evaluations 集合\n';
        errorMessage += '4. 点击"安全规则"\n';
        errorMessage += '5. 将规则修改为：\n';
        errorMessage += '   {\n';
        errorMessage += '     "read": true,\n';
        errorMessage += '     "write": true\n';
        errorMessage += '   }\n';
        errorMessage += '6. 点击"确定"保存\n\n';
        errorMessage += '配置完成后请重试！';
        
        alert(errorMessage);
        throw err;
      }
    }
  } else {
    console.log('[clearAllEvaluations] 没有找到需要删除的记录');
  }
  
  console.log(`[clearAllEvaluations] 删除完成，共删除 ${deleteCount} 条记录`);
  return deleteCount;
};

export const getEvaluationStats = async (targetName: string): Promise<AggregatedData | null> => {
  await loginAnonymous();
  
  const res = await db.collection(COLLECTION_NAME)
    .where({ target: targetName })
    .get();
    
  const targetRecords = res.data || [];
  
  if (targetRecords.length === 0) return null;
  
  const count = targetRecords.length;
  
  const posSums: Record<string, number> = {};
  const negSums: Record<string, number> = {};
  
  POSITIVE_QUESTIONS.forEach(q => posSums[q] = 0);
  NEGATIVE_QUESTIONS.forEach(q => negSums[q] = 0);
  
  const commentsStart: { text: string; evaluator: string }[] = [];
  const commentsStop: { text: string; evaluator: string }[] = [];
  const commentsContinue: { text: string; evaluator: string }[] = [];
  
  targetRecords.forEach((record: any) => {
    POSITIVE_QUESTIONS.forEach(q => posSums[q] += (record.pos_scores?.[q] || 0));
    NEGATIVE_QUESTIONS.forEach(q => negSums[q] += (record.neg_scores?.[q] || 0));
    
    if (record.text_start) commentsStart.push({ text: record.text_start, evaluator: record.evaluator });
    if (record.text_stop) commentsStop.push({ text: record.text_stop, evaluator: record.evaluator });
    if (record.text_continue) commentsContinue.push({ text: record.text_continue, evaluator: record.evaluator });
  });
  
  const avgPos: Record<string, number> = {};
  const avgNeg: Record<string, number> = {};
  
  POSITIVE_QUESTIONS.forEach(q => avgPos[q] = parseFloat((posSums[q] / count).toFixed(1)));
  NEGATIVE_QUESTIONS.forEach(q => avgNeg[q] = parseFloat((negSums[q] / count).toFixed(1)));
  
  return {
    target: targetName,
    avgPos,
    avgNeg,
    commentsStart,
    commentsStop,
    commentsContinue,
    count
  };
};

export const downloadCSV = async () => {
  const data = await getEvaluations();
  if (data.length === 0) return;
  
  const headers = [
    "Time",
    "Evaluator",
    "Target",
    ...POSITIVE_QUESTIONS.map(q => `POS_${q.substring(0, 5)}`),
    ...NEGATIVE_QUESTIONS.map(q => `NEG_${q.substring(0, 5)}`),
    "Start_Suggestion",
    "Stop_Suggestion",
    "Continue_Suggestion"
  ];
  
  const csvRows = [headers.join(",")];
  
  data.forEach((row: any) => {
    const values = [
      `"${row.timestamp}"`,
      `"${row.evaluator}"`,
      `"${row.target}"`,
      ...POSITIVE_QUESTIONS.map(q => row.pos_scores?.[q] || 0),
      ...NEGATIVE_QUESTIONS.map(q => row.neg_scores?.[q] || 0),
      `"${(row.text_start || '').replace(/"/g, '""')}"`,
      `"${(row.text_stop || '').replace(/"/g, '""')}"`,
      `"${(row.text_continue || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(values.join(","));
  });
  
  const csvString = "\uFEFF" + csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `ksi_eval_v2_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const backupData = async (): Promise<string> => {
  const data = await getEvaluations();
  const backup = {
    version: '2.0',
    timestamp: new Date().toISOString(),
    count: data.length,
    data: data
  };
  
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `ksi_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  addOperationLog('backup', `备份了 ${data.length} 条评价数据`);
  
  return `成功备份 ${data.length} 条数据`;
};

export const restoreData = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        
        if (!backup.version || !backup.data || !Array.isArray(backup.data)) {
          throw new Error('无效的备份文件格式');
        }
        
        await loginAnonymous();
        const collection = db.collection(COLLECTION_NAME);
        
        let successCount = 0;
        let failCount = 0;
        
        for (const record of backup.data) {
          try {
            const existRes = await collection
              .where({
                evaluator: record.evaluator,
                target: record.target
              })
              .get();
              
            if (existRes.data && existRes.data.length > 0) {
              for (const doc of existRes.data) {
                await collection.doc(doc._id).remove();
              }
            }
            
            await collection.add({
              ...record,
              restoredAt: new Date().toISOString()
            });
            
            successCount++;
          } catch (err) {
            console.error('恢复记录失败:', record, err);
            failCount++;
          }
        }
        
        addOperationLog('restore', `恢复了 ${successCount} 条数据，失败 ${failCount} 条`);
        
        resolve(`成功恢复 ${successCount} 条数据${failCount > 0 ? `，失败 ${failCount} 条` : ''}`);
      } catch (err: any) {
        reject(new Error('恢复失败: ' + (err.message || String(err))));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsText(file);
  });
};

export interface OperationLog {
  action: string;
  details: string;
  timestamp: string;
  user?: string;
}

const LOG_STORAGE_KEY = 'ksi_operation_logs';

export const addOperationLog = (action: string, details: string, user?: string): void => {
  const logs: OperationLog[] = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
  
  logs.unshift({
    action,
    details,
    timestamp: new Date().toISOString(),
    user
  });
  
  if (logs.length > 100) {
    logs.splice(100);
  }
  
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
};

export const getOperationLogs = (): OperationLog[] => {
  return JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
};

export const clearOperationLogs = (): void => {
  localStorage.removeItem(LOG_STORAGE_KEY);
};
