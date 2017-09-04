// create an empty object
const app = {};

app.yumKey = 'bf6ff579ddf44506f1a5ba19a2eb465a';
app.yumId = 'fa8d9918';
app.movieKey = 'dc85e0389c4e0355687d4c1bf7e0d2c1';

// get genre picked from user
app.getUserGenre = function(genrePicked){
	// Could not add space to parameter in the wheel that worked
	if (genrePicked === "Science") {
		app.genrePicked = "Science Fiction";
	} else {
		app.genrePicked = genrePicked;
	}
}	
// on form submit event handling
app.events = function(genrePicked){
	app.genrePicked = "Action"
	$("form").on('submit',function (e) {
		e.preventDefault();
		app.userDecade = parseInt($('#decadeChoice').val());
		let userSelection = {
			userGenre: app.genrePicked,
			userDecade: app.userDecade
		}
		$(".movie__gallery").css("height" , "90%");
		$("html, body").animate({
			scrollTop: $(".movie__gallery").offset().top
		}, 900)
		app.getGenre(userSelection);
	});

}

// ajax call for getting movie genre
app.getGenre = function (results){
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

// ajax call for getting movie decade 
app.getMovieData = function(genreId,results){
	let decadeStart = results.userDecade;
	let decadeEnd = results.userDecade + 9;

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
	}).then(function(res){
		//Clear movie list
		$("#dynamicContent").empty();
		let movieArray = res.results; 
		app.movieCarousel(movieArray)
	});
};

//setting up move carousel
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

// ajax call for getting recipe ID based on user genre selection
app.getYumId = function(genreName){
	let keyWords;
	switch(genreName){
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
			keyWords = "brain"
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
		url:'http://api.yummly.com/v1/api/recipes?excludedCourse=course^course-Beverages&excludedCourse=course^course-Condiments and Sauces&excludedCourse=course^course-Cocktails&excludedCourse=course^course-Soup&excludedCourse=course^course-Breads',
		method: 'GET',
		dataType: 'json',
		data:{
			_app_id: app.yumId,
			_app_key: app.yumKey,
			q: keyWords,
			requirePictures: true,
			// maxTotalTimeInSeconds: 2700
			format: 'json'
		}
	}).then(function(res){
		console.log(res);
		$('.recipe__card__wrapper').remove();
		let recipeArr = res.matches;
		let recipeIdList = [];
		for (let i = 0; i < 4; i++) {
			recipeIdList.push(recipeArr[i].id);
		}
		var recipeCalls = recipeIdList.map(app.getYumRecipe);
	});
};

//ajax call for getting recipe info 
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
		let recipeNameLength = recipeName.length;
		if (recipeNameLength > 30) {
			recipeName = `${recipeName.substring(0, 30)}...`;
		};
		let recipeUrl = res.source.sourceRecipeUrl;
		let recipeImg = res.images[0].imageUrlsBySize['360'];
		let recipeServings = res.numberOfServings;
		let recipeLgthTime = res.totalTime;
		app.displayRecipe(recipeName, recipeUrl, recipeImg, recipeServings, recipeLgthTime);
	});
};
//Starts and stops detection of collision between elements when clicked out of movie selection
app.collisionInterval = function(input) {
	let collisionDetect = setInterval(app.elementCollide, 300);
	if (input !== false) {
		collisionDetect;
	} else {
		clearInterval(collisionDetect);
	}
}
//displaying movie details when user clicks on movie poster
app.getMovieDetails = function () {
	$("#dynamicContent").on('click', ".movie__container",function(){
		app.collisionInterval();
		let movieId = $(this).data("id");
		app.getMovieBackdrop(movieId);
		$(".movie__info--container").removeClass("inFocus")
		$(".movie__gallery--overlay").css("opacity","0.75");
		$(".movieImage").removeClass("inFocus2");
		$(".movie__container").css("width", "0%");
		$(this).css("width", "100%");
		$(".movie__info--container", this).addClass("inFocus")
		$(".movieImage", this).addClass("inFocus2");
		$("*", this).css({
		    'opacity' : '1',
		});
		// $("p", this).css({
		// 	'opacity' : '1',
		// })
		// $("div", this).css({
		// 	'opacity' : '1',
		// })
		// $("img", this).css({
		// 	'opacity' : '1',
		// })
		// $("a", this).css({
		// 	'opacity' : '1',
		// })
		// console.log(this);
	});

	$(".movie__gallery--overlay").on('click', function(){
		app.collisionInterval(false);
		$(".movieImage").css("opacity", "1");
		$(".movie__info--container").removeClass("inFocus")
		$(".movieImage").removeClass("inFocus2");

		$(".movie__container").css("width", `calc((100%/4) - 2%)`);
		$(".movie__info--container h2 , .movie__info--container p, .movie__info--container a, .movie__info--container img, .movie__info--container div").css("opacity", "0");
	})
}

//ajax call for movie background
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

//function to display recipe cards to page 
app.displayRecipe = function(recipeName, recipeUrl, recipeImg, recipeServings, recipeLgthTime){
	let recipeImgEl = $('<img>').addClass("recipe__img").attr('src', recipeImg);
	let recipeTitle = $('<h2>').addClass("recipe__title").append(recipeName);
	let recipeOverlay = $('<div>').addClass("recipe__overlay");
	let recipeServ = $('<p>').addClass("recipe__servings").append(`Servings: ${recipeServings}`);
	let recipeTime = $('<p>').addClass("recipe__time").append(`Total Time: ${recipeLgthTime}`);
	let recipeInfo = $('<div>').addClass("recipe__info").append(recipeServ, recipeTime);
	let recipeImage = $('<div>').addClass("recipe__card__wrapper").append(recipeOverlay, recipeImgEl, recipeTitle, recipeInfo);
	let recipeCard = $('<a>').attr('href', recipeUrl).attr('target', '_blank').append(recipeImage);
	$('.movie__info--container').append(recipeCard);
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

//Detects when two elements collide on page
app.elementCollide = function() {

	let element1 = $(".inFocus")
	let element2 = $(".inFocus2");

	try {
	let coordX1 = element1.offset().left;
	let coordX1outerWidth = element1.outerWidth(true);
	// let coordY1 = element1.offset().top;
	let coordX2 = element2.offset().left;
	let coordX2outerWidth = element2.outerWidth(true);
	// let coordY2 = element2.offset().top

	let element1FootPrint = coordX1 + coordX1outerWidth;
	let element2FootPrint = coordX2 + coordX2outerWidth;


	// console.log("coordX1",coordX1,"fpx1", element1FootPrint)
	// console.log("coordX2",coordX2,"fpx2", element2FootPrint)

	if ( element1FootPrint < coordX2 || coordX1 > element2FootPrint) {
		// console.log("no collision");
		$(".movieImage").css("opacity", "1");
	} else {
		$(".movieImage").css("opacity", "0.25");
		// console.log("collision")
	}
  } catch (e) {
  	return;
  }

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
	// on page refresh, bring user to the top of the page
	$(window).on('load', function(){
		$('html, body').animate({
			scrollTop: $('body').offset().top
		}, 1000);
	});
	//on click of header bring user to wheel
	$('.logoContainer').on('click', function() {
		$('html, body').animate({
			scrollTop: $('.userSelectionSection').offset().top
		}, 1000);
	});
};

// doc ready
$(app.init);
