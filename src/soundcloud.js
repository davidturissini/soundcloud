var _ = require('underscore');
var pigeon = require('pigeon');
var q = require('q');

var defaults = {
	client_id:''
}

var soundcloud = {

	configure: function (config) {
		defaults = _.extend(defaults, config);
	},
	
	api: function (path, requestOptions) {

		var deferred = q.defer(), 
		options = requestOptions || {}, 
		apiHost = 'api.soundcloud.com',
		url;
		
		url = 'http://' + apiHost + path + '.json';//?' + querystring.stringify(options);

		return pigeon.get(url, _.extend(defaults, requestOptions || {})).then(JSON.parse);
		
	}

};


exports.soundcloud = soundcloud;