const fs      = require('fs-extra');
const rcs     = require('../');
const path    = require('path');
const gutil   = require('gulp-util');
const expect  = require('chai').expect;
const rcsCore = require('rcs-core');

const testFiles = './test/files';
const temp      = testFiles + '/tmp';
const results   = testFiles + '/results';
const fixtures  = testFiles + '/fixtures';

describe('gulp-rcs', () => {
    beforeEach(() => {
        // reset counter and selectors for tests
        rcsCore.selectorLibrary.excludes            = [];
        rcsCore.selectorLibrary.selectors           = {};
        rcsCore.selectorLibrary.compressedSelectors = {};
        rcsCore.nameGenerator.resetCountForTests();
    });

    it('should rename all files', done => {
        const stream = rcs();

        stream.on('data', file => {
            const contents = file.contents.toString();
            const filename = path.basename(file.path);

            expect(contents).to.equal(fs.readFileSync(results + '/' + filename, 'utf8'));
        });

        stream.on('end', done);

        stream.write(new gutil.File({
            cwd: __dirname,
            base: fixtures,
            path: fixtures + '/style.css',
            contents: fs.readFileSync(fixtures + '/style.css')
        }));

        stream.write(new gutil.File({
            cwd: __dirname,
            base: fixtures,
            path: fixtures + '/main.js',
            contents: fs.readFileSync(fixtures + '/main.js')
        }));

        stream.write(new gutil.File({
            cwd: __dirname,
            base: fixtures,
            path: fixtures + '/index.html',
            contents: fs.readFileSync(fixtures + '/index.html')
        }));

        stream.end();
    });

    it('should rename all files with prefixed', done => {
        const stream = rcs({
            prefix: 'prefixed-'
        });

        stream.on('data', file => {
            const contents = file.contents.toString();

            expect(contents).to.equal(fs.readFileSync(results + '/style-prefix.css', 'utf8'));
        });

        stream.on('end', done);

        stream.write(new gutil.File({
            cwd: __dirname,
            base: fixtures,
            path: fixtures + '/style.css',
            contents: fs.readFileSync(fixtures + '/style.css')
        }));

        stream.end();
    });

    it('should exclude a specific file', done => {
        const stream = rcs({
            exclude: '**/ignore.js'
        });

        stream.on('data', file => {
            const contents = file.contents.toString();
            const filename = path.basename(file.path);

            expect(contents).to.equal(fs.readFileSync(results + '/' + filename, 'utf8'));
        });

        stream.on('end', done);

        stream.write(new gutil.File({
            cwd: __dirname,
            base: fixtures,
            path: fixtures + '/style.css',
            contents: fs.readFileSync(fixtures + '/style.css')
        }));

        stream.write(new gutil.File({
            cwd: __dirname,
            base: results,
            path: results + '/ignore.js',
            contents: fs.readFileSync(results + '/ignore.js')
        }));

        stream.write(new gutil.File({
            cwd: __dirname,
            base: fixtures,
            path: fixtures + '/main.js',
            contents: fs.readFileSync(fixtures + '/main.js')
        }));

        stream.write(new gutil.File({
            cwd: __dirname,
            base: fixtures,
            path: fixtures + '/index.html',
            contents: fs.readFileSync(fixtures + '/index.html')
        }));

        stream.end();
    });

    it('should fail, just scss files allowed', done => {
        // just scss files are allowed. Failed because just CSS files are loaded
        const stream = rcs({
            css: '.scss'
        });

        stream.on('data', file => {
            const contents = file.contents.toString();
            const filename = path.basename(file.path);

            expect(contents).to.not.equal(fs.readFileSync(results + '/' + filename, 'utf8'));
        });

        stream.on('end', done);

        stream.write(new gutil.File({
            cwd: __dirname,
            base: fixtures,
            path: fixtures + '/style.css',
            contents: fs.readFileSync(fixtures + '/style.css')
        }));

        stream.write(new gutil.File({
            cwd: __dirname,
            base: fixtures,
            path: fixtures + '/main.js',
            contents: fs.readFileSync(fixtures + '/main.js')
        }));

        stream.end();
    });
});
