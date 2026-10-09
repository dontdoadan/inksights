import { assertSandboxEnv } from '../src/safety.js';
import { openDatabase } from '../src/db.js';
import { runScenario } from '../src/scenarios.js';

assertSandboxEnv();
const name = process.argv[2] || 'happy_path';
const db = openDatabase();
const result = runScenario(db, name);
console.log(JSON.stringify(result, null, 2));
