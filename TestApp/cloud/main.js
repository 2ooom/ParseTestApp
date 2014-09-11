
Parse.Cloud.define("getAllFavoriteItems", function(request, response) {
	var TestItems = Parse.Object.extend("TestItems");
	var UserFavorites = Parse.Object.extend("UserFavorites");
	
	var testItemsQuery = new Parse.Query(TestItems);
	var userFavoritesQuery = new Parse.Query(UserFavorites);

	testItemsQuery.equalTo('school', request.school);

	userFavoritesQuery.include('testItem'); //This makes sure to pull all of the favorite item data instead of just the pointer object
	userFavoritesQuery.matchesQuery('testItem', testItemsQuery); //This will run this second query against the TestItems
	userFavoritesQuery.ascending('userId'); //group the user id's together in your array

	userFavoritesQuery.find().then(function(results) {
		var installations = [234, 324];
		response.success(installations);
	},
	function(error) {
		response.error();
	});
});