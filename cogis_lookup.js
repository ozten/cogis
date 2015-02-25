var fs = require('fs');
var http = require('http');

var utils = require('./utils');

'use strict';

var urlPrefix = 'http://cogcc.state.co.us/cogis/SpillReport.asp?doc_num=';
var sampleUrl = urlPrefix + '200392836';

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

function processData(id, body) {
	// TODO reset the state of records
	records = {id: id};
	body = body.toString();

	// TODO records is a global variable and we don't use the following variables
	// directly...

	// GW Impact?</strong>&nbsp;N</FONT>
	var groundWater = parseByKey('GW Impact?', '</FONT>', body);

	records['GW Impact?'] = (records['GW Impact?'] === 'Y');

	// Water spilled:</font></strong>
	// &nbsp;<font face=Arial size=1>&nbsp;30</font></td>
    var waterSpilled = parseByKey('Water spilled:', '</td>', body);

    // Number type and default to 0
    records['Water spilled:'] = parseInt(records['Water spilled:'], 10);
    if (isNaN(records['Water spilled:'])) {
    	records['Water spilled:'] = 0;
    }

    console.log(records);
}


function parseByKey(key, endTag, body) {
	var keyIndex = 0;


	if (! body || ! body.indexOf) {
		return null;
	}

	while (utils.haveKey(key, keyIndex, body)) {
	    var keyIndex = utils.findKey(key, keyIndex, body);

	    var endPos = body.indexOf(endTag, keyIndex + 1);
	    if (keyIndex == -1 || endPos == -1) {
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
		console.log('error:', err);
	});
}
