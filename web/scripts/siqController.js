var app = angular.module('siqApp', []);
app.controller('siqController', function($scope, $http){
	
	var siq = this;
	
	$http.get('http://bsedgwick.com:8080/api/v2/entries.json')
		.then(function(response){
			siq.data = response.data;
		});
	
	siq.panelNum = -1;
	
	siq.getEntry = function(index){
		siq.panelNum = index;
		var id = siq.data[index]._id;
		console.log('getting entry ' + id);

		$http.get('http://bsedgwick.com:8080/api/v2/entries/' + id + '.json')
			.then(function(response){
				siq.data[index] = response.data;
			});
	}

	siq.updateEntry = function(index, subject, contents){
		var id = siq.data[index]._id;
		var entry = {};
		entry.subject = subject;
		entry.contents = contents;
		$http.put('http://bsedgwick.com:8080/api/v2/entries/' + id + '.json', entry)
			.then(function(response){
				console.log("update finished with status '" + response.data + "'");
			});
	}

	siq.deleteEntry = function(index){
		console.log('deleting ' + index + '...');
		var id = siq.data[index]._id;
		siq.data.splice(index, 1);
		siq.panelNum = -1;
		$http.delete('http://bsedgwick.com:8080/api/v2/entries/' + id)
			.then(function(response){
				console.log("delete finished with status '" + response.data + "'");
			});
	};

	siq.postEntry = function(subject, contents){
		// {"subject":"Something else","contents":"This is the contents for 'Something else'"}
		var entry = {};
		entry.subject = subject;
		entry.contents = contents;
		console.log(entry);
		$http.post('http://bsedgwick.com:8080/api/v2/entries.json', entry)
			.then(function(res){
				console.log(`success:${res.data}`);
				entry._id = res.data;
				siq.data.push(entry);
			}, function(err){
				console.log(`error: ${err.data}`);
			});
	};
});