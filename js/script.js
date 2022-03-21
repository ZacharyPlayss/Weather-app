// STAP 1 -> html elementen selecteren

const locationElement = document.querySelector(".location");
const tempDescElement = document.querySelector(".weather-description");
const iconElement = document.querySelector(".weather-icon video");
const tempElement = document.querySelector(".weather-temp span");
const notificationElement = document.querySelector(".card-footer");
const forecastDays = document.querySelector(".fc-dayAbbr");
const forecastIcons = document.querySelector(".fc-icons");
const forecastDayTemp = document.querySelector(".fc-dayTemp");
const forecastNightTemp = document.querySelector(".fc-nightTemp");
const root = document.querySelector(':root');
const dots = document.querySelector(".dotsContainer");
const forecast = document.querySelector(".forecast");


const apiKey = "7426bb0b185caa9e43af0c947720560b";
const lang = "nl";
const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
const uitgeschrevenTemp = ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "elf", "twaalf", "dertien", "veertien", "vijftien", "zestien", "zeventien", "achttien", "negentien", "twintig", "eenentwintig", "tweeëntwintig", "drieëntwintig", "vierentwintig", "vijfentwintig", "zesentwintig", "zevenentwintig", "achtentwintig", "negenentwintig", "dertig", "eenendertig", "tweeëndertig", "drieëndertig", "vierendertig", "vijfendertig", "zesendertig", "zevenendertig", "achtendertig", "negenendertig", "veertig", "eenenveertig", "tweeënveertig", "drieënveertig", "vierenveertig", "vijfenveertig", "zesenveertig", "zevenenveertig", "achtenveertig", "negenenveertig", "vijftig"];

const quotes = ["De beste manier om je zondag te verpesten... Beseffen dat het morgen weer maandag is ", "Maandag, Checklist: Koffie, koffie en... Koffie!", "Er is niets dat je vrijdag zo verpest dan het besef dat het nog maar dinsdag is.", "Woensdag is als een mini vrijdag.", "Donderdag we kunnen het weekend BIJNA zien!", "Vrijdag tijd om van je to do lijstje een toedeloe lijstje te maken.", "Zaterdag... Vrijdag voelt als 5 minuten geleden."]
const weatherReport = {};
weatherReport.current = {};
weatherReport.days = [];
let errorFlag = false;

function getClientLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCoordinates, showError);
    } else {
        showError("Geolocatie niet ondersteunt door browser");
        errorFlag = true;
    }
};
// bovenstaande functie getClientLocation() aanroepen (kan ook verkort)
getClientLocation();

// positie van de bezoeker bepalen
function getCoordinates(position) {
    //position = object met coördinaten van getCurrentPosition methode
    //console.log(position);
    //opgevraagde breedtegraad in variabele stoppen
    const latitude = position.coords.latitude;
    //opgevraagde lengtegraad in variabele stoppen
    const longitude = position.coords.longitude;

    //Nu we de coördinaten hebben, API openweathermap.org aanroepen met functie getWeather() en coördinaten als parameters
    getLocationName(latitude, longitude);

}

// foutmelding van getCurrentPosition() methode weergeven in html
function showError(error) {
    if (typeof(error) === "string") {
        notificationElement.textContent = error;
    } else {
        notificationElement.textContent = error.message;
    }
    notificationElement.style.display = "block";
}

// STAP 5 -> functie getLocationName() aanmaken die API openweathermap.org aanroept met coördinaten als parameters
// om gegevens over de locatie van de bezoeker op te halen.

//optie 1 locatie naam ophalen via openweathermap
function getLocationName(latitude, longitude) {
    const api = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
    fetch(api)
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            //console.log(data[0].local_names[lang]);
            weatherReport.locationName = data[0].local_names[lang];

            //Weergegevens ophalen op basis breedte- en lengtegraad
            getWeather(latitude, longitude);

        })
        .catch(error => {
            console.error(error);
            showError("Fout bij het ophalen van locatiegegevens");
            errorFlag = true;
        });

}

