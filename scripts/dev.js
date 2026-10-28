import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '  Starting LearnSphere Development Servers (Backend & Frontend)');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[32m%s\x1b[0m', '  Backend API:     http://localhost:5001');
console.log('\x1b[34m%s\x1b[0m', '  Frontend Web UI: http://localhost:3000');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════\n');

// Detect package manager (npm or pnpm)
const isPnpm = process.env.npm_config_user_agent?.includes('pnpm') || false;
const pkgCmd = isPnpm ? 'pnpm' : 'npm';

function startService(name, cwd, color, cmd = pkgCmd, args = ['run', 'dev']) {
  const proc = spawn(cmd, args, {
    cwd: path.join(rootDir, cwd),
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  const prefix = `${color}[${name}]\x1b[0m `;

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim().length > 0) {
        process.stdout.write(`${prefix}${line}\n`);
      }
    }
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim().length > 0) {
        process.stderr.write(`${prefix}\x1b[31m${line}\x1b[0m\n`);
      }
    }
  });

  proc.on('close', (code) => {
    console.log(`${prefix}exited with code ${code}`);
  });

  return proc;
}

const backend = startService('Backend', 'backend', '\x1b[32m');
const frontend = startService('Frontend', 'frontend', '\x1b[34m');

function cleanup() {
  console.log('\n\x1b[33mStopping all LearnSphere services...\x1b[0m');
  try {
    backend.kill('SIGTERM');
  } catch {}
  try {
    frontend.kill('SIGTERM');
  } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
