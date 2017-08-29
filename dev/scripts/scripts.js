// function test() {
// 	console.log("test");
// }

// create an empty object

const app = {};

app.yumKey = 'bf6ff579ddf44506f1a5ba19a2eb465a';
app.yumId = 'f49c0671';
app.movieKey = 'dc85e0389c4e0355687d4c1bf7e0d2c1';

// events handling
app.events = function(){

};

// display function

app.display = function(){

};

//parse data function

app.parseData = function(){

};

// get data function

app.getData = function(){
	$.ajax({
		url:'http://api.yummly.com/v1/api/recipes',
		method: 'Get',
		dataType: 'json',
		data:{
			_app_key: app.yumKey,
			_app_id: app.yumId,
			q: 'cheese'
		}
	}).then(function(res){
		console.log(res);
	}).fail (function(err) {
		console.log(err)
	})
	// let callMovie =
};


// make init function
app.init = function(){
	app.getData();
};

// doc ready
$(app.init);
