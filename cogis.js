var search = require('./cogis_search');
var lookup = require('./cogis_lookup');

var spillOperator = 'XTO';
var resultsPerPage = 25;

search(spillOperator, resultsPerPage, function(err, ids) {
	ids.forEach(function(id) {		
		lookup(id);
	});
});
