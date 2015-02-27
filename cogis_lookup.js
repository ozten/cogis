var fs = require('fs');
var http = require('http');

var utils = require('./utils');

'use strict';

var urlPrefix = 'http://cogcc.state.co.us/cogis/SpillReport.asp?doc_num=';
var sampleUrl = urlPrefix + '200392836';

// TODO use callbacks to extract printing reports
var printedCSVHeader = false;

module.exports = function getSpillsReport(id) {
    var url = urlPrefix + id;
    var filepath = utils.urlToFilename(url);
    if (fs.existsSync(filepath)) {
        // Cache Hit, we already have it on disk
        fs.readFile(filepath, {encoding: 'utf8'}, function(err, data) {
               if (err) {
                       console.error(err);
               } else {
                       processData(id, data);
               }
       });
    } else {
        // Cache miss, get it and then write it to disk
        http.get(url, afterWeGetTheDataFn(id, url));
    }
}

function processData(id, body) {
    // TODO reset the state of records
    records = {id: id};
    body = body.toString();

    // TODO records is a global variable and we don't use the following variables
    // directly...

    //Date of Incident:</font></strong></td>
    // <td width=250><font face=Arial size=2>12/10/2013</font></td>
    parseByKey('Date of Incident:', '</font></td>', body);

    parseByKey('Oil spilled:', '</font></td>', body);

    // GW Impact?</strong>&nbsp;N</FONT>
    parseByKey('GW Impact?', '</FONT>', body);

    records['GW Impact?'] = (records['GW Impact?'] === 'Y');

    // Water spilled:</font></strong>
    // &nbsp;<font face=Arial size=1>&nbsp;30</font></td>
    parseByKey('Water spilled:', '</td>', body);

    parseByKey('Other spilled:', '</font></td>', body);

    // Number type and default to 0
    records['Water spilled:'] = parseInt(records['Water spilled:'], 10);
    if (isNaN(records['Water spilled:'])) {
        records['Water spilled:'] = 0;
    }

    parseByKey('Surface water impact?', '</FONT></td>', body);
    records['Surface water impact?'] = (records['Surface water impact?'] === 'Y');


    parseByKey('Cause of spill:', '</font></td></tr>', body);

    var csv = [];
    var keys = Object.keys(records);
    keys.forEach(function(key, i) {
        csv.push(records[key]);
    });
    if (printedCSVHeader === false) {
        console.log('#', keys.join(', '));
        printedCSVHeader = true;
    }
    console.log(csv.join(', '));
}

function afterWeGetTheDataFn(id, url) {
    return function(res) {
    var chunks = "";
    console.log(res.statusCode);
    if (res.statusCode >= 200 && res.statusCode < 300) {
        res.on('err', function(err) {
            console.error(err);
        });
        res.on('data', function(chunk) {

            chunks += chunk;
        });
        res.on('end', function() {
            writeData(url, chunks);
            processData(id, chunks);
        });
    }
    };
}

function parseByKey(key, endTag, body) {
    var keyIndex = 0;


    if (! body || ! body.indexOf) {
        console.error('no body text, bailing');
        return null;
    }

    if (utils.haveKey(key, keyIndex, body) === false) {
        console.error(key, ' NOT FOUND');
    }
    while (utils.haveKey(key, keyIndex, body)) {
        var keyIndex = utils.findKey(key, keyIndex, body);

        var endPos = body.indexOf(endTag, keyIndex + 1);
        if (keyIndex == -1 || endPos == -1) {
            console.error('No', endTag, 'found after', key, 'at', keyIndex);
            continue;
        }

        var rawValue = body.substring(keyIndex + key.length, endPos);

        records[key] = utils.textValue(rawValue);

        keyIndex += 1;
    }
}

function writeData(url, data) {
    var filepath = utils.urlToFilename(url);
    fs.writeFile(filepath, data, {encoding: 'utf8'}, function(err) {
        console.error('error:', err);
    });
}
