#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 BearGuard Insurance Portal - Setup Verification\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkPass(message) {
  console.log(`✅ ${message}`);
  checks.passed++;
}

function checkFail(message) {
  console.log(`❌ ${message}`);
  checks.failed++;
}

function checkWarn(message) {
  console.log(`⚠️  ${message}`);
  checks.warnings++;
}

console.log('📦 Checking Files...\n');

const requiredFiles = [
  '.env',
  'netlify.toml',
  'package.json',
  'src/lib/supabase.ts',
  'src/contexts/AuthContext.tsx',
  'DEPLOYMENT.md'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    checkPass(`Found ${file}`);
  } else {
    checkFail(`Missing ${file}`);
  }
});

console.log('\n🔐 Checking Environment Variables...\n');

if (fs.existsSync(path.join(__dirname, '.env'))) {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');

  if (envContent.includes('VITE_SUPABASE_URL=') && !envContent.includes('VITE_SUPABASE_URL=your_')) {
    checkPass('VITE_SUPABASE_URL is set');
  } else {
    checkFail('VITE_SUPABASE_URL is not configured');
  }

  if (envContent.includes('VITE_SUPABASE_ANON_KEY=') && !envContent.includes('VITE_SUPABASE_ANON_KEY=your_')) {
    checkPass('VITE_SUPABASE_ANON_KEY is set');
  } else {
    checkFail('VITE_SUPABASE_ANON_KEY is not configured');
  }
} else {
  checkFail('.env file not found');
}

console.log('\n📝 Checking Configuration Files...\n');

if (fs.existsSync(path.join(__dirname, 'netlify.toml'))) {
  const netlifyConfig = fs.readFileSync(path.join(__dirname, 'netlify.toml'), 'utf-8');

  if (netlifyConfig.includes('command = "npm run build"')) {
    checkPass('Netlify build command configured');
  } else {
    checkFail('Netlify build command not configured');
  }

  if (netlifyConfig.includes('publish = "dist"')) {
    checkPass('Netlify publish directory configured');
  } else {
    checkFail('Netlify publish directory not configured');
  }

  if (netlifyConfig.includes('[[redirects]]')) {
    checkPass('Netlify redirects configured for SPA');
  } else {
    checkFail('Netlify redirects not configured');
  }
}

console.log('\n📚 Checking Dependencies...\n');

if (fs.existsSync(path.join(__dirname, 'package.json'))) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

  const requiredDeps = [
    '@supabase/supabase-js',
    'react',
    'react-dom',
    'lucide-react'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      checkPass(`${dep} installed`);
    } else {
      checkFail(`${dep} not installed`);
    }
  });

  if (packageJson.scripts && packageJson.scripts.build) {
    checkPass('Build script configured');
  } else {
    checkFail('Build script not configured');
  }
}

console.log('\n🏗️  Checking Build Output...\n');

if (fs.existsSync(path.join(__dirname, 'dist'))) {
  checkPass('dist/ folder exists');

  if (fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
    checkPass('index.html built successfully');
  } else {
    checkWarn('index.html not found in dist/ - run npm run build');
  }

  const distFiles = fs.readdirSync(path.join(__dirname, 'dist', 'assets'));
  const hasJs = distFiles.some(f => f.endsWith('.js'));
  const hasCss = distFiles.some(f => f.endsWith('.css'));

  if (hasJs) checkPass('JavaScript bundle created');
  if (hasCss) checkPass('CSS bundle created');
} else {
  checkWarn('dist/ folder not found - run npm run build');
}

console.log('\n📊 Summary\n');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);

if (checks.failed === 0 && checks.warnings === 0) {
  console.log('\n🎉 All checks passed! Your app is ready for deployment.\n');
  console.log('Next steps:');
  console.log('1. Push to your Git repository');
  console.log('2. Connect to Netlify');
  console.log('3. Add environment variables to Netlify');
  console.log('4. Deploy!\n');
  console.log('See DEPLOYMENT.md for detailed instructions.\n');
} else if (checks.failed === 0) {
  console.log('\n✅ Configuration looks good!');
  if (checks.warnings > 0) {
    console.log('⚠️  Some optional steps need attention (see warnings above).\n');
  }
} else {
  console.log('\n❌ Please fix the failed checks above before deploying.\n');
  process.exit(1);
}
