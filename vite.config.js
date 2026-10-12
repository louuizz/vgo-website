import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Every generated page (index.html in any folder) is a build entry.
const root = import.meta.dirname;
const skip = new Set(['node_modules', 'dist', 'public', 'src', 'scripts', '.git', '.claude']);
const input = {};
(function scan(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) scan(full);
    else if (name === 'index.html') input[relative(root, full).replace(/[\\/]/g, '_') || 'main'] = full;
  }
})(root);

export default defineConfig({ build: { rollupOptions: { input } } });
