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
	app.genrePicked = "Action"
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
		app.movieCarousel(movieArray)
	});
};

var count =  0;
var upperLimit = 4;

app.movieCarousel = function(movieArray) {
		if (count >= 0 && count < 20) {
			while(count < upperLimit) {
				console.log(count)
				let posterPathJpg = movieArray[count].poster_path
				let movieDescription = movieArray[count].title;
				var posterPath = `https://image.tmdb.org/t/p/w500${posterPathJpg}`;
				let movieId = movieArray[count].id;
				let movieSum = movieArray[count].overview;
				app.displayMovie(posterPath, movieDescription, movieId, movieSum);
				count++
			}
			if (upperLimit > 20) {
				upperLimit -= 4
			} else {
				upperLimit = count + 4;
			}
		} else {
			count = 0;
			upperLimit = 4;
			app.movieCarousel(movieArray);
		} 
	} 


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
			keyWords = "exciting";
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
			keyWords = "alien";	
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
		console.log(res);
		$(".recipeContainer").remove();
		let recipeArr = res.matches;
		let recipeIdList = [];
		for (let i = 0; i < 4; i++) {
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
		console.log(res);
	});
};

app.getMovieDetails = function () {

	$("#dynamicContent").on('click', ".movie__container",function(){
		let movieId = $(this).data("id");
		app.getMovieBackdrop(movieId);
		$(".movie__gallery--overlay").css("opacity","0.75")
		$(".movie__container").css("width", "0%");
		$(this).css("width", "100%");
		$("h2", this).css({
		    'opacity' : '1',
		});
		$("p", this).css({
			'opacity' : '1',
		})
	});

	$(".movie__gallery--overlay").on('click', function(){
		$(".movie__container").css("width", `calc((100%/4) - 2%)`);
		$(".movie__info--container h2 , .movie__info--container p").css("opacity", "0");
	})
}

app.getMovieBackdrop = function (movieId) {
	$.ajax({
		url: `https://api.themoviedb.org/3/movie/${movieId}/images`,
		method: "GET",
		dataType: "json",
		data: {
			api_key: app.movieKey,
		 }
	}).then(function(res){
		let backDropUrl = `https://image.tmdb.org/t/p/original${res.backdrops[0].file_path}`;
		$(".movie__gallery").css("background-image", `url(${backDropUrl})`);
	})
}

//function to display recipes to page 
app.displayRecipe = function(recipeName, recipeUrl, recipeImg){
	let recipeImgEl = $('<img>').addClass("recipeImage").attr('src', recipeImg);
	let recipeTitle = $('<p>').addClass("recipeTitle").append(recipeName);
	let recipeButton = $()
	let recipeContainer = $("<div>").addClass("recipeContainer").append(recipeImgEl,recipeTitle);
	$('#recipeDiv').append(recipeContainer);
}

//function to display movies to page

app.displayMovie = function(posterPath, movieDescription, movieId, movieSum){
	// console.log(movieDescription)
	let movieDescrip = $("<h2>").addClass("movie__descrip").append(movieDescription);
	let movieSummary = $("<p>").addClass("movie__summary").append(movieSum);
	let movieInfoContainer = $("<div>").addClass("movie__info--container").append(movieDescrip, movieSummary);
	let movieImgEl = $('<img>').addClass("movieImage").attr('src', posterPath);
	let movieOverlay = $("<div>").addClass("movie__overlay");
	// Added data-moveId to html data attribute so when clicked can call for backdrop image.
	let movieContainer = $("<div>").attr("data-id", movieId).addClass("movie__container").append(movieOverlay, movieImgEl, movieInfoContainer);
	$("#dynamicContent").append(movieContainer);
}

//Renders the circle nav in containing the genres
app.renderMenu = function() {
	var piemenu = new wheelnav('piemenu');
	piemenu.clockwise = false;
	piemenu.sliceInitPathFunction = piemenu.slicePathFunction;
	piemenu.initPercent = 0.2;
	piemenu.wheelRadius = piemenu.wheelRadius * 0.83;
	piemenu.createWheel();
}

// make init function
app.init = function(){
	app.renderMenu();
	app.getUserGenre();
	app.events();
	app.getMovieDetails();
};

// doc ready
$(app.init);
