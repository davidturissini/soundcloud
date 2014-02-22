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

	joinPaginated: function (url, limit, max) {
		var data = [];
		var promises = [];
		var offset = 0;
		max = (max > 8000) ? 8000 : max;
		var paramsHistory = [];


		for(offset; offset < max; offset += limit) {
			(function (o) {
				var params = {
					limit:limit,
					offset:o
				};

				var promise = soundcloud.api(url, params);
				paramsHistory.push(params);

				promise = promise.then(function (returnedData) {
					data = data.concat(returnedData);
				});

				promises.push(promise);


			})(offset);
		}

		return q.allSettled(promises)
			.then(function () {
				if(data.length === 0) {
					console.log('url', url, 'params', paramsHistory);
				}
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
			}, function () {
				soundcloud.api(path, requestOptions)
					.then(function (parsed, raw) {
						defer.resolve(parsed);
					})
			});
		
		return defer.promise;
	}

};


exports.soundcloud = soundcloud;