'use strict';

// create an empty object
var app = {};

app.yumKey = 'bf6ff579ddf44506f1a5ba19a2eb465a';
app.yumId = 'fa8d9918';
app.movieKey = 'dc85e0389c4e0355687d4c1bf7e0d2c1';

// get genre picked from user
app.getUserGenre = function (genrePicked) {
	// Could not add space to parameter in the wheel that worked
	if (genrePicked === "Science") {
		app.genrePicked = "Science Fiction";
	} else {
		app.genrePicked = genrePicked;
	}
};
// on form submit event handling
app.events = function (genrePicked) {
	app.genrePicked = "Action"; //Default genre
	$(".mobile__list li").on('click', function () {
		app.genrePicked = $(this).text();
	});

	$("form").on('submit', function (e) {
		e.preventDefault();
		app.userDecade = parseInt($('#decadeChoice').val());
		var userSelection = {
			userGenre: app.genrePicked,
			userDecade: app.userDecade
		};
		$(".movie__gallery").css("height", "100%");
		$("html, body").animate({
			scrollTop: $(".movie__gallery").offset().top
		}, 900);
		$(".movie__gallery--btn").fadeIn();
		app.getGenre(userSelection);
	});
};

// ajax call for getting movie genre
app.getGenre = function (results) {
	var movieCallOne = $.ajax({
		url: 'https://api.themoviedb.org/3/genre/movie/list',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: app.movieKey
		}
	}).then(function (res) {
		var genreList = res.genres;
		var genreIndex = genreList.findIndex(function (el) {
			return el.name === results.userGenre;
		});
		var genreId = genreList[genreIndex].id;
		var genreName = genreList[genreIndex].name;
		app.getMovieData(genreId, results);
		app.getYumId(genreName);
	});
};

// ajax call for getting movie decade 
app.getMovieData = function (genreId, results) {
	var decadeStart = results.userDecade;
	var decadeEnd = results.userDecade + 9;

	$.ajax({
		url: 'https://api.themoviedb.org/3/discover/movie',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: app.movieKey,
			with_genres: genreId,
			with_original_language: "en",
			"primary_release_date.gte": decadeStart,
			"primary_release_date.lte": decadeEnd,
			sort_by: 'popularity.desc',
			page: 1
		}
	}).then(function (res) {
		//Clear movie list
		$("#dynamicContent").empty();
		var movieArray = res.results;
		$(".movie__gallery--btn").on('click', function () {
			app.movieCarousel(movieArray);
		});
		app.movieCarousel(movieArray);
	});
};

//setting up move carousel
var count = 0;
var upperLimit = 4;

app.movieCarousel = function (movieArray) {
	$("#dynamicContent").empty();

	if (count >= 0 && count < 20) {
		while (count < upperLimit) {
			var posterPathJpg = movieArray[count].poster_path;
			var movieDescription = movieArray[count].title;
			var posterPath = 'https://image.tmdb.org/t/p/w500' + posterPathJpg;
			var movieId = movieArray[count].id;
			var movieSum = movieArray[count].overview;
			app.displayMovie(posterPath, movieDescription, movieId, movieSum);
			count++;
		}
		if (upperLimit > 20) {
			upperLimit -= 4;
		} else {
			upperLimit = count + 4;
		}
	} else {
		count = 0;
		upperLimit = 4;
		app.movieCarousel(movieArray);
	}
};

