/**
    This broccoli plugin will find, filter, and concatenate 
    important bower files in the correct order. All files are 
    filtered by the extension {{options.extension}}. The output file
    will be vendor.{{options.extension}}.
    Dependencies: 
        -   [main-bower-files](https://github.com/ck86/main-bower-files)
        -   [broccoli-caching-writer](https://github.com/ember-cli/broccoli-caching-writer)
    Errors:
        Object.getPrototypeOf(BroccoliBowerConcat.prototype).cleanup uses rimraf 
        to clean up after itself. On windows, it can sometimes cause the rebuild to
        throw an error. More Info: https://github.com/isaacs/rimraf/issues/72.
        
        Check out the Readme.md for a hacky fix for sublime.
*/

var mainBowerFiles  =   require('main-bower-files'),
    CachingWriter   =   require('broccoli-caching-writer'),
    path            =   require('path'),
    fs              =   require('fs');

function BroccoliBowerConcat(inputTree, options) {

    var self = this;

    if (! (self instanceof BroccoliBowerConcat)) {
        return new BroccoliBowerConcat(inputTree, options);
    }

    self.inputTree = inputTree;
    self.options = options || {};

    // extension is mandatory
    if (! self.options.extension) {
        throw new Error('No extension specified!');
    }

    // normalize the exclude option to an array
    if (! Array.isArray(self.options.exclude)) {
        if (typeof self.options.exclude === 'string' || self.options.exclude instanceof String) {
            self.options.exclude = [self.options.exclude];
        } 
        else {
            self.options.exclude = [];
        }
    }

    CachingWriter.apply(self, arguments);
    
}

BroccoliBowerConcat.prototype = Object.create(CachingWriter.prototype);
BroccoliBowerConcat.prototype.constructor = BroccoliBowerConcat;

BroccoliBowerConcat.prototype.updateCache = function(src, dest){

    var self = this;

    var vendorFiles = mainBowerFiles().filter(function(file){
        var keep = new RegExp('\\.' + self.options.extension + '$').test(file);

        self.options.exclude.forEach(function(rule){
            if (rule instanceof RegExp){
                keep = keep && ! rule.test(file);
            }
        });

        return keep;
    });

    var fileContent = vendorFiles.map(function(file){
        return fs.readFileSync(file, { encoding: 'utf8' });
    }).join('\n');

    var fileLocation = path.join(dest, 'vendor.'+ self.options.extension);

    fs.writeFileSync(fileLocation, fileContent, {encoding: 'utf8'});
}

module.exports = BroccoliBowerConcat;