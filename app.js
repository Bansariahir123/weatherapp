document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const currentLocationButton = document.getElementById('currentLocationButton');
    const cityInput = document.getElementById('cityInput');
    const weatherDisplay = document.getElementById('weatherDisplay');
    const extendedForecast = document.getElementById('extendedForecast');

    // Event listener for the search button
    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
            saveCityToStorage(city);
        } else {
            alert('Please enter a valid city name.');
        }
    });

    // Event listener for the current location button
    currentLocationButton.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherDataByLocation(latitude, longitude);
        });
    });

    // Fetch weather data by city name
    function getWeatherData(city) {
        const apiKey = 'b14a57cdfdf0f02e21904841dee4e149';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('City not found');
                }
                return response.json();
            })
            .then(data => {
                displayWeatherData(data);
                getExtendedForecast(data.coord.lat, data.coord.lon);
            })
            .catch(error => {
                alert(error.message);
            });
    }

    // Fetch weather data by current location
    function getWeatherDataByLocation(lat, lon) {
        const apiKey = 'b14a57cdfdf0f02e21904841dee4e149';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Location not found');
                }
                return response.json();
            })
            .then(data => {
                displayWeatherData(data);
                getExtendedForecast(lat, lon);
            })
            .catch(error => {
                alert(error.message);
            });
    }

    // Display weather data with updated styling
    function displayWeatherData(data) {
        weatherDisplay.innerHTML = `
            <div class="bg-gradient-to-r from-purple-300 to-purple-500 p-6 rounded-md shadow-md">
                <h2 class="text-2xl font-bold text-white">${data.name} (${new Date(data.dt * 1000).toISOString().split('T')[0]})</h2>
                <p class="text-xl text-white mt-2">Temperature: ${data.main.temp}°C</p>
                <p class="text-xl text-white">Wind: ${data.wind.speed} M/S</p>
                <p class="text-xl text-white">Humidity: ${data.main.humidity}%</p>
                <div class="flex items-center justify-center mt-4">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="mr-4">
                    <p class="text-xl text-white">${data.weather[0].description}</p>
                </div>
            </div>
        `;
    }

    // Fetch and display 5-day forecast
    function getExtendedForecast(lat, lon) {
        const apiKey = 'b14a57cdfdf0f02e21904841dee4e149';
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayExtendedForecast(data);
            })
            .catch(error => {
                alert('Error fetching extended forecast.');
            });
    }

    // Display 5-day forecast with updated styling
    function displayExtendedForecast(data) {
        extendedForecast.innerHTML = `<h3 class="text-2xl font-bold text-white mt-4">5-Day Forecast</h3>`;
        const forecastDays = data.list.filter((forecast, index) => index % 8 === 0);

        forecastDays.forEach(forecast => {
            const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
            extendedForecast.innerHTML += `
                <div class="inline-block bg-purple-700 p-4 m-2 rounded-md shadow-md text-white zoom-card">
                    <h4 class="font-bold">${date}</h4>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}" class="block mx-auto">
                    <p>Temp: ${forecast.main.temp}°C</p>
                    <p>Wind: ${forecast.wind.speed} M/S</p>
                    <p>Humidity: ${forecast.main.humidity}%</p>
                </div>
            `;
        });
    }

    // Save searched city to local storage
    function saveCityToStorage(city) {
        let cities = JSON.parse(localStorage.getItem('cities')) || [];
        if (!cities.includes(city)) {
            cities.push(city);
            localStorage.setItem('cities', JSON.stringify(cities));
            updateCityDropdown(cities); // Update dropdown after saving
        }
    }

    // Load cities from local storage on page load
    function loadCitiesFromStorage() {
        let cities = JSON.parse(localStorage.getItem('cities')) || [];
        updateCityDropdown(cities);
    }

    // Update dropdown with cities or "no cities searched" option
    function updateCityDropdown(cities) {
        const dropdown = document.createElement('select');
        dropdown.className = 'w-full p-3 border border-purple-300 rounded-md mb-4';
        dropdown.innerHTML = `<option value="" disabled selected>Searched cities</option>`;

        if (cities.length === 0) {
            dropdown.innerHTML += `<option value="" disabled>No cities searched</option>`;
        } else {
            dropdown.innerHTML += cities.map(city => `<option value="${city}">${city}</option>`).join('');
        }

        // Remove any existing dropdown before appending
        if (weatherDisplay.querySelector('select')) {
            weatherDisplay.querySelector('select').remove();
        }

        weatherDisplay.appendChild(dropdown);

        dropdown.addEventListener('change', () => {
            getWeatherData(dropdown.value);
        });
    }

    // Load cities on page load
    loadCitiesFromStorage();
});
