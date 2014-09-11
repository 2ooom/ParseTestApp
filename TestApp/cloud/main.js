
	Parse.Cloud.define("getAllFavoriteItems", function(request, response) {

		var TestItem = Parse.Object.extend("TestItem");
		var UserFavorites = Parse.Object.extend("UserFavorites");	
		var testItemsQuery = new Parse.Query(TestItem);
		var userFavoritesQuery = new Parse.Query(UserFavorites);

		testItemsQuery.equalTo('school', request.params.school);

		userFavoritesQuery.include('testItem'); 
		userFavoritesQuery.include('user'); 
		userFavoritesQuery.matchesQuery('testItem', testItemsQuery); //This will run this second query against the TestItems
		userFavoritesQuery.find().then(function(results) {
			var alerts = {};
			for(var i =0 ; i<results.length; i++ ){
				var user = results[i].get('user');
				var testItem = results[i].get('testItem');
				if(user && testItem){
					var instId = user.get('installationId');
					if(!alerts[instId]) {
						alerts[instId] = [];
					}
					var m = results[i].get('item') + " is being served at {{diningLocation}} for " + testItem.get('meal');
				  alerts[instId].push(m);
				}
			}
			response.success(alerts);
		}, function(error) {
			response.error();
		});
	});