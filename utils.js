exports.urlToFilename = function(url) {	
	return url.replace(/:\/\//g, '_')
		.replace(/\//g, '_')
		.replace(/\?/g, '_')
		.replace(/=/g, '_')
		.replace(/&/g, '_');
}