function getWeather(latitude, longitude) {
    showError("Weergegevens worden opgehaald...");


    const api = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&lang=${lang}&units=metric&exclude=minutely,hourly,alerts&appid=${apiKey}`;

    fetch(api)
        .then(response => response.json())
        .then(data => {
            /*weatherReport.current = {
                //vervangen nummer met tekst versie van afgerond icoon
                temp: uitgeschrevenTemp[Math.abs(Math.floor(data.current.temp))],
                description: data.current.weather[0].description,
                iconId: data.current.weather[0].icon
            };*/
            const fullDate = new Date(data.current.dt * 1000);
            const dayName = days[fullDate.getDay()];
            const quoteOfTheDay = quotes[fullDate.getDay()];
            const fullTemp = Math.floor(data.current.temp);
            const day = {
                tempDay: uitgeschrevenTemp[Math.abs(Math.floor(Math.floor(data.current.temp)))],
                nrTemp: Math.floor(data.current.temp),
                tempNight: null,
                description: data.current.weather[0].description,
                iconId: data.current.weather[0].icon,
                //fullDate: fullDate,
                dayName: dayName,
                quote: quoteOfTheDay
            };
            weatherReport.days.push(day);


            //FORECAST
            const dailyForecast = data.daily;
            dailyForecast.forEach(function(e, index) {
                const fullDate = new Date(e.dt * 1000);
                const dayName = days[fullDate.getDay()];
                const quoteOfTheDay = quotes[fullDate.getDay()];
                const day = {
                    tempDay: uitgeschrevenTemp[Math.abs(Math.floor(Math.floor(e.temp.day)))],
                    nrTemp: Math.floor(e.temp.day),
                    tempNight: uitgeschrevenTemp[Math.abs(Math.floor(Math.floor(e.temp.night)))],
                    description: e.weather[0].description,
                    iconId: e.weather[0].icon,
                    //fullDate: fullDate,
                    dayName: dayName,
                    quote: quoteOfTheDay
                };
                weatherReport.days.push(day);
            });
        })
        .then(function() {
            createHtmlContent();

        })
        .catch(error => {
            console.error(error);
            showError("Fout bij het ophalen van weergegevens");
            errorFlag = true;
        });
}

function createHtmlContent() {
    if (!errorFlag) {
        notificationElement.style.display = "none";
    }
    //CURRENT
    //console.log(weatherReport)
        //FORECAST
            let id = 0;
    weatherReport.days.forEach(function (e, index) {
        //aanpassingen kleurtjes naargelang de temperatuur.
            function Classes() {
                if (e.nrTemp < 11) {
                    return "blue"
                } else if (e.nrTemp > 0) {
                    return "lightBlue"
                } else {
                    return "orange"
                }
            };
        //min toevoegen wanneer het kleiner is dan 0 graden.
            if (e.nrTemp < 0) {
                e.tempDay = "min" + e.tempDay;
            }
            else {
                e.tempDay = e.tempDay;
            }

        //toon maximaal 5 komende dagen // dag 0 -> vandaag niet tonen
        allowedDays = [0, 2, 3, 4, 5, 6];
        if (allowedDays.includes(index)) {
            
            const dagenWeer = `
            <div id="${index}"class="card-body ${Classes()}" >
                <video src="img/${e.iconId}.webm" muted playsinline autoplay loop></video>
                <h2 class="dayName">${e.dayName}</h2>
                <div class="align-self-center weather-temp">
                    <span class="temperatuur">${e.tempDay}</span><br>
                    <span class="graden-celsius"> graden <br> celsius</span>
                </div>             
                <p class="quote">${e.quote}</p>
            </div>`;
            forecast.innerHTML += dagenWeer;

            const dot = `<div class="dot" data-dot="${index}"></div>`;
            dots.innerHTML += dot;
            

            
            /*Controleren welk element de scrollbar bevat.
            console.log(document.querySelector("body").scrollWidth > document.querySelector("body").clientWidth);*/
        }
    })
};

dots.addEventListener('click', (e) => {
    console.log(e.target.dataset.dot);
});