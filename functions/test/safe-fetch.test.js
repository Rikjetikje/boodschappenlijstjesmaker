'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isPrivateIp } = require('../lib/safe-fetch');

test('blokkeert lokale en private IP-adressen', () => {
  assert.equal(isPrivateIp('127.0.0.1'), true);
  assert.equal(isPrivateIp('10.1.2.3'), true);
  assert.equal(isPrivateIp('192.168.1.10'), true);
  assert.equal(isPrivateIp('169.254.169.254'), true);
  assert.equal(isPrivateIp('::1'), true);
  assert.equal(isPrivateIp('fd00::1'), true);
});

test('staat openbare IP-adressen toe', () => {
  assert.equal(isPrivateIp('8.8.8.8'), false);
  assert.equal(isPrivateIp('2606:4700:4700::1111'), false);
});
