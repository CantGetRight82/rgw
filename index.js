#!/usr/bin/env node
const { spawn } = require('child_process');
const chalk = require('chalk');
const readline = require('readline');
const fs = require('fs');

if(process.argv.length < 4)  {
    console.log('Usage: rgw [search] [replace]');
}
const [from, to] = process.argv.slice(2);

const getFileChanges = (str) => {
    const lines = str.split('\n');
    const files = [];
    let currentFile = null;
    lines.forEach(line => {
        if(line === '') { return; }
        if(line.includes('[35m')) {
            const [,url] = line.match(/\[35m(.+)[\u001b]/);
            currentFile = {
                url,
                replacements: [],
            };
            files.push( currentFile );
        } else {
            const [,nr,preview] = line.match(/\[32m([0-9]+).*?:(.+)/);
            const replacement = preview
                .replace(/[\u001b]\[[0-9]+m/g, '');

            currentFile.replacements.push({
                nr,
                lineIndex: parseInt(nr, 10) -1,
                preview,
                replacement,
            });
        }
    });
    return files;
}

const getKey = () => new Promise(ok => {
    process.stdin.resume();
    process.stdin.once('keypress', (str, key) => {
        if(key.ctrl && key.name === 'c') {
            process.exit();
        }
        process.stdin.pause();
        ok({ str, key });
    });
});

const getMenuKey = async(title, options) => {
    const boldFirst = s => chalk.white.bold(s.charAt(0)) + s.substr(1);
    process.stdout.write( title + ' ' + options.map(boldFirst).join(', ') + ' ' );
    let result = await getKey();
    process.stdout.write('\n');
    return result;
}

const apply = async(url, replacements) => new Promise((ok,fail) => {
    fs.readFile(url, (e,buf) => {
        if(e) return fail(e);
        const lines = buf.toString().split('\n');
        replacements.forEach(({lineIndex, replacement}) => {
            lines[lineIndex] = replacement;
        });
        fs.writeFile(url, lines.join('\n'), (e) => {
            if(e) return fail(e);
            console.log(chalk.green(url + ' written'));
            ok();
        });
    });
});

(async() => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const ps = spawn('rg', ['-p', from, '--replace', to]);
    let out = '';
    ps.stdout.on('data', (buf) => {
        out += buf.toString();
        process.stdout.write(buf);
    });
    await new Promise(ok => { ps.on('close', ok); });

    const files = getFileChanges(out);
    if(files.length === 0) {
        console.log('No matches found.');
        process.exit();
    }

    const { str } = await getMenuKey('Apply changes?', [ 'yes', 'interactive', 'no' ]);
    if(str === 'y') {
        await Promise.all(files.map(f => apply(f.url, f.replacements)));
        console.log('Done.');
    } else if(str === 'i') {
        console.log('Entering interactive mode...');
        for await(let f of files) {
            for await (let replace of f.replacements) {
                console.log(chalk.magenta(f.url));
                console.log(chalk.green(replace.nr)+':' + replace.preview);
                console.log('');
                const { str } = await getMenuKey('Apply?', [ 'yes', 'no', 'quit' ]);
                if(str === 'y') {
                    await apply(f.url, [ replace ]);
                } else if(str === 'q') {
                    process.exit();
                }
            }
        }
        console.log('Done.');
    } else {
        console.log('Canceled.');
    }
})();
