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

	joinPaginated: function (url, limit, max, options) {
		var data = [];
		var promises = [];
		var offset = 0;
		var params;
		options = options || {};
		max = (max > 8000) ? 8000 : max;


		for(offset; offset < max; offset += limit) {
			params = _.extend(options, {
				limit:limit,
				offset:offset
			});

			promises.push(soundcloud.api(url, params));
		}



		function pushData(returnedData) {
			data = data.concat(returnedData);
		};

		return promises.reduce(function (previousValue, currentValue) {
			return currentValue.then(pushData);
		}, q()).then(function () {
			return data;
		})

	},
	
	api: function (path, requestOptions) {

		var defer = q.defer(), 
		options = requestOptions || {}, 
		apiHost = 'api.soundcloud.com',
		url;
		
		url = 'http://' + apiHost + path + '.json';

		pigeon.get(url, _.extend(defaults, requestOptions || {}))
			.then(function (e) {
				var json = JSON.parse(e);
				defer.resolve(json);
			}, function (e) {
				console.log(e.stack);
				soundcloud.api(path, requestOptions)
					.then(function (parsed, raw) {
						defer.resolve(parsed);
					})
			});
		
		return defer.promise;
	}

};


exports.soundcloud = soundcloud;