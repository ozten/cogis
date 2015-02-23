var fs = require('fs');
var http = require('http');
var urlParse = require('url').parse;

var utils = require('./utils');


var urlPrefix = 'http://cogcc.state.co.us/cogis/SpillReport.asp?doc_num=';
var sampleUrl = urlPrefix + '200392836';

var searchUrl = 'http://cogcc.state.co.us/cogis/IncidentSearch2.asp';
var spillOperator = 'XTO';
var resultsPerPage = 25;
var searchBody = 'itype=spill&ApiCountyCode=&ApiSequenceCode=&Complainant=&Operator=' + 
	spillOperator + '&' +
	'operator_name_number=name&Facility_Lease=&facility_name_number=name&qtrqtr=&sec=&' +
	'twp=&rng=&project_num=&document_num=&maxrec=' + resultsPerPage + '&Button1=Submit';


/* curl 'http://cogcc.state.co.us/cogis/IncidentSearch2.asp'
-H 'Host: cogcc.state.co.us'
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:35.0) Gecko/20100101 Firefox/35.0'
-H 'Accept: text/html,application/xhtml+xml,application/xml'
-H 'Accept-Language: en-US,en;q=0.5'
--compressed
-H 'Referer: http://cogcc.state.co.us/cogis/IncidentSearch.asp'
-H 'Cookie: __utma=193752895.1913657864.1424284399.1424412658.1424647969.4; __utmz=193752895.1424284399.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); ASPSESSIONIDCCAQRBAQ=OBJBNEABGKNAIOKAIHLJNINL; ASPSESSIONIDACBRTBAR=EBOICBKCCDOINPCHHDFFPCPF; ASPSESSIONIDQSRCSDCT=CIDGPANBMADLCJDJIALNEKJB; ASPSESSIONIDCAASRABR=BFKPMMJCJMHAPDEELPBKLDHJ; __utmc=193752895; ASPSESSIONIDQSRCSCCS=FCNIEAABILOIBPMLPHHCOLIH; __utmb=193752895.1.10.1424647969; __utmt=1'
-H 'Connection: keep-alive'
--data 'itype=spill&ApiCountyCode=&ApiSequenceCode=&Complainant=&Operator=XTO&operator_name_number=name&Facility_Lease=&facility_name_number=name&qtrqtr=&sec=&twp=&rng=&project_num=&document_num=&maxrec=25&Button1=Submit'
*/

var records = {

};

// Search
var searchOpts = urlParse(searchUrl);
searchOpts.method = 'POST';
searchOpts.headers = {
	'Content-Type': 'application/x-www-form-urlencoded',
	'Content-Length': searchBody.length,
	'accept': 'text/html,application/xhtml+xml,application/xml',
	'referer': 'http://cogcc.state.co.us/cogis/IncidentSearch.asp',
	'cookie': '__utma=193752895.1913657864.1424284399.1424412658.1424647969.4; __utmz=193752895.1424284399.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); ASPSESSIONIDCCAQRBAQ=OBJBNEABGKNAIOKAIHLJNINL; ASPSESSIONIDACBRTBAR=EBOICBKCCDOINPCHHDFFPCPF; ASPSESSIONIDQSRCSDCT=CIDGPANBMADLCJDJIALNEKJB; ASPSESSIONIDCAASRABR=BFKPMMJCJMHAPDEELPBKLDHJ; __utmc=193752895; ASPSESSIONIDQSRCSCCS=FCNIEAABILOIBPMLPHHCOLIH; __utmb=193752895.1.10.1424647969; __utmt=1',
	'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:35.0) Gecko/20100101 Firefox/35.0'
};
searchOpts.port = 80;
var req = http.request(searchOpts, function(res) {
	var chunks = "";
	console.log('Search Results code:', res.statusCode);
	res.setEncoding('utf8');
	res.on('data', function(chunk) {
		chunks += chunk;
	});
	res.on('end', function() {		
		var ids = [];
		fs.writeFile('search_results.html', chunks, {encoding: 'utf8'}, function(err) {
			if (err) {
				console.log('search results writing error:', err);				
			}
			gatherLinks(chunks, ids);
			
			ids.forEach(function(id) {
				var url = urlPrefix + id;
				getSpillsReport(id, url);
			});
		});
	})
});
req.on('error', function(err) {
	console.log(err);
});
req.write(searchBody);
req.end();

function gatherLinks(body, ids) {
	var index = 0;
	// TODO this only does SpillReport... do we want FacilityDetail and any others?
	var key = '<a href="SpillReport.asp?doc_num=';
	var endTag = '"';

	var keyIndex = 0;


	if (! body || ! body.indexOf) {
		return null;
	}

	while (haveKey(key, keyIndex, body)) {
	    var keyIndex = findKey(key, keyIndex, body);

	    var endPos = body.indexOf(endTag, keyIndex + key.length);
	    if (keyIndex == -1 || endPos == -1) {
	    	continue;
	    }

	    var rawValue = body.substring(keyIndex + key.length, endPos);
	    ids.push(parseInt(rawValue, 10));
	    keyIndex += 1;
	}
}


// Each record

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

function getSpillsReport(id, url) {
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
