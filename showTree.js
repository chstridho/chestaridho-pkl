// showTree.js
// Node.js (CommonJS) — no external deps
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { dir: 'src', maxDepth: 3, ignore: ['node_modules', '.next', 'out', '.git'], out: null, json: false, sizes: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a.startsWith('--dir=')) args.dir = a.split('=')[1];
    else if (a === '--dir') args.dir = argv[++i];
    else if (a.startsWith('--depth=')) args.maxDepth = Number(a.split('=')[1]) || 0;
    else if (a === '--depth') args.maxDepth = Number(argv[++i]) || 0;
    else if (a.startsWith('--ignore=')) args.ignore = a.split('=')[1].split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--ignore') args.ignore = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
    else if (a.startsWith('--out=')) args.out = a.split('=')[1];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--json') args.json = true;
    else if (a === '--sizes') args.sizes = true;
  }
  return args;
}

function humanSize(bytes) {
  if (!Number.isFinite(bytes)) return '?';
  const units = ['B','KB','MB','GB','TB'];
  let i=0;
  while (bytes >= 1024 && i < units.length-1) { bytes /= 1024; i++; }
  return `${Math.round(bytes*10)/10}${units[i]}`;
}

function buildTree(dirPath, opts, level = 0) {
  const name = path.basename(dirPath);
  const node = { name, path: dirPath, type: 'dir', children: [] };

  if (level > opts.maxDepth) return node;

  let items;
  try {
    items = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (e) {
    return node;
  }

  // filter ignore
  items = items.filter(it => !opts.ignore.includes(it.name));

  // sort: directories first, then files, both alphabetically
  items.sort((a,b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  for (const it of items) {
    const full = path.join(dirPath, it.name);
    if (it.isDirectory()) {
      const child = buildTree(full, opts, level + 1);
      node.children.push(child);
    } else {
      let size = null;
      if (opts.sizes) {
        try { size = fs.statSync(full).size; }
        catch(e) { size = null; }
      }
      node.children.push({ name: it.name, path: full, type: 'file', size });
    }
  }

  return node;
}

function printTree(node, opts, prefix = '', isLast = true, outLines = []) {
  const pointer = prefix === '' ? '' : (isLast ? '└── ' : '├── ');
  const lineName = pointer + node.name + (node.type === 'file' && opts.sizes && typeof node.size === 'number' ? ` (${humanSize(node.size)})` : '');
  outLines.push(prefix + lineName);

  if (node.type === 'dir' && node.children && node.children.length > 0 && (getLevel(node.path, opts.rootDir) < opts.maxDepth)) {
    const newPrefix = prefix + (isLast ? '    ' : '│   ');
    node.children.forEach((child, idx) => {
      const last = idx === node.children.length - 1;
      printTree(child, opts, newPrefix, last, outLines);
    });
  }
  return outLines;
}

function getLevel(p, root) {
  const rel = path.relative(root, p);
  if (!rel) return 0;
  return rel.split(path.sep).length;
}

function collectStats(node, stats) {
  if (node.type === 'file') {
    stats.files += 1;
    if (typeof node.size === 'number') stats.bytes += node.size;
  } else if (node.type === 'dir') {
    stats.dirs += 1;
    for (const c of node.children || []) collectStats(c, stats);
  }
}

// --- main
(function main() {
  const raw = parseArgs(process.argv.slice(2));
  if (raw.help) {
    console.log(`Usage:
  node showTree.js [--dir=src] [--depth=3] [--ignore=node_modules,.next,out,.git] [--out=tree.txt] [--json] [--sizes]
Options:
  --dir       starting directory (default: src)
  --depth     max depth to traverse (default: 3)
  --ignore    comma separated folder/file names to ignore
  --out       write textual output to file
  --json      output JSON (to console or --out file if given)
  --sizes     include file sizes (slower)
  --help, -h  show this help
`);
    return;
  }

  const opts = { ...raw };
  opts.rootDir = path.resolve(opts.dir);

  if (!fs.existsSync(opts.rootDir)) {
    console.error(`Error: directory not found -> ${opts.rootDir}`);
    process.exit(1);
  }

  const tree = buildTree(opts.rootDir, opts, 0);

  // textual output (pretty)
  const header = path.basename(opts.rootDir) + '/';
  const lines = [header];
  const printed = printTree(tree, opts, '', true, []);
  // printTree includes the root name once more; avoid duplication
  // We created header separately, so remove the first printed line if matches
  if (printed.length > 0 && printed[0].trim() === tree.name) printed.shift();
  lines.push(...printed);

  // stats
  const stats = { files: 0, dirs: 0, bytes: 0 };
  collectStats(tree, stats);

  let footer = `\n${stats.dirs} directories, ${stats.files} files`;
  if (opts.sizes) footer += `, ${humanSize(stats.bytes)} total`;

  const textOutput = lines.join('\n') + footer + '\n';

  if (opts.json) {
    const jsonOut = JSON.stringify({ root: tree, stats }, null, 2);
    if (opts.out) {
      fs.writeFileSync(opts.out, jsonOut, 'utf8');
      console.log(`JSON written to ${opts.out}`);
    } else {
      console.log(jsonOut);
    }
  } else {
    if (opts.out) {
      fs.writeFileSync(opts.out, textOutput, 'utf8');
      console.log(`Tree written to ${opts.out}`);
    } else {
      console.log(textOutput);
    }
  }
})();
