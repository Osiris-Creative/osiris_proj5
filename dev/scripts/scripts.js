// create an empty object

const app = {};

app.yumKey = 'bf6ff579ddf44506f1a5ba19a2eb465a';
app.yumId = 'fa8d9918';
app.movieKey = 'dc85e0389c4e0355687d4c1bf7e0d2c1';


app.getUserGenre = (genrePicked) => {

	console.log(genrePicked)
	app.genrePicked = genrePicked;
}
// events handling
app.events = function(genrePicked){
	// console.log(genrePicked)
	$("form").on('submit',function (e) {
		e.preventDefault();
		app.userDecade = parseInt($('#decadeChoice').val());
		let userSelection = {
			userGenre: app.genrePicked,
			userDecade: app.userDecade
		}
		app.getGenre(userSelection);
	});
}


// get data function

app.getGenre = function (results){
	// console.log(results)
	let movieCallOne = $.ajax({
		url: 'https://api.themoviedb.org/3/genre/movie/list',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: app.movieKey,
		}
	}).then(function(res){
		console.log(res)
		let genreList = res.genres
		let genreIndex = genreList.findIndex(function(el){
			return el.name === results.userGenre;
		});
		console.log(genreIndex)
		let genreId = genreList[genreIndex].id
		console.log(genreId);
		let genreName = genreList[genreIndex].name
		app.getMovieData(genreId, results);
		app.getYumId(genreName);
	});
};	

app.getMovieData = function(genreId,results){
	// console.log(results)
	let decadeStart = results.userDecade;
	let decadeEnd = results.userDecade + 9;

	$.ajax({
		url: 'https://api.themoviedb.org/3/discover/movie',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: app.movieKey,
			with_genres: genreId,
			"primary_release_date.gte": decadeStart,
			"primary_release_date.lte": decadeEnd,
			sort_by: 'popularity.desc',
			page: 1
		}
	}).then(function(){});
};

app.getYumId = function(genreName){
	let keyWords;
	switch(genreName){
		case "Action":
			keyWords = "spicy";
			break;
		case "Comedy":
			keyWords = "fun party";
			break;
		case "Drama":
			keyWords = "bitter";
			break;
		case "Fantasy":
			keyWords = "medieval";
			break;
		case "Horror":
			keyWords = "brain"
			break;
		case "Music":
			keyWords = "soul";
			break;
		case "Romance":
			keyWords = "love";
			break;
		case "Science Fiction":
			keyWords = "brain";	
	}
	$.ajax({
		url:'http://api.yummly.com/v1/api/recipes',
		method: 'GET',
		dataType: 'json',
		data:{
			_app_id: app.yumId,
			_app_key: app.yumKey,
			requirePictures: true,
			q: keyWords,
			allowedCourse: "course^course-Snacks",
			allowedCourse: "course^course-Desserts",
			allowedCourse: "course^course-Appetizers",
			maxResult: 20,
			format: 'json'
		}
	}).then(function(res){
		let recipeArr = res.matches;
		let recipeIdList = [];
		for (let i = 0; i < recipeArr.length; i++) {
			recipeIdList.push(recipeArr[i].id);
		}
		console.log(recipeIdList);
	});
	// app.getYumRecipe(recipeId)
};

app.getYumRecipe = function (recipeId) {
	$.ajax({
		url: `http://api.yummly.com/v1/api/recipe/${recipeId}`,
		method: 'GET',
		dataType: 'json',
		data:{
			_app_id: app.yumId,
			_app_key: app.yumKey
		}
	}).then(function(res){
		console.log(res)
	});
};






//parse data function
// app.parseData = function(genreName, results){
// 	if(genreName === )
// };


// display function

app.display = function(){

};

//Renders the circle nav in containing the genres
app.renderMenu = function() {
	var piemenu = new wheelnav('piemenu');
	piemenu.clockwise = false;
	piemenu.wheelRadius = piemenu.wheelRadius * 0.83;
	piemenu.createWheel();
}

// make init function
app.init = function(){
	app.renderMenu();
	app.getUserGenre();
	app.events();
};

// doc ready
$(app.init);
