const fs = require('fs');
const path = require('path');

const directoryPath = './';

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Could not read directory:', err);
    return;
  }

  files.forEach(file => {
    if (path.extname(file) === '.html') {
      const filePath = path.join(directoryPath, file);
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Could not read file:', err);
          return;
        }
        
        // Replace both '../panphora-js/' and '../panphora-css/' with production URLs
        let updatedData = data.replace(/\.\.\/panphora-js\//g, 'https://js.panphora.com/');
        updatedData = updatedData.replace(/\.\.\/panphora-css\//g, 'https://css.panphora.com/');
        
        fs.writeFile(filePath, updatedData, 'utf8', err => {
          if (err) {
            console.error('Could not write to file:', err);
          } else {
            console.log('✅ build.js:', filePath);
          }
        });
      });
    }
  });
});
