require('esbuild')
  .build({
    entryPoints: ['dist/index.js'],
    outdir: 'dist',
    bundle: true,
    platform: 'neutral'
  })
  .catch(() => process.exit(1))