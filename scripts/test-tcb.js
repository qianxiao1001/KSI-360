import fs from 'fs';
import path from 'path';
import tcb from 'tcb-js-sdk';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  });
}

const ENV_ID = env.VITE_TCB_ENV_ID || process.env.VITE_TCB_ENV_ID;
if (!ENV_ID) {
  console.error('VITE_TCB_ENV_ID not found. Set it in .env.local or env vars.');
  process.exit(1);
}

const app = tcb.init({ env: ENV_ID });
const db = app.database();

(async () => {
  try {
    console.log('ENV_ID:', ENV_ID);
    await app.auth().anonymousAuthProvider().signIn();
    console.log('匿名登录成功');
    const res = await db.collection('evaluations').add({ createdAt: new Date(), text: 'test from script' });
    console.log('插入结果', res);
  } catch (err) {
    console.error('出错了:', err);
    process.exit(2);
  }
})();
