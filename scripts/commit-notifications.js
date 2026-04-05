#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const projectDir = '/vercel/share/v0-project';

try {
  console.log('📦 Adding changes...');
  execSync('git add .', { cwd: projectDir, stdio: 'inherit' });
  
  console.log('📝 Committing changes...');
  execSync('git commit -m "feat: Add push notifications infrastructure with VAPID keys setup"', { 
    cwd: projectDir, 
    stdio: 'inherit' 
  });
  
  console.log('🚀 Pushing to GitHub...');
  execSync('git push origin HEAD', { cwd: projectDir, stdio: 'inherit' });
  
  console.log('✅ Success! Changes are now deployed to Vercel');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
