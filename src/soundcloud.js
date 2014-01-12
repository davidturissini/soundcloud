var _ = require('underscore'),
getResource = require('curl').curl,
q = require('q');

var soundcloud = {
	
	api: function (path, requestOptions) {

		var deferred = q.defer(), 
		options = requestOptions || {}, 
		apiHost = 'api.soundcloud.com',
		url;
		
		url = 'http://' + apiHost + path + '.json?client_id=99308a0184193d62e064cb770f4c1eae';//?' + querystring.stringify(options);

		return getResource(url).then(JSON.parse);
		
	}

};


exports.soundcloud = soundcloud;