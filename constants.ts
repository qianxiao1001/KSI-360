export const SUPERVISORS = [
  "史佳慧",
  "钱啸",
  "李倩",
  "郭建飞",
  "满懿",
  "徐美玲",
  "陈芳",
  "吴敏",
  "征胜男",
  "乔瑞丰",
  "李洁",
  "王泽群",
  "王青青",
  "赵璕",
  "蒋佩玉",
  "杨迪",
  "李双江"
];

export interface MetricConfig {
  title: string;
  description: string;
  scoreLabel?: string; // For negative metrics specifically (e.g. "推诿指数")
}

export const POSITIVE_METRICS: MetricConfig[] = [
  {
    title: "1. 【专业壁垒】行业洞察与专业度",
    description: "打分项：是否对自己负责的领域（如孵化、产业、国际化、AI等）有极深的理解？是该领域的专家，能给团队和客户提供专业指引。"
  },
  {
    title: "2. 【客户导向】尊重客户与服务意识",
    description: "打分项：是否真的把客户（政府/企业/创业者）放在第一位？在利益冲突时，是否能坚持长期主义，不忽悠，交付超预期的服务？"
  },
  {
    title: "3. 【主动担当】责任心与补位意识",
    description: "打分项：面对公司模糊地带的工作或突发危机，是否能说“我来”，而不是“这不归我管”？"
  },
  {
    title: "4. 【拥抱变化】创新与AI应用",
    description: "打分项：是否积极使用新工具（如AI）优化工作流？面对市场和政策变化，是否能快速调整策略，而不是死守旧经验？"
  },
  {
    title: "5. 【团队凝聚】培养人与正能量",
    description: "打分项：团队氛围是否积极向上？是否在用心培养下属，而不是只把下属当工具人？"
  },
  {
    title: "6. 【业绩结果】拿结果的能力",
    description: "打分项：无论过程多难，最终是否拿到了硬碰硬的业绩/交付成果？"
  }
];

export const NEGATIVE_METRICS: MetricConfig[] = [
  {
    title: "1. 【部门墙】推诿扯皮",
    description: "打分项：遇到跨部门协作时，是否习惯性防守、推责，只盯着自己的一亩三分地？",
    scoreLabel: "“推诿指数”"
  },
  {
    title: "2. 【老油条】因循守旧",
    description: "打分项：对新事物（新模式/新要求）是否本能抵触？是否常挂在嘴边“以前都是这么干的”？",
    scoreLabel: "“守旧指数”"
  },
  {
    title: "3. 【伪高管】只传话不落地",
    description: "打分项：是否只做“二传手”，把上面的压力原封不动传给下面，自己没有拆解策略，也没有解决实际困难？",
    scoreLabel: "“悬空指数”"
  },
  {
    title: "4. 【情绪化】破坏团结",
    description: "打分项：是否在公开场合散布负面情绪，或对人不对事，搞小圈子？",
    scoreLabel: "“负能量指数”"
  }
];

// Retain simple string arrays for compatibility with existing storage service logic
export const POSITIVE_QUESTIONS = POSITIVE_METRICS.map(m => m.title);
export const NEGATIVE_QUESTIONS = NEGATIVE_METRICS.map(m => m.title);

export const ADMIN_PASSWORD = "KSI2026";
export const STORAGE_KEY = "ksi_evaluation_data_v2";