const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('dist')) return;

    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
        const files = fs.readdirSync(filePath);
        files.forEach(file => replaceInFile(path.join(filePath, file)));
    } else if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('')) {
            console.log(`Updating: ${filePath}`);
            const newContent = content.replace(/http:\/\/localhost:3000/g, '');
            fs.writeFileSync(filePath, newContent, 'utf8');
        }
    }
}

replaceInFile('.');
