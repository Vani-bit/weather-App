const apiKey = "027ff9fcc2838f537e5ba3ad009f9b4a";
const currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBox = document.getElementById("searchbar");
const searchBtn = document.getElementById("searchBtn");
const weatherIcon = document.querySelector(".weather-icon");
const dropdown = document.getElementById("dropdown");
const errorDisplay = document.querySelector(".error");
const weatherDisplay = document.querySelector(".weather");
const forecastDisplay = document.getElementById("forecastDisplay");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];


function showDropdown() {
    const inputValue = searchBox.value.toLowerCase();
    const dropdownList = dropdown.querySelector("ul");
    dropdownList.innerHTML = "";

    if (!inputValue) {
        dropdown.classList.add("hidden");
        return;
    }

    const filteredCities = recentCities.filter(city => city.toLowerCase().startsWith(inputValue));
    if (filteredCities.length === 0) {
        dropdown.classList.add("hidden");
        return;
    }

    filteredCities.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        li.classList.add("p-2", "cursor-pointer", "hover:bg-gray-200", "rounded");
        li.addEventListener("click", () => {
            searchBox.value = city;
            checkWeather(city);
            checkForecast(city);
            dropdown.classList.add("hidden");
        });
        dropdownList.appendChild(li);
    });

    dropdown.classList.remove("hidden");
}

// Update recent cities in local storage
function updateRecentCities(city) {
    if (!recentCities.includes(city)) {
        recentCities.unshift(city);
        if (recentCities.length > 5) recentCities.pop();
        localStorage.setItem("recentCities", JSON.stringify(recentCities));
    }
}

// current weather
async function checkWeather(city) {
    if (!city) {
        errorDisplay.textContent = "Please enter a city name.";
        errorDisplay.classList.remove("hidden");
        weatherDisplay.classList.add("hidden");
        return;
    }

    try {
        const response = await fetch(currentWeatherUrl + city + `&appid=${apiKey}`);

        if (!response.ok) {
            throw new Error("Invalid city name");
        }

        const data = await response.json();

        document.querySelector(".city").textContent = data.name;
        document.querySelector(".temp").textContent = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").textContent = data.main.humidity + "%";
        document.querySelector(".wind").textContent = data.wind.speed + " km/h";

        const weatherMain = data.weather[0].main.toLowerCase();
        weatherIcon.src = `images/${weatherMain}.png` || "images/clear.png";

        weatherDisplay.classList.remove("hidden");
        errorDisplay.classList.add("hidden");

        updateRecentCities(city);

    } catch (error) {
        errorDisplay.textContent = error.message;
        errorDisplay.classList.remove("hidden");
        weatherDisplay.classList.add("hidden");
    }
}

// 5-day weather forecast
async function checkForecast(city) {
    try {
        const response = await fetch(forecastApiUrl + city + `&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error("Unable to fetch forecast data");
        }

        const data = await response.json();
        const dailyData = getDailyForecast(data.list);

        
        forecastDisplay.innerHTML = "";

        dailyData.forEach(day => {

            const forecastItem = document.createElement("div");
            forecastItem.className = "flex-1 min-w-[150px] bg-white text-black rounded-lg shadow p-4 text-center";


            forecastItem.innerHTML = `
                <p class="font-bold">${day.date}</p>
                <img src="images/${day.icon}.png" alt="${day.weather}" class="w-12 mx-auto">
                <p class="text-lg font-bold">${day.temp}°C</p>
                <p>Wind: ${day.wind} km/h</p>
                <p>Humidity: ${day.humidity}%</p>`;


            forecastDisplay.appendChild(forecastItem);
        });

    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}


// Get daily forecast 
function getDailyForecast(list) {
    const daily = [];
    const today = new Date().getDate();

    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.getDate();

        if (day !== today && !daily.find(d => d.date === date.toDateString())) {
            daily.push({
                date: date.toDateString(),
                temp: Math.round(item.main.temp),
                wind: Math.round(item.wind.speed),
                humidity: item.main.humidity,
                icon: item.weather[0].main.toLowerCase(), 
                weather: item.weather[0].main
            });
        }
    });

    return daily.slice(0, 5); 
}



searchBox.addEventListener("input", showDropdown);

searchBtn.addEventListener("click", () => {
    const city = searchBox.value.trim();
    checkWeather(city);
    checkForecast(city);
    dropdown.classList.add("hidden");
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchBox.value.trim();
        checkWeather(city);
        checkForecast(city);
        dropdown.classList.add("hidden");
    }
});


document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !searchBox.contains(e.target)) {
        dropdown.classList.add("hidden");
    }
});
