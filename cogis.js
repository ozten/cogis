var fs = require('fs');
var http = require('http');


var DEBUG = true;
var url = 'http://cogcc.state.co.us/cogis/SpillReport.asp?doc_num=200392836';

var records = {

};

function afterWeGetTheDataFn(res) {

    console.log(res.statusCode);
    if (res.statusCode >= 200 && res.statusCode < 300) {
    	res.on('err', function(err) {
    		console.error(err);
    	});
        res.on('data', processData);
    }    
}

function processData(body) {
	body = body.toString();
	// GW Impact?</strong>&nbsp;N</FONT>
	var groundWater = parseByKey('GW Impact?', '</FONT>', body);

	// Water spilled:</font></strong>
	// &nbsp;<font face=Arial size=1>&nbsp;30</font></td>
    var waterSpilled = parseByKey('Water spilled:', '</td>', body);    
}

function parseByKey(key, endTag, body) {
	var keyIndex = 0;

	
	if (! body || ! body.indexOf) {
		return null;
	}

	while (haveKey(key, keyIndex, body)) {		
	    var keyIndex = findKey(key, keyIndex, body);

	    var endPos = body.indexOf(endTag, keyIndex + 1);
	    if (keyIndex == -1 || endPos == -1) {
	    	continue;
	    }

	    var rawValue = body.substring(keyIndex + key.length, endPos);	    
	    rawValue = rawValue.replace(/&nbsp;/g, ' ');
	    
	    records[key] = textValue(rawValue);

	    console.log(rawValue);

	    keyIndex += 1;
	}
}

function haveKey(key, keyIndex, body) {	
	return body.indexOf(key, keyIndex) !== -1;
}

function findKey(key, keyIndex, body) {
	return body.indexOf(key, keyIndex);
}

function textValue(html) {
	// TODO get text values of invalid HTML
	return html;
}

if (DEBUG) {

	var filepath = '200392836.html';
	if (process.argv.length > 2) {
		filepath = process.argv[2];
	}
	fs.readFile(filepath, {encoding: 'utf8'}, function(err, data) {		
		if (err) {
			console.error(err);
		} else {
			processData(data);
		}
	});
} else {
	http.get(url, afterWeGetTheDataFn);
}
