export default [
  {
    input: 'src/background.js',
    output: { file: 'dist/background.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/*.js' }
  },
  {
    input: 'src/content.js',
    output: { file: 'dist/content.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/*.js' }
  },
  {
    input: 'src/newtab.js',
    output: { file: 'dist/newtab.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/*.js' }
  },
  {
    input: 'src/popup.js',
    output: { file: 'dist/popup.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/*.js' }
  }
]
