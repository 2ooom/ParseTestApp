
	Parse.Cloud.define("getAllFavoriteItems", function(request, response) {

		var TestItem = Parse.Object.extend("TestItem");
		var UserFavorites = Parse.Object.extend("UserFavorites");	
		var testItemsQuery = new Parse.Query(TestItem);
		var userFavoritesQuery = new Parse.Query(UserFavorites);

		testItemsQuery.equalTo('school', request.params.school);

		function SendPush(installationId, msg) {
			
			var query = new Parse.Query(Parse.Installation);
			query.equalTo('objectId', installationId);

			Parse.Push.send({
			  where: query,
			  data: {alert: msg}
			});
		} 

		userFavoritesQuery.include('testItem'); 
		userFavoritesQuery.include('user'); 
		userFavoritesQuery.matchesQuery('testItem', testItemsQuery); //This will run this second query against the TestItems
		userFavoritesQuery.find().then(function(results) {
			var groupedAlerts = {};
			// manually iterating though results to get alert strings ang group by user in groupedAlerts[installationId]
			for(var i =0 ; i<results.length; i++ ){
				var user = results[i].get('user');
				var testItem = results[i].get('testItem');
				if(user && testItem){
					var instId = user.get('installationId');
					if(!groupedAlerts[instId]) {
						groupedAlerts[instId] = [];
					}
					var m = results[i].get('item') + " is being served at {{dining Location}} for " + testItem.get('meal');
				  groupedAlerts[instId].push(m);
				}
			}
			// reformat to array and send push notifications
			var alerts = [];
			for(var key in groupedAlerts) {
				alerts.push({
					installationId: key,
					alerts: groupedAlerts[key],
				});
				// Send push notifications
				SendPush(key, alerts.join());
			}
			response.success(alerts);
		}, function(error) {
			response.error();
		});
	});