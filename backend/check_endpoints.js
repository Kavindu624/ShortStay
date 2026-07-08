const fs = require('fs');
const path = require('path');

const frontendDir = path.resolve(__dirname, '../frontend/src');
const backendDir = path.resolve(__dirname, 'routes');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(filePath);
    }
  });
  return results;
}

// 1. Extract frontend API calls
const frontendFiles = getFiles(frontendDir);
const frontendApis = new Set();
const apiRegex = /api\.(get|post|put|patch|delete)\(\s*['"`](.*?)['"`]/g;

frontendFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = apiRegex.exec(content)) !== null) {
    let method = match[1].toUpperCase();
    let url = match[2];
    
    // Normalize frontend URL: remove template literals like ${id}
    url = url.replace(/\$\{[^}]+\}/g, ':param');
    // Remove query params
    url = url.split('?')[0];
    
    frontendApis.add(`${method} ${url}`);
  }
});

// 2. Extract backend routes
const backendFiles = getFiles(backendDir);
const backendRoutes = new Set();
const routerRegex = /router\.(get|post|put|patch|delete)\(\s*['"`](.*?)['"`]/g;

backendFiles.forEach(file => {
  const routePrefix = file.includes('auth.routes') ? '/auth' :
                      file.includes('admin.routes') ? '/admin' :
                      file.includes('payment.routes') ? '/payments' :
                      file.includes('payout.routes') ? '/payouts' :
                      file.includes('profile.routes') ? '/profile' :
                      file.includes('property.routes') ? '/properties' :
                      file.includes('review.routes') ? '/reviews' :
                      file.includes('settings.routes') ? '/settings' :
                      file.includes('stats.routes') ? '/stats' :
                      file.includes('availability.routes') ? '/availability' :
                      file.includes('booking.routes') ? '/bookings' :
                      file.includes('complaint.routes') ? '/complaints' :
                      file.includes('dashboard.routes') ? '/dashboard' :
                      file.includes('inspector.routes') ? '/inspector' :
                      file.includes('notification.routes') ? '/notifications' : '';
                      
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = routerRegex.exec(content)) !== null) {
    let method = match[1].toUpperCase();
    let url = match[2];
    
    // Normalize backend URL: remove :param
    url = url.replace(/:[^\/]+/g, ':param');
    
    // Ensure leading slash
    if (url === '/') url = '';
    
    backendRoutes.add(`${method} ${routePrefix}${url}`);
  }
});

// 3. Compare
console.log('--- Missing Endpoints ---');
let missingCount = 0;
frontendApis.forEach(api => {
  // Try to find a match. This is a simple exact string match on normalized URLs.
  if (!backendRoutes.has(api)) {
    console.log(`Frontend calls: ${api}, but Backend does not seem to define it.`);
    missingCount++;
  }
});

if (missingCount === 0) console.log('All frontend API calls matched to backend routes (based on static analysis)!');

