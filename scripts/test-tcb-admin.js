import CloudBase from '@cloudbase/node-sdk';

const ENV_ID = process.env.VITE_TCB_ENV_ID;
const SECRET_ID = process.env.TENCENTCLOUD_SECRET_ID;
const SECRET_KEY = process.env.TENCENTCLOUD_SECRET_KEY;

if (!ENV_ID || !SECRET_ID || !SECRET_KEY) {
  console.error('Missing required env vars. Ensure VITE_TCB_ENV_ID, TENCENTCLOUD_SECRET_ID and TENCENTCLOUD_SECRET_KEY are set.');
  process.exit(1);
}

const app = CloudBase.init({
  env: ENV_ID,
  secretId: SECRET_ID,
  secretKey: SECRET_KEY,
});

const db = app.database();

(async () => {
  try {
    console.log('Using CloudBase env:', ENV_ID);
    const res = await db.collection('evaluations').add({
      createdAt: new Date().toISOString(),
      text: 'admin sdk test write',
      source: 'admin-test-script'
    });
    console.log('插入结果 (id):', res.id || res);
    process.exit(0);
  } catch (err) {
    console.error('Error performing admin write:', err);
    process.exit(2);
  }
})();
