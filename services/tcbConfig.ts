// 腾讯云开发 Web SDK 配置（使用新版 @cloudbase/js-sdk）
import cloudbase from '@cloudbase/js-sdk';

// 写死你的云开发环境 ID，避免被其它环境变量干扰
const ENV_ID = 'ksi360-0gxfgscha37b257a';

console.log('[TCB] ENV_ID (hardcoded) =', ENV_ID);

// 初始化 app / db / auth（v2 官方推荐写法）
const app = cloudbase.init({
  env: ENV_ID,
});

const db = app.database();

const auth = app.auth({
  persistence: 'local', // 本地持久化登录态
});

export { app, db };

// 匿名登录（适合内部系统快速使用）
export const loginAnonymous = async () => {
  try {
    // 使用新版 SDK 提供的匿名登录方法
    if (typeof (auth as any).signInAnonymously === 'function') {
      await (auth as any).signInAnonymously();
    } else if (typeof (auth as any).anonymousAuthProvider === 'function') {
      const provider = (auth as any).anonymousAuthProvider();
      await provider.signIn();
    } else {
      throw new Error('当前 @cloudbase/js-sdk 不支持匿名登录方法，请检查 SDK 版本文档。');
    }
    console.log('匿名登录成功');
  } catch (error: any) {
    console.error('登录失败:', error);
    alert('云开发登录失败：' + (error?.message || String(error)));
    throw error;
  }
};
