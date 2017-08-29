console.log("test");

$("form").on('submit',function (e) {
	e.preventDefault();
	console.log("Submitted");
})
// create an empty object

const app = {};

app.yumKey = 'bf6ff579ddf44506f1a5ba19a2eb465a';
app.yumId = 'fa8d9918';
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
	let yumCallOne = $.ajax({
		url:'http://api.yummly.com/v1/api/recipes',
		method: 'GET',
		dataType: 'json',
		data:{
			_app_id: app.yumId,
			_app_key: app.yumKey,
			q: 'onion soup',
			maxResult: 10,
			format: 'json'
		}
	  })
	let movieCallOne = $.ajax({
		url: 'https://api.themoviedb.org/3/discover/movie',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: app.movieKey,
			with_genres: 35,
			primary_release_year: 2010,
			sort_by: 'vote_average.desc'
		}
	}).then(function(res) {
		console.log(res);
	})
	  
	$.when(yumCallOne, movieCallOne).then(function (res1,res2){
		console.log(res1,res2);
	})

};


// make init function
app.init = function(){
	app.getData();
};

// doc ready
$(app.init);
