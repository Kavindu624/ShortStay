const { SystemSetting } = require('./backend/models/index');

async function test() {
  await SystemSetting.upsert({ key: 'commissionRate', value: '15' });
  const all = await SystemSetting.findAll();
  console.log('Settings:', all.map(s => s.toJSON()));
}

test().catch(console.error).finally(() => process.exit(0));
