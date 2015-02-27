var fs = require('fs');
var http = require('http');
var urlParse = require('url').parse;

var utils = require('./utils');

'use strict';

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

module.exports = function search(spillOperator, resultsPerPage, cb) {
	var searchUrl = 'http://cogcc.state.co.us/cogis/IncidentSearch2.asp';
	var searchBody = 'itype=spill&ApiCountyCode=&ApiSequenceCode=&Complainant=&Operator=' +
		spillOperator + '&' +
		'operator_name_number=name&Facility_Lease=&facility_name_number=name&qtrqtr=&sec=&' +
		'twp=&rng=&project_num=&document_num=&maxrec=' + resultsPerPage + '&Button1=Submit';

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
		//console.log('Search Results code:', res.statusCode);
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

				cb(null, ids);
			});
		})
	});
	req.on('error', function(err) {
		console.log(err);
		cb(err);
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

		while (utils.haveKey(key, keyIndex, body)) {
		    var keyIndex = utils.findKey(key, keyIndex, body);

		    var endPos = body.indexOf(endTag, keyIndex + key.length);
		    if (keyIndex == -1 || endPos == -1) {
		    	continue;
		    }

		    var rawValue = body.substring(keyIndex + key.length, endPos);
		    ids.push(parseInt(rawValue, 10));
		    keyIndex += 1;
		}
	}
};

