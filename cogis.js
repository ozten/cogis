var fs = require('fs');
var http = require('http');


var DEBUG = true;
var url = 'http://cogcc.state.co.us/cogis/SpillReport.asp?doc_num=200392836';

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
    var waterSpilled = parseByKey('Water spilled:');

}

function haveTr(body, index) {
    return findTr(body, index) !== -1;
}

function findTr(body, index) {
	if (! body || ! body.indexOf) {
		return -1;
	}
    return body.indexOf('<tr>', index);
}

if (DEBUG) {

	var filepath = '200392836.html';
	if (process.argv.length > 2) {
		filepath = process.argv[2];
	}
	fs.readFile(filepath, {encoding: 'utf8'}, function(err, data) {
		console.log(data, 'err=', err, process.argv);
		if (err) {
			console.error(err);
		} else {
			processData(data);
		}
	});
} else {
	http.get(url, afterWeGetTheDataFn);
}
