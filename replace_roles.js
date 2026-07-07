const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'build' || file === 'dist' || file.includes('database.sqlite') || file.includes('.log')) continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (
      fullPath.endsWith('.js') || 
      fullPath.endsWith('.jsx') || 
      fullPath.endsWith('.json') || 
      fullPath.endsWith('.md') ||
      fullPath.endsWith('.sql')
    ) {
      // Avoid replacing inside our own script
      if (fullPath.includes('replace_roles.js')) continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      // Case-sensitive exact replacements for the system enum values
      content = content.replace(/payment_manager/g, 'accountant');
      content = content.replace(/field_inspector/g, 'verifier');
      
      // UI Label replacements
      content = content.replace(/Payment Manager/g, 'Accountant');
      content = content.replace(/Field Inspector/g, 'Verifier');
      
      // Optional lower case check (e.g. "payment manager" -> "accountant")
      content = content.replace(/payment manager/g, 'accountant');
      content = content.replace(/field inspector/g, 'verifier');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

replaceInDir(path.resolve(__dirname));
