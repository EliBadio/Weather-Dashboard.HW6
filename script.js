let storedSearchedCities = JSON.parse(localStorage.getItem('searchedCities'));
let lastSearched = JSON.parse(localStorage.getItem('lastSearched'));
let searchedCities = storedSearchedCities !== null ? storedSearchedCities : [];
let city;

// Init app
displaySearchedCities();
getWeather(lastSearched);
getFiveDaysWeather(lastSearched);

function displaySearchedCities() {
  $('#searched-cities').empty();
  $('#city').val('');

  searchedCities.forEach(function (city) {
    $('#searched-cities').prepend(
      `<a class="list-group-item list-group-item-action city" data-name="${city}">
      ${city}
    </a>`
    );
  });
}

// Display weather
async function getWeather(city) {
  const API_KEY = '71bd3c9de51567a495cc45c857ebcaf2';

  // Get & display weather
  let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`;
  let response = await $.ajax({
    url: queryURL,
    method: 'GET',
  });

  let currentCity = response.name;
  let weatherIcon = response.weather[0].icon;
  let temp = response.main.temp.toFixed(1);
  let humidity = response.main.humidity;
  let windSpeed = response.wind.speed.toFixed(1);

  // Display
  let displayCity = $("<h3 class = 'card-body'>").text(
    `${currentCity} (${moment().format('MM-DD-YYYY')})`
  );
  let displayWeatherIcon = $(
    `<img src = "http://openweathermap.org/img/wn/${weatherIcon}.png" />`
  );
  displayCity.append(displayWeatherIcon);
  let displayTemp = $(`<p class='card-text'>`).text(`Temperature: ${temp}° F`);
  let displayHumidity = $("<p class='card-text'>").text(
    `Humidity: ${humidity}%`
  );
  let displayWindSpeed = $("<p class='card-text'>").text(
    `Wind Speed: ${windSpeed}mph`
  );
  let displayUV = $("<p class='card-text'>").text('UV Index: ');

  let weatherDiv = $("<div class='card-body' id='curWeather'>");
  weatherDiv.append(displayCity);
  weatherDiv.append(displayTemp);
  weatherDiv.append(displayHumidity);
  weatherDiv.append(displayWindSpeed);

  // Get latitude and longitude to be used for the UV API
  let lat = response.coord.lat;
  let lon = response.coord.lon;

  // Get & display UV API
  let uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=imperial`;

  let uvResponse = await $.ajax({
    url: uvQueryURL,
    method: 'GET',
  });

  // get UV Index number and change color accordingly
  let uvIndex = uvResponse.value;
  let uv = $('<span class="uv">');

  if (uvIndex > 0 && uvIndex <= 2.99) {
    uv.addClass('low');
  } else if (uvIndex >= 3 && uvIndex <= 5.99) {
    uv.addClass('medium');
  } else if (uvIndex >= 6 && uvIndex <= 7.99) {
    uv.addClass('high');
  } else if (uvIndex >= 8 && uvIndex <= 10.99) {
    uv.addClass('very-high');
  } else {
    uv.addClass('extreme');
  }

  uv.text(uvIndex);
  displayUV.append(uv);

  weatherDiv.append(displayUV);
  $('#current-weather').html(weatherDiv);
}

async function getFiveDaysWeather(city) {
  const API_KEY = '71bd3c9de51567a495cc45c857ebcaf2';

  // Get & display 5 days weather
  let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&APPID=${API_KEY}`;

  let response = await $.ajax({
    url: queryURL,
    method: 'GET',
  });

  let forecastDiv = $("<div id='fiveDaysForecast'>");
  let header = $("<h5 class='card-header border-secondary' >").text(
    'Five Days Forecast'
  );
  forecastDiv.append(header);
  let cardDeck = $("<div class='card-deck'>");
  forecastDiv.append(cardDeck);

  // Response returns 40 weather report (@3hrs interval). we need to loop through 5 times @ 8-item interval
  for (i = 0; i != response.list.length; i += 8) {
    let weatherIcon = response.list[i].weather[0].icon;
    let temp = response.list[i].main.temp;
    let humidity = response.list[i].main.humidity;
    let xdate = response.list[i].dt_txt;

    let date = new Date(xdate);
    let curDate = `${
      date.getMonth() + 1
    }-${date.getDate()}-${date.getFullYear()}`;

    let singleCard = $("<div class='card mb-3 mt-3 bg-light'>");
    let cardInner = $("<div class='card-body'>");
    let displayDate = $("<h5 class='card-title'>").text(curDate);

    let displayWeatherIcon = $(
      `<img src = "http://openweathermap.org/img/wn/${weatherIcon}.png" />`
    );
    let displayTemp = $("<p class='card-text'>").text(`Temp.: ${temp}° F`);

    let displayHumidity = $("<p class='card-text'>").text(
      `Humidity: ${humidity}%`
    );

    cardInner.append(displayDate);
    displayDate.append(displayWeatherIcon);
    cardInner.append(displayTemp);

    cardInner.append(displayHumidity);
    singleCard.append(cardInner);
    cardDeck.append(singleCard);
  }

  $('#5-days-forcast').html(forecastDiv);
}

// Search cities
$('#search-box').submit(function (e) {
  e.preventDefault();
  city = $('#city').val().trim().toLowerCase();

  if (city === '') {
    alert('Please enter city');
  } else if (searchedCities.length >= 5) {
    // to ensure we don't store more than the last five searched cities
    if (!searchedCities.includes(city)) {
      searchedCities.shift();
      searchedCities.push(city);
    }
  } else {
    if (!searchedCities.includes(city)) {
      searchedCities.push(city);
    }
  }

  // Save to local storage. I need to set the local storage.
  localStorage.setItem('lastSearched', JSON.stringify(city));
  localStorage.setItem('searchedCities', JSON.stringify(searchedCities));

  displaySearchedCities();
  getWeather(city);
  getFiveDaysWeather(city);
});

// load past search
$(document).on('click', function (e) {
  if (e.target.classList.contains('city')) {
    city = e.target.getAttribute('data-name');
    getWeather(city);
    getFiveDaysWeather(city);
  }
});
