#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

function parseEnvFile(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      let [, key, value] = match;
      value = value.trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
  return env;
}

function printUsageAndExit() {
  console.error('Usage: npx exec-with-env -f <envfile> <command> [args...]');
  process.exit(1);
}

function interpolateArg(arg, env) {
  // Replace $VARNAME or ${VARNAME} with env value
  return arg.replace(/\$(\w+)|\${(\w+)}/g, (match, p1, p2) => {
    const key = p1 || p2;
    return env[key] !== undefined ? env[key] : '';
  });
}

// Parse arguments
const args = process.argv.slice(2);

let envFile = '.env';
let command, commandArgs;
let replaceVars = false;

const envFlagIndex = args.indexOf('-f');
const replaceFlagIndex = args.indexOf('-r');

if (replaceFlagIndex !== -1) {
  // Remove the flag from args
  args.splice(replaceFlagIndex, 1);
  replaceVars = true;
}

const envFlagIndex2 = args.indexOf('-f');
if (envFlagIndex2 !== -1) {
  // -f is present
  envFile = args[envFlagIndex2 + 1];
  command = args[envFlagIndex2 + 2];
  commandArgs = args.slice(envFlagIndex2 + 3);
} else {
  // -f is not present
  command = args[0];
  commandArgs = args.slice(1);
}

if (!envFile || !command) {
  printUsageAndExit();
}

const envFilePath = path.resolve(process.cwd(), envFile);
if (!fs.existsSync(envFilePath)) {
  console.error(`.env file not found: ${envFilePath}`);
  process.exit(1);
}

const fileEnv = parseEnvFile(envFilePath);
const combinedEnv = { ...process.env, ...fileEnv };

if (replaceVars) {
  commandArgs = commandArgs.map(arg => interpolateArg(arg, combinedEnv));
}

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  env: combinedEnv
});

child.on('exit', code => {
  process.exit(code);
});
