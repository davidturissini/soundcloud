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
		var offsets = [];
		max = (max > 8000) ? 8000 : max;

		while(offset <= max && max !== 0) {
			(function (o) {

				var promise = soundcloud.api(url, {
					limit:limit,
					offset:o
				})

				.then(function (returnedData) {
					data = data.concat(returnedData);
				})

				promises.push(promise);
			}(offset));
			
			if (offset < max && limit + offset > max && max === 8000) {
				offset = max;
			} else {
				offset += limit;
			}

		}

		return q.allSettled(promises)
			.then(function () {
				return data;
			})
	},
	
	api: function (path, requestOptions) {

		var deferred = q.defer(), 
		options = requestOptions || {}, 
		apiHost = 'api.soundcloud.com',
		url;
		
		url = 'http://' + apiHost + path + '.json';

		return pigeon.get(url, _.extend(defaults, requestOptions || {})).then(JSON.parse);
		
	}

};


exports.soundcloud = soundcloud;