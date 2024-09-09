const apiKey = "027ff9fcc2838f537e5ba3ad009f9b4a";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.getElementById("searchbar");
const searchBtn = document.getElementById("searchBtn");
const weatherIcon = document.querySelector(".weather-icon");
const dropdown = document.getElementById("dropdown");
const errorDisplay = document.querySelector(".error");
const weatherDisplay = document.querySelector(".weather");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

function updateDropdown() {
    const dropdownList = dropdown.querySelector("ul");
    dropdownList.innerHTML = "";
    recentCities.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        li.classList.add("p-2", "cursor-pointer", "hover:bg-gray-200", "rounded");
        li.addEventListener("click", () => {
            searchBox.value = city;
            checkWeather(city);
        });
        dropdownList.appendChild(li);
    });
    dropdown.style.display = recentCities.length ? "block" : "none";
}

async function checkWeather(city) {
    if (!city) {
        errorDisplay.textContent = "Please enter a city name.";
        errorDisplay.classList.remove("hidden");
        weatherDisplay.classList.add("hidden");
        return;
    }

    try {
        const response = await fetch(apiURL + city + `&appid=${apiKey}`);

        if (!response.ok) {
            throw new Error("Invalid city name");
        }

        const data = await response.json();

        // Update UI with weather data
        document.querySelector(".city").textContent = data.name;
        document.querySelector(".temp").textContent = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").textContent = data.main.humidity + "%";
        document.querySelector(".wind").textContent = data.wind.speed + " km/h";

        const weatherMain = data.weather[0].main;
        weatherIcon.src = `images/${weatherMain.toLowerCase()}.png` || "images/clear.png";

        weatherDisplay.classList.remove("hidden");
        errorDisplay.classList.add("hidden");

        // Update recent cities
        if (!recentCities.includes(city)) {
            recentCities.unshift(city);
            if (recentCities.length > 5) recentCities.pop(); // Limit to 5 recent cities
            localStorage.setItem("recentCities", JSON.stringify(recentCities));
        }
        updateDropdown();

    } catch (error) {
        errorDisplay.textContent = error.message;
        errorDisplay.classList.remove("hidden");
        weatherDisplay.classList.add("hidden");
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value.trim());
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        checkWeather(searchBox.value.trim());
    }
});

// Initial dropdown update
updateDropdown();
