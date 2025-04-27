import { test } from 'node:test';
import assert from 'assert';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = path.resolve(__dirname, '../index.js');
const TMP_ENV = path.resolve(__dirname, 'test.env');

test('runs a command with env vars from file', () => {
  fs.writeFileSync(TMP_ENV, 'FOO=bar\nHELLO=world');
  const result = spawnSync('node', [CLI_PATH, '-f', TMP_ENV, 'node', '-e', 'console.log(process.env.FOO, process.env.HELLO)'], {
    encoding: 'utf8',
  });
  fs.unlinkSync(TMP_ENV);
  assert.strictEqual(result.status, 0);
  assert(result.stdout.includes('bar world'));
});

test('errors if env file is missing', () => {
  const missingEnv = path.resolve(__dirname, 'doesnotexist.env');
  const result = spawnSync('node', [CLI_PATH, '-f', missingEnv, 'node', '-e', 'console.log(1)'], {
    encoding: 'utf8',
  });
  assert.notStrictEqual(result.status, 0);
  assert(result.stderr.includes('.env file not found'));
});

test('errors if command is missing', () => {
  fs.writeFileSync(TMP_ENV, 'FOO=bar');
  const result = spawnSync('node', [CLI_PATH, '-f', TMP_ENV], {
    encoding: 'utf8',
  });
  fs.unlinkSync(TMP_ENV);
  assert.notStrictEqual(result.status, 0);
  assert(result.stderr.includes('Usage: npx exec-with-env'));
});

test('merges process.env and file env, file env takes precedence', () => {
  fs.writeFileSync(TMP_ENV, 'FOO=fromfile');
  const result = spawnSync('node', [CLI_PATH, '-f', TMP_ENV, 'node', '-e', 'console.log(process.env.FOO)'], {
    encoding: 'utf8',
    env: { ...process.env, FOO: 'fromprocess' },
  });
  fs.unlinkSync(TMP_ENV);
  assert.strictEqual(result.status, 0);
  assert(result.stdout.includes('fromfile'));
});

test('replaces $VARNAME and ${VARNAME} in args with env value when -r is used', () => {
  fs.writeFileSync(TMP_ENV, 'FOO=bar\nHELLO=world');
  const result = spawnSync('node', [CLI_PATH, '-f', TMP_ENV, '-r', 'echo', '$FOO', '${HELLO}'], {
    encoding: 'utf8',
  });
  fs.unlinkSync(TMP_ENV);
  assert.strictEqual(result.status, 0);
  // The output may have a newline, so check includes
  assert(result.stdout.includes('bar world') || result.stdout.includes('bar\nworld'));
});
