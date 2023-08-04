var apiKey = '5307a4f176ef121eb9c1023dc134039d';
//Check the local storage to see if an array of prior searches already exists, if not, then create a variable with an empty array
if(localStorage.getItem('searchHistory') === null) {
  var searchHistory = [];
} else {
  var searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
}

//Get the location of the user for default weather data of their current location
getLocation();
//set the search history if any exists.
setSearchHistory(searchHistory);

//Add an event listner for the form submission.
document.querySelector('#searchBox').addEventListener('submit', function(event) {
    event.preventDefault();
    removeErrorMsg();
    //if the value of the input city is blank, then throw an error to the user, otherwise geocode the city and add it to the search history
    if (document.querySelector('#city').value !== '') {      
      getGeocoding(document.querySelector('#city').value); 
      searchHistory.splice(0,0,document.querySelector('#city').value);
      //Max search history of 8, if there are more, remove the oldest search
      if(searchHistory.length > 8) {
        searchHistory.pop();
      }
      //Set the array to the local storage and show the history with the new entry
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      setSearchHistory(searchHistory);  
    } else {
      var errorMsg = document.createElement('p');
      errorMsg.textContent = "Please Enter a City.";
      errorMsg.setAttribute('id', 'error-msg');
      document.querySelector('#search-btn').parentNode.insertBefore(errorMsg, document.querySelector('#search-btn').nextSibling);
    }    
});
//Geocoding function to get the latitude and longitude of the city that was entered
function getGeocoding(city) {
    //API URL with apiKey appended
    var requestUrl = encodeURI('https://api.openweathermap.org/geo/1.0/direct?q='+city+'&limit=1&appid='+apiKey);
    //Fetch request for the data
    fetch(requestUrl)
      .then(function (response) {               
        return response.json();
      })
      .then(function (data) {        
        removeErrorMsg();
        //If API returns data with a length of 0, throw an error message to the user that they entered an invalid city.
        //Otherwise get the weather data
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
//Using the latitude and longitude function gets the weather for the entered city.
function getWeather(lat, lon) {
    //forcast URL
    var requestUrlForcast = encodeURI('https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat='+lat+'&lon='+lon+'&appid='+apiKey);
    //Current weather URL
    var requestUrlCurr = encodeURI('https://api.openweathermap.org/data/2.5/weather?units=imperial&lat='+lat+'&lon='+lon+'&appid='+apiKey);
    //Variable used for getting the ID of the element to place forcast data in.
    var forcastDay = 1;
    //Start the forcast date for today plus 1 day. Get mid-day data when possible.
    var nextDate = dayjs().hour(12).minute(0).second(0).add(1, 'day');
    //Fetch the current weather data
    fetch(requestUrlCurr)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        //Clear the current weather icon
        if(document.querySelector('#curr-weather-icon') !== null) {
            document.querySelector('#curr-weather-icon').remove();
        }
        //Create a new element for the weather icon and append it
        var weatherIcon = document.createElement('img');
        weatherIcon.setAttribute('src', "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");        
        weatherIcon.setAttribute('id', "curr-weather-icon");
        document.querySelector('#selected-city').after(weatherIcon);
        //Update the current data with the information received from the API
        document.querySelector('#selected-city').textContent = data.name + ' ('+ dayjs.unix(data.dt).format('M/D/YYYY') +')';        
        document.querySelector('#current-temp').textContent = data.main.temp;
        document.querySelector('#current-wind').textContent = data.wind.speed;
        document.querySelector('#current-humidity').textContent = data.main.humidity;
      });
    //Fetch the forcasted weather data
    fetch(requestUrlForcast)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        //The forcast data comes in in three hour increments.  For each item received, check for the noon forcast and write that data.
        //If the noon forcast is not returned by the API for the final day, use the last time that was provided.
        data.list.forEach(function(value, key) {
          if (nextDate.format('YYYY-MM-DD HH:mm:ss') === dayjs.unix(value.dt).format('YYYY-MM-DD HH:mm:ss') || (forcastDay === 5 && key === 39 ) ) {
            if(document.querySelector('#day-'+forcastDay+'-weather-icon') !== null) {
              document.querySelector('#day-'+forcastDay+'-weather-icon').remove();
            }
            //Create a new element for the weather icon and append it
            var weatherIcon = document.createElement('img');
            weatherIcon.setAttribute('src', "https://openweathermap.org/img/w/" + value.weather[0].icon + ".png");        
            weatherIcon.setAttribute('id', "day-"+forcastDay+"-weather-icon");            
            document.querySelector('#day-'+forcastDay+'-date').after(weatherIcon);
            //Update the forcast data with the information received from the API
            document.querySelector('#day-'+forcastDay+'-date').textContent = nextDate.format('M/D/YYYY');
            document.querySelector('#day-'+forcastDay+'-temp').textContent = value.main.temp_max;
            document.querySelector('#day-'+forcastDay+'-wind').textContent = value.wind.speed;
            document.querySelector('#day-'+forcastDay+'-humidity').textContent = value.main.humidity;
            //increment to the next day.
            nextDate = nextDate.add(1,'day');
            //increment the forcast day for the ID.
            forcastDay++;
          }
        });
      });
}
//Function to get the current location of the user for default weather data.
function getLocation() {
  navigator.geolocation.getCurrentPosition(showPosition);
}
//Function to parse and send the latitude and longitude for the current location
function showPosition(position) {
  getWeather(position.coords.latitude, position.coords.longitude)
}
//Function to set the search history section.
function setSearchHistory(searchHis) {
  document.querySelector('#priorSearch').textContent = '';
  searchHis.forEach(function(value) {
    var searchBtn = document.createElement('button');
    searchBtn.textContent = value;
    searchBtn.setAttribute('class','my-2 btn btn-secondary');
    searchBtn.addEventListener('click',function(event) {
      event.preventDefault();
      getGeocoding(searchBtn.textContent);
    });
    document.querySelector('#priorSearch').appendChild(searchBtn);
  });
}

function removeErrorMsg() {
  //If an error message was previously displayed, remove it
  if(document.querySelector('#error-msg') !== null) {
    document.querySelector('#error-msg').remove();
  } 
}