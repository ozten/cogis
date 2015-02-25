exports.urlToFilename = function(url) {	
	return url.replace(/:\/\//g, '_')
		.replace(/\//g, '_')
		.replace(/\?/g, '_')
		.replace(/=/g, '_')
		.replace(/&/g, '_');
}

exports.haveKey = function(key, keyIndex, body) {
	return body.indexOf(key, keyIndex) !== -1;
};

exports.findKey = function(key, keyIndex, body) {
	return body.indexOf(key, keyIndex);
};

exports.textValue = function(html) {
	// TODO get text values of invalid HTML
	var text = html.replace(/&nbsp;/g, ' ')
	               .replace(/<\/?[^>]*>/g, '')
	               .replace(/\t/g, ' ')
	               .replace(/\n/g, ' ')
	               .replace(/  /g, ' ')
	               .trim();
	return text;
};
