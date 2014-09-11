Parse.initialize("nbkUPwBNxx6oKfqQBs7x6MVdIjMVLEpUPiMb3ht0", "pzxqnyYYelonMp5YIZVj8bHoq0t3CorTxd5WjoRl");

var TestItem = Parse.Object.extend("TestItem");
var User = Parse.Object.extend("User");
var UserFavorites = Parse.Object.extend("UserFavorites");
var numberOfUsers = 11;
var numberOfDataStubs = 11;

function CreateStubUsers(){
  var promises = [];
  msg('Creating users ...')
  // create stub users
  for(var i = 1; i <numberOfUsers; i++) {
    var user = new User();
    promises.push(user.save({username: 'User'+i, installationId: i, password: 'password'+i}).then(function(usr) {
      log(usr);
    }));
  }
  Parse.Promise.when(promises).then(function() {
    msg('Users Are created');
  }, function() {
    msg('Users already exist created');
  });
}

function log(text) {
  $('<li>' + text + '</li>').prependTo('#log');
}

function msg(text) {
  $('#msg').html(text);
}

function DropData(){
  // delete all objects
  var queryTestItem = new Parse.Query(TestItem);
  var queryUserFavorites = new Parse.Query(UserFavorites);
  var queryUser = new Parse.Query(User);
  var promises = [];
  msg('Clearing test data...');
  function drop(results) {
    results.forEach(function (result) {
      promises.push(result.destroy());
      log('DELETED ' + (result.get('school')?  result.get('school'): 'UserFavorites object'));
    });
  }
  promises.push(queryUserFavorites.find().then(drop));
  promises.push(queryTestItem.find().then(drop));
  //queryUser.find().then(drop);

  Parse.Promise.when(promises).then(function() {
    msg('Test data cleared');
  });
}


function CreateStubData() {
  // create stub data

  msg('Populating database with test data...');
  var promises = [];
  for(var i = 1; i < numberOfDataStubs; i++) {
    var testItem = new TestItem();
    var p = testItem.save({school: "School "+ i,}).then(function(item) {
      log('CREATED ' + item.get('className') + ' ' + item.get('school'));
      for(var j = numberOfDataStubs; j < (numberOfDataStubs + 3); j++) {
        var queryUser = new Parse.Query(User);
        var key = item.get('school').substring(7);
        var num = j - key;
        num = num >= numberOfDataStubs? 1: num;
        queryUser.equalTo('username', 'User' + (j - key));
        var pp = queryUser.find().then(function(users) {
          var user = users[0];
          var userFavorites = new UserFavorites();
          promises.push(userFavorites.save({testItem:item, user:user}).then(function(uf) {
            log('CREATED userFavorites for ' + user.get('username') + ' and ' + item.get('school'));
          }));
        });

      }
      promises.push(pp);
    });
    promises.push(p);
  }
  Parse.Promise.when(promises).then(function() {
    msg('Test data is created');
  });
}

function GetUserInstallations() {
  var school = $('#school').val();
  msg('Retrieving Installations for school ' + school + ' ...');
  Parse.Cloud.run('getAllFavoriteItems', { school: school }, {
    success: function(installations) {
      msg('Installations are: ' + installations.join());
    },
    error: function(result) {
      msg('Error: ' + result.error);
    }
  });
}