// ajax call for getting recipe ID based on user genre selection
app.getYumId = function (genreName) {
	var keyWords = void 0;
	switch (genreName) {
		case "Action":
			keyWords = "spicy";
			break;
		case "Comedy":
			keyWords = "funny";
			break;
		case "Drama":
			keyWords = "drama";
			break;
		case "Fantasy":
			keyWords = "medieval";
			break;
		case "Horror":
			keyWords = "brain";
			break;
		case "Music":
			keyWords = "soul";
			break;
		case "Romance":
			keyWords = "sweet love";
			break;
		case "Science Fiction":
			keyWords = "alien";
	}
	$.ajax({
		url: 'http://api.yummly.com/v1/api/recipes?excludedCourse=course^course-Beverages&excludedCourse=course^course-Condiments and Sauces&excludedCourse=course^course-Cocktails&excludedCourse=course^course-Soup&excludedCourse=course^course-Breads',
		method: 'GET',
		dataType: 'json',
		data: {
			_app_id: app.yumId,
			_app_key: app.yumKey,
			q: keyWords,
			requirePictures: true,
			// maxTotalTimeInSeconds: 2700
			format: 'json'
		}
	}).then(function (res) {
		$(".recipe__card__wrapper").remove();
		var recipeArr = res.matches;
		var recipeIdList = [];
		for (var i = 0; i < 4; i++) {
			recipeIdList.push(recipeArr[i].id);
		}
		var recipeCalls = recipeIdList.map(app.getYumRecipe);
	});
};

//ajax call for getting recipe info 
app.getYumRecipe = function (recipeId) {
	$.ajax({
		url: 'http://api.yummly.com/v1/api/recipe/' + recipeId,
		method: 'GET',
		dataType: 'json',
		data: {
			_app_id: app.yumId,
			_app_key: app.yumKey
		}
	}).then(function (res) {
		var recipeName = res.name;
		var recipeNameLength = recipeName.length;
		if (recipeNameLength > 30) {
			recipeName = recipeName.substring(0, 30) + '...';
		};
		var recipeUrl = res.source.sourceRecipeUrl;
		var recipeImg = res.images[0].imageUrlsBySize['360'];
		var recipeServings = res.numberOfServings;
		var recipeLgthTime = res.totalTime;
		app.displayRecipe(recipeName, recipeUrl, recipeImg, recipeServings, recipeLgthTime);
	});
};
//Starts and stops detection of collision between elements when clicked out of movie selection
app.collisionInterval = function (input) {
	var collisionDetect = setInterval(app.elementCollide, 300);
	if (input !== false) {
		collisionDetect;
	} else {
		clearInterval(collisionDetect);
	}
};
//displaying movie details when user clicks on movie poster
app.getMovieDetails = function () {
	$("#dynamicContent").on('click', ".movie__container", function () {
		app.collisionInterval();
		var movieId = $(this).data("id");
		app.getMovieBackdrop(movieId);
		$(".movie__gallery--btn").fadeOut(10);
		$(".movie__info--container").removeClass("inFocus");
		$(".movie__gallery--overlay").css("opacity", "0.75");
		$(".movieImage").removeClass("inFocus2");
		$(".movie__container").css("width", "0%");
		$(this).css("width", "100%");
		$(".movie__info--container", this).addClass("inFocus");
		$(".movieImage", this).addClass("inFocus2");
		$("*", this).css({
			'opacity': '1'
		});
	});

	$(".movie__gallery--overlay").on('click', function () {
		app.collisionInterval(false);
		$(".movie__gallery--btn").fadeIn();
		$(".movieImage").css("opacity", "1");
		$(".movie__info--container").removeClass("inFocus");
		$(".movieImage").removeClass("inFocus2");

		if ($(window).width() < 790) {
			$(".movie__container").css("width", 'calc((100% / 2) - 2%)');
		} else {
			$(".movie__container").css("width", 'calc((100% / 4 ) - 2%)');
		}

		$(".movie__info--container h2 , .movie__info--container p, .movie__info--container a, .movie__info--container img, .movie__info--container div").css("opacity", "0");
	});
};

//ajax call for movie background
app.getMovieBackdrop = function (movieId) {
	$.ajax({
		url: 'https://api.themoviedb.org/3/movie/' + movieId + '/images',
		method: "GET",
		dataType: "json",
		data: {
			api_key: app.movieKey
		}
	}).then(function (res) {
		var backDropUrl = 'https://image.tmdb.org/t/p/original' + res.backdrops[0].file_path;
		$(".movie__gallery").css("background-image", 'url(' + backDropUrl + ')');
	});
};

