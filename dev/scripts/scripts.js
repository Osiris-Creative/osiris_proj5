// create an empty object

const app = {};

app.yumKey = 'bf6ff579ddf44506f1a5ba19a2eb465a';
app.yumId = 'fa8d9918';
app.movieKey = 'dc85e0389c4e0355687d4c1bf7e0d2c1';

// events handling
app.events = function(){
	$("form").on('submit',function (e) {
		e.preventDefault();
		let userGenre = $('#genreChoice').val();
		// console.log(userGenre)
		let userDecade = parseInt($('#decadeChoice').val());
		let results = {
			userGenre: userGenre,
			userDecade: userDecade
		}
		app.parseData(results);
		console.log(userDecade);
	});
}

// display function

app.display = function(){

};

//parse data function

app.parseData = function(results){
	// if (results.userDecade ===)
	app.getGenre(results);	

};

// get data function

app.getGenre = function (results){
	console.log(results)
	let movieCallOne = $.ajax({
		url: 'https://api.themoviedb.org/3/genre/movie/list',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: app.movieKey,
			// with_genres: 35,
			// primary_release_year: 2010,
			// sort_by: 'vote_average.desc'
		}
	}).then(function(res){

		let genreList = res.genres
		let genreIndex = genreList.findIndex(function(el){
			return el.name === results.userGenre;
		});
		let genreId = genreList[genreIndex].id
		app.getData(genreId, results);
	});
};	

app.getData = function(genreId, results){
	let movieCallTwo = $.ajax({
		url: 'https://api.themoviedb.org/3/discover/movie',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: app.movieKey,
			with_genres: genreId,
			"primary_release_date.gte": "1990",
			"primary_release_date.lte": "1999",
			sort_by: 'popularity.desc'
		}
	})


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
	  
	$.when(movieCallTwo, yumCallOne).then(function (res1,res2){
		console.log(res1,res2);
	})

};


// make init function
app.init = function(){
	app.events();
};

// doc ready
$(app.init);
