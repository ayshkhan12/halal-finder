// Starts the API and the Expo dev server together. Ctrl+C stops both.
const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.join(__dirname, '..');
const procs = [
  { name: 'api', color: '\x1b[32m', args: ['--prefix', 'backend', 'run', 'dev'] },
  { name: 'app', color: '\x1b[33m', args: ['--prefix', 'mobile', 'start'] },
].map(({ name, color, args }) => {
  const child = spawn('npm', args, { cwd: root, stdio: ['inherit', 'pipe', 'pipe'], env: process.env });
  const prefix = `${color}[${name}]\x1b[0m `;
  const pipe = (stream, out) => stream.on('data', (d) => out.write(d.toString().replace(/^(?=.)/gm, prefix)));
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on('exit', (code) => {
    console.log(`${prefix}exited with code ${code}`);
    procs.forEach((p) => p !== child && p.kill());
    process.exit(code ?? 0);
  });
  return child;
});

process.on('SIGINT', () => procs.forEach((p) => p.kill('SIGINT')));
