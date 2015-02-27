#!/usr/bin/env node
var search = require('./cogis_search');
var lookup = require('./cogis_lookup');

'use strict';

// defaults
var resultsPerPage = 25;
var spillOperator = 'XTO';

function usage() {
    process.stdout.write('cogis.js [resultsPerPage] [spillOperator]\n\n' +
        '\tresultsPerPage - defaults to ' + resultsPerPage + '\n' +
        '\tspillOperator - defaults to ' + spillOperator);
}

if (process.argv.length > 2) {
    resultsPerPage = parseInt(process.argv[2], 10);
    if (isNaN(resultsPerPage)) {
        usage();
        process.exit(1);
    }
}

if (process.argv.length > 3) {
    spillOperator = process.argv[3];
}

if (resultsPerPage === 1) {
    // Offline development mode for hacking on a search result
    lookup('200392836');
} else {
    search(spillOperator, resultsPerPage, function(err, ids) {
        ids.forEach(function(id) {
            lookup(id);
        });
    });

}
