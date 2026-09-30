import { assertSandboxEnv } from '../src/safety.js';
import { openDatabase, getStudios } from '../src/db.js';
import { buildAudit } from '../src/domain.js';
import { generateReport } from '../src/reports.js';

assertSandboxEnv();
const db = openDatabase();
const studio = getStudios(db)[0];
const report = generateReport(db, studio, 'audit', buildAudit(studio));
console.log('Generated synthetic report:', report.id);
console.log('Open generated/' + report.id + '.html');
