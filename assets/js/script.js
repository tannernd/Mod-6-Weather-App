var apiKey = '5307a4f176ef121eb9c1023dc134039d';

getLocation();


document.querySelector('#search-btn').addEventListener('click', function(event) {
    event.preventDefault();
    getGeocoding(document.querySelector('#city').value);
});

function getGeocoding(city) {
    var requestUrl = encodeURI('http://api.openweathermap.org/geo/1.0/direct?q='+city+'&limit=1&appid='+apiKey);
    fetch(requestUrl)
      .then(function (response) {               
        return response.json();
      })
      .then(function (data) {
        if(document.querySelector('#error-msg') !== null) {
            document.querySelector('#error-msg').remove();
        }
        if(data.length !== 0) {
            getWeather(data[0].lat, data[0].lon);
        } else {
            var errorMsg = document.createElement('p');
            errorMsg.textContent = "City Not Found, Please Try Again.";
            errorMsg.setAttribute('id', 'error-msg');
            document.querySelector('#search-btn').parentNode.insertBefore(errorMsg, document.querySelector('#search-btn').nextSibling);
        }
      });
}

function getWeather(lat, lon) {
    var requestUrlForcast = encodeURI('https://api.openweathermap.org/data/2.5/forecast?lat='+lat+'&lon='+lon+'&appid='+apiKey);
    var requestUrlCurr = encodeURI('https://api.openweathermap.org/data/2.5/weather?units=imperial&lat='+lat+'&lon='+lon+'&appid='+apiKey);

    fetch(requestUrlCurr)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if(document.querySelector('#curr-weather-icon') !== null) {
            document.querySelector('#curr-weather-icon').remove();
        }
        var weatherIcon = document.createElement('img');
        weatherIcon.setAttribute('src', "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");        
        weatherIcon.setAttribute('id', "curr-weather-icon");
        document.querySelector('#selected-city').after(weatherIcon);
        document.querySelector('#selected-city').textContent = data.name + ' ('+ dayjs.unix(data.dt).format('M/D/YYYY') +')';        
        document.querySelector('#current-temp').textContent = data.main.temp;
        document.querySelector('#current-wind').textContent = data.wind.speed;
        document.querySelector('#current-humidity').textContent = data.main.humidity;
      });
    

}

function getLocation() {
      navigator.geolocation.getCurrentPosition(showPosition);
  }
  
function showPosition(position) {
getWeather(position.coords.latitude, position.coords.longitude)
}