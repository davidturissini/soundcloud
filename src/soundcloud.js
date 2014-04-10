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

	joinPaginatedPromises: function (url, limit, max, options) {
		var promises = [];
		var offset = 0;
		var params;
		var limitRemainder;
		var limits = [];
		options = options || {};
		max = (max > 8000) ? 8000 : max;
		

		for(offset; offset < max; offset += limit) {
			limitRemainder = limit;

			if (max - offset < limit) {
				limitRemainder = max - offset;
			}

			limits.push({
				limit:(max - offset < limit) ? max - offset : limit,
				offset:offset
			});
			
		}

		limits.forEach(function (limit, index) {
			var params = _.extend(_.clone(options), limit);
			promises.push(function () {
				return soundcloud.api(url, params);
			});
		});
		

		return promises;
	},

	joinPaginated: function () {
		var paginatedPromises = this.joinPaginatedPromises.apply(this, arguments);
		var promises = [];
		var data = [];
		

		function pushData(returnedData) {
			data = data.concat(returnedData);
		};

		promises = paginatedPromises.map(function (promise) {
			return promise().then(pushData);
		});

		return q.all(promises).then(function () {
			return data;
		})

		.fail(function (e) {
			console.log(e.stack);
		});

	},
	
	api: function (path, requestOptions) {

		var defer = q.defer(), 
		options = requestOptions || {}, 
		apiHost = 'api.soundcloud.com',
		url;
		
		url = 'http://' + apiHost + path + '.json';

		pigeon.get(url, _.extend(_.clone(defaults), options))
			.then(function (e) {
				if (options.parse === false) {
					defer.resolve(e);
					return;
				}
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