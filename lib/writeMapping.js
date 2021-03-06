'use strict';

const gutil = require('gulp-util');
const through = require('through2');
const merge = require('lodash.merge');
const rcs = require('rcs-core');
const path = require('path');

const writeMapping = (destPath, options) => {
    const mappings = [];
    const optionsDefault = {
        json: true,
        cssMapping: true,
        cssMappingMin: false
    };

    let fileExt = '.json';
    let mappingName = 'renaming_map';

    options = options || {};
    options = merge(optionsDefault, options);

    if (!options.json) {
        fileExt = '.js';
    }

    if (typeof destPath !== 'string') {
        destPath = '';
    }
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            return;
        }

        if (file.isStream()) {
            return this.emit('error', new gutil.PluginError('gulp-rcs', 'Streaming not supported'));
        }

        this.push(file);
        if (options.cssMapping) {
            if (typeof options.cssMapping === 'string') {
                mappingName = options.cssMapping;
            }

            mappings.push(new gutil.File({
                cwd: process.cwd(),
                base: destPath,
                path: path.join(destPath, mappingName + fileExt),
                contents: new Buffer((
                    JSON.stringify(rcs.selectorLibrary.getAll({
                        isSelectors: true,
                        addSelectorType: true,
                    }), null, '\t')
                ))
            }));
        }

        if (options.cssMappingMin) {
            mappingName = 'renaming_map_min';

            if (typeof options.cssMappingMin === 'string') {
                mappingName = options.cssMappingMin;
            }

            mappings.push(new gutil.File({
                cwd: process.cwd(),
                base: destPath,
                path: path.join(destPath, mappingName + fileExt),
                contents: new Buffer((
                    JSON.stringify(rcs.selectorLibrary.getAll({
                        getRenamedValues: true,
                        addSelectorType: true,
                    }), null, '\t')
                ))
            }));
        }


        cb();
    }, function () {
        try {
            for (let mapping of mappings) {
                this.emit('data', mapping);
            }
        } catch (e) {
            return this.emit('error', new gutil.PluginError('gulp-add', e.message));
        }

        this.emit('end');
    });
};

module.exports = writeMapping;
