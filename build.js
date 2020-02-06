const fs = require('fs');
const babel = require('@babel/core');

const code = fs.readFileSync('./src/index.js').toString();

deleteFolderRecursive('./dist');

fs.mkdirSync('./dist', { recursive: true })

var minified = babel.transform(code, {
    presets: ['@babel/preset-env'],
    sourceType: 'script'
}).code;

fs.writeFileSync('./dist/penfield-listners.js', minified, 'utf8');

var minified = babel.transform(code, {
    presets: [
        '@babel/preset-env', 
        ['minify', {
            "mangle": {
                "keepFnName": false
            },
        }]
    ],
    sourceType: 'script',
    comments: false
}).code;

fs.writeFileSync('./dist/penfield-listners.min.js', minified, 'utf8');

function deleteFolderRecursive (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file, index) => {
            var curPath = path + '/' + file;

            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else { fs.unlinkSync(curPath); }
        });

        fs.rmdirSync(path);
    }
};