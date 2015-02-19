var fs = require('fs');
var http = require('http');

var utils = require('./utils');


var DEBUG = false;
var url = 'http://cogcc.state.co.us/cogis/SpillReport.asp?doc_num=200392836';
url = 'http://cogcc.state.co.us/cogis/SpillReport.asp?doc_num=2146233';

var searchUrl = 'http://cogcc.state.co.us/cogis/IncidentSearch2.asp';
var searchBody = 'itype=spill&ApiCountyCode=&ApiSequenceCode=&Complainant=&Operator=XTO&' +
	'operator_name_number=name&Facility_Lease=&facility_name_number=name&qtrqtr=&sec=&' +
	'twp=&rng=&project_num=&document_num=&maxrec=25&Button1=Submit';

var records = {

};
// Search

// Each record

function afterWeGetTheDataFn(res) {    
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
        	console.log(chunks);        	
        	writeData(url, chunks);
        	processData(chunks);
        });
    }    
}

function processData(body) {
	body = body.toString();
	// GW Impact?</strong>&nbsp;N</FONT>
	var groundWater = parseByKey('GW Impact?', '</FONT>', body);

	// Water spilled:</font></strong>
	// &nbsp;<font face=Arial size=1>&nbsp;30</font></td>
    var waterSpilled = parseByKey('Water spilled:', '</td>', body);

    console.log(records);    
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
	    
	    records[key] = textValue(rawValue);	    

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
	var text = html.replace(/&nbsp;/g, ' ')
	               .replace(/<\/?[^>]*>/g, '')
	               .replace(/\t/g, ' ')
	               .replace(/\n/g, ' ')
	               .replace(/  /g, ' ')
	               .trim();	               
	return text;
}

function writeData(url, data) {
	var filepath = utils.urlToFilename(url);
	fs.writeFile(filepath, data, {encoding: 'utf8'}, function(err) {
		console.log('error:', err);
	});
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
	var filepath = utils.urlToFilename(url);
	if (fs.existsSync(filepath)) {
		console.log('Cache hit!');
	} else {
		console.log('Cache miss');
		http.get(url, afterWeGetTheDataFn);
	}
	console.log('Retreiving', url);
	//
}
