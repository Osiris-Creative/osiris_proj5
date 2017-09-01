// create an empty object

const app = {};

app.yumKey = 'bf6ff579ddf44506f1a5ba19a2eb465a';
app.yumId = 'fa8d9918';
app.movieKey = 'dc85e0389c4e0355687d4c1bf7e0d2c1';


app.getUserGenre = function(genrePicked){
	// Could not add space to parameter in the wheel that worked
	if (genrePicked === "Science") {
		app.genrePicked = "Science Fiction";
	} else {
		app.genrePicked = genrePicked;
	}
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
		let genreList = res.genres
		let genreIndex = genreList.findIndex(function(el){
			return el.name === results.userGenre;
		});
		let genreId = genreList[genreIndex].id
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
	}).then(function(res){
		console.log(res);
		//Clear movie list
		$("#dynamicContent").empty();
		let movieArray = res.results; 
		for (var i = 0; i < movieArray.length; i++){
		let posterPathJpg = movieArray[i].poster_path
		var posterPath = `https://image.tmdb.org/t/p/w500${posterPathJpg}`;
		app.displayMovie(posterPath);
		}
	});
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
		var recipeCalls = recipeIdList.map(app.getYumRecipe);
	});
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
		let recipeName = res.name;
		let recipeUrl = res.source.sourceRecipeUrl;
		let recipeImg = res.images[0].imageUrlsBySize['360'];
		app.displayRecipe(recipeName, recipeUrl, recipeImg);
	});
};

//function to display recipes to page 
app.displayRecipe = function(recipeName, recipeUrl, recipeImg){
	let recipeImgEl = $('<img>').addClass('recipeImage');
		recipeImgEl.attr('src', recipeImg);
	// let recipeLink = .append(`<a>${recipeName}</a>`);
		// recipeLink.attr('href', recipeUrl);
	// $('#dynamicContent').append(recipeImgEl)
}

//function to display movies to page

app.displayMovie = function(posterPath){

	let movieImgEl = $('<img>').addClass("movieImage").attr('src', posterPath);
	let movieOverlay = $("<div>").addClass("movie__overlay");
	let movieContainer = $("<div>").addClass("movie__container").append(movieOverlay, movieImgEl);
	$("#dynamicContent").append(movieContainer);
}

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
