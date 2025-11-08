const http = require('http');

http.get('http://localhost:8888/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('=== PAGE LOADED ===');
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Content Length:', data.length);
    
    // Check for obvious issues
    if (data.includes('<!DOCTYPE html>')) console.log('✅ DOCTYPE found');
    if (data.includes('<body')) console.log('✅ Body tag found');
    if (data.includes('</body>')) console.log('✅ Closing body tag found');
    if (data.includes('</html>')) console.log('✅ Closing html tag found');
    
    // Check for problematic content
    if (data.length < 1000) console.log('⚠️ WARNING: Page is very short (< 1KB)');
    if (!data.includes('CupidBot')) console.log('⚠️ WARNING: No "CupidBot" text found');
    
    console.log('\n=== First 500 chars ===');
    console.log(data.substring(0, 500));
  });
}).on('error', (err) => {
  console.error('ERROR:', err.message);
});
