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
		var defer = q.defer();
		var data = [];
		var promises = [];
		var offset = 0;
		max = (max > 8000) ? 8000 : max;


		for(offset; offset < max; offset += limit) {
			(function (o) {
				var params = {
					limit:limit,
					offset:o
				};

				var promise = soundcloud.api(url, params);

				promise = promise.then(function (returnedData) {
					defer.notify(returnedData);
					data = data.concat(returnedData);
				});

				promises.push(promise);


			})(offset);
		}

		q.all(promises)
			.then(function () {
				defer.resolve(data);
			});

		return defer.promise;
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