//function to display recipe cards to page 
app.displayRecipe = function (recipeName, recipeUrl, recipeImg, recipeServings, recipeLgthTime) {
	var recipeImgEl = $('<img>').addClass("recipe__img").attr('src', recipeImg);
	var recipeTitle = $('<h2>').addClass("recipe__title").append(recipeName);
	var recipeOverlay = $('<div>').addClass("recipe__overlay");
	var recipeServ = $('<p>').addClass("recipe__servings").append('Servings: ' + recipeServings);
	var recipeTime = $('<p>').addClass("recipe__time").append('Total Time: ' + recipeLgthTime);
	var recipeInfo = $('<div>').addClass("recipe__info").append(recipeServ, recipeTime);
	var recipeImage = $('<div>').addClass("recipe__card__wrapper").append(recipeOverlay, recipeImgEl, recipeTitle, recipeInfo);
	var recipeCard = $('<a>').attr('href', recipeUrl).attr('target', '_blank').append(recipeImage);
	$('.movie__info--container').append(recipeCard);
};

//function to display movies to page
app.displayMovie = function (posterPath, movieDescription, movieId, movieSum) {
	// console.log(movieDescription)
	var movieDescrip = $("<h2>").addClass("movie__descrip").append(movieDescription);
	var movieSummary = $("<p>").addClass("movie__summary").append(movieSum);
	var movieInfoContainer = $("<div>").addClass("movie__info--container").append(movieDescrip, movieSummary);
	var movieImgEl = $('<img>').addClass("movieImage").attr('src', posterPath);
	var movieOverlay = $("<div>").addClass("movie__overlay");
	// Added data-moveId to html data attribute so when clicked can call for backdrop image.
	var movieContainer = $("<div>").attr("data-id", movieId).addClass("movie__container").append(movieOverlay, movieImgEl, movieInfoContainer);
	$("#dynamicContent").append(movieContainer);
};

//Detects when two elements collide on page
app.elementCollide = function () {

	var element1 = $(".inFocus");
	var element2 = $(".inFocus2");

	try {
		var coordX1 = element1.offset().left;
		var coordX1outerWidth = element1.outerWidth(true);
		// let coordY1 = element1.offset().top;
		var coordX2 = element2.offset().left;
		var coordX2outerWidth = element2.outerWidth(true);
		// let coordY2 = element2.offset().top

		var element1FootPrint = coordX1 + coordX1outerWidth;
		var element2FootPrint = coordX2 + coordX2outerWidth;

		// console.log("coordX1",coordX1,"fpx1", element1FootPrint)
		// console.log("coordX2",coordX2,"fpx2", element2FootPrint)

		if (element1FootPrint < coordX2 || coordX1 > element2FootPrint) {
			// console.log("no collision");
			$(".movieImage").css("opacity", "1");
		} else {
			$(".movieImage").css("opacity", "0.25");
			// console.log("collision")
		}
	} catch (e) {
		return;
	}
};

//Renders the circle nav in containing the genres
app.renderMenu = function () {
	var piemenu = new wheelnav('piemenu');
	piemenu.clockwise = false;
	piemenu.sliceInitPathFunction = piemenu.slicePathFunction;
	piemenu.initPercent = 0.2;
	piemenu.wheelRadius = piemenu.wheelRadius * 0.83;
	piemenu.createWheel();
	$(".movie__gallery--btn").fadeOut();
};

// make init function
app.init = function () {
	app.renderMenu();
	app.getUserGenre();
	app.events();
	app.getMovieDetails();
	// on page refresh, bring user to the top of the page
	$(window).on('load', function () {
		$('html, body').animate({
			scrollTop: $('body').offset().top
		}, 100);
	});
	//on click of header bring user to wheel
	$('.logoContainer').on('click', function () {
		$('html, body').animate({
			scrollTop: $('.userSelectionSection').offset().top
		}, 1000);
	});
};

// doc ready
$(app.init);