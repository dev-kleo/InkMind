import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist');
const manifest = resolve(dist, 'manifest.json');
const outZip = resolve(root, 'knowledge-os-extension.zip');

if (!existsSync(manifest)) {
  console.error(
    [
      'Missing dist/manifest.json.',
      'Run `npm run build` first, then pack.',
      '',
      'Chrome cannot load the repo root — only dist/ contains the extension manifest.',
    ].join('\n'),
  );
  process.exit(1);
}

execFileSync('zip', ['-r', '-q', outZip, '.'], { cwd: dist, stdio: 'inherit' });
console.log(`Packed ${outZip}`);
console.log('Load unpacked: select the dist/ folder in chrome://extensions');
console.log('Or unzip knowledge-os-extension.zip and load that folder (it contains manifest.json).');
