import test from 'node:test';
import assert from 'node:assert/strict';
import { isServiceRoleAuthorization } from './auth-policy.mjs';

function token(role) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ role })}.signature`;
}

test('allows only service_role JWTs after gateway verification', () => {
  assert.equal(isServiceRoleAuthorization(`Bearer ${token('service_role')}`), true);
  assert.equal(isServiceRoleAuthorization(`Bearer ${token('authenticated')}`), false);
  assert.equal(isServiceRoleAuthorization(`Bearer ${token('anon')}`), false);
});

test('rejects missing and malformed authorization values', () => {
  assert.equal(isServiceRoleAuthorization(null), false);
  assert.equal(isServiceRoleAuthorization(''), false);
  assert.equal(isServiceRoleAuthorization('Basic abc'), false);
  assert.equal(isServiceRoleAuthorization('Bearer not-a-jwt'), false);
});
