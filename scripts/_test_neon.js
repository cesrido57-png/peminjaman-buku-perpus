const { Client } = require('pg');
const url = 'postgresql://neondb_owner:npg_xjQw0a1UGhnP@ep-steep-violet-b3gaicsl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const c = new Client({ connectionString: url });
c.connect()
  .then(() => c.query('SELECT current_database() AS db, current_schema() AS schema'))
  .then((r) => {
    console.log('OK ->', JSON.stringify(r.rows[0]));
    return c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'").then((t) => {
      console.log('tables ->', t.rows.map((x) => x.table_name).join(', ') || '(none)');
      return c.end();
    });
  })
  .catch((e) => {
    console.error('FAIL ->', e.message);
    process.exit(1);
  });
