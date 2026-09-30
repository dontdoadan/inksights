import { assertSandboxEnv } from '../src/safety.js';
import { openDatabase, resetDatabase } from '../src/db.js';

assertSandboxEnv();
const db = openDatabase();
resetDatabase(db);
console.log('INKSIGHTS Sandbox reset to synthetic seed state.');
