const apiKey = 'b92e77326b2598b16444c7ae5fdba226'; // Replace with your actual OpenWeatherMap API key
const apiUrl = 'https://api.openweathermap.org/data/2.5';

const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const currentWeatherSection = document.getElementById('current-weather');
const forecastSection = document.getElementById('forecast');
const searchHistorySection = document.getElementById('search-history');

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

function fetchWeatherData(city) {
  const currentWeatherUrl = `${apiUrl}/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `${apiUrl}/forecast?q=${city}&appid=${apiKey}&units=metric`;

  Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
      const currentWeather = data[0];
      const forecastWeather = data[1];

      if (!currentWeather || !forecastWeather) {
        throw new Error('City not found or API error');
      }

      displayCurrentWeather(currentWeather);
      displayForecastWeather(forecastWeather);
      addToSearchHistory(city);
    })
    .catch(error => console.error('Error fetching weather data:', error.message));
}

function displayCurrentWeather(weatherData) {
  if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
    console.error('Invalid weather data:', weatherData);
    return;
  }

  currentWeatherSection.innerHTML = `
    <div class="weather-card">
      <h2>${weatherData.name}</h2>
      <p>${new Date().toLocaleDateString()}</p>
      <img src="http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png" alt="weather-icon" class="weather-icon">
      <p>Temperature: ${weatherData.main.temp}°C</p>
      <p>Humidity: ${weatherData.main.humidity}%</p>
      <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
    </div>
  `;
}

function displayForecastWeather(weatherData) {
    if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
      console.error('Invalid forecast data:', weatherData);
      return;
    }
  
    forecastSection.innerHTML = ''; // Clear previous forecast data
  
    for (let i = 0; i < 5; i++) { // Display only 5 forecast items
      const forecastItem = weatherData.list[i * 8]; // Adjust index to skip 3-hour intervals
      const forecastDate = new Date(forecastItem.dt * 1000).toLocaleDateString();
      const forecastIcon = forecastItem.weather[0].icon;
  
      const forecastCard = document.createElement('div');
      forecastCard.classList.add('forecast-box');
      forecastCard.innerHTML = `
        <h3>${forecastDate}</h3>
        <img src="http://openweathermap.org/img/wn/${forecastIcon}.png" alt="weather-icon" class="weather-icon">
        <p>Temperature: ${forecastItem.main.temp}°C</p>
        <p>Humidity: ${forecastItem.main.humidity}%</p>
        <p>Wind Speed: ${forecastItem.wind.speed} m/s</p>
      `;
  
      forecastSection.appendChild(forecastCard);
    }
  }
  

// Remaining code for search history and event listeners...

function addToSearchHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    renderSearchHistory();
  }
}

function renderSearchHistory() {
  searchHistorySection.innerHTML = '';
  searchHistory.forEach(city => {
    const searchItem = document.createElement('div');
    searchItem.classList.add('search-item');
    searchItem.textContent = city;
    searchItem.addEventListener('click', () => fetchWeatherData(city));
    searchHistorySection.appendChild(searchItem);
  });
}

cityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherData(city);
    cityInput.value = '';
  }
});

renderSearchHistory();