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


const apiKey = "7426bb0b185caa9e43af0c947720560b";
const lang = "nl";
const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
const uitgeschrevenTemp = ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "elf", "twaalf", "dertien", "veertien", "vijftien", "zestien", "zeventien", "achttien", "negentien", "twintig", "eenentwintig", "tweeëntwintig", "drieëntwintig", "vierentwintig", "vijfentwintig", "zesentwintig", "zevenentwintig", "achtentwintig", "negenentwintig", "dertig", "eenendertig", "tweeëndertig", "drieëndertig", "vierendertig", "vijfendertig", "zesendertig", "zevenendertig", "achtendertig", "negenendertig", "veertig", "eenenveertig", "tweeënveertig", "drieënveertig", "vierenveertig", "vijfenveertig", "zesenveertig", "zevenenveertig", "achtenveertig", "negenenveertig", "vijftig"];
const quotes = ["quote1", "quote2", "quote3", "quote4", "quote5", "quote6", "quote7"]
const weatherReport = {};
weatherReport.current = {};
weatherReport.days = [];
let errorFlag = false;

function getClientLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCoordinates, showError);
        console.log(navigator.geolocation.getCurrentPosition)
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

            console.log(data)

            const fullDate = new Date(data.current.dt * 1000);
            const dayName = days[fullDate.getDay()];

            const day = {
                tempDay: uitgeschrevenTemp[Math.abs(Math.floor(Math.floor(data.current.temp)))],
                tempNight: null,
                description: data.current.weather[0].description,
                iconId: data.current.weather[0].icon,
                //fullDate: fullDate,
                dayName: dayName
            };
            weatherReport.days.push(day);



            //FORECAST
            const dailyForecast = data.daily;
            dailyForecast.forEach(function(e, index) {
                const fullDate = new Date(e.dt * 1000);
                const dayName = days[fullDate.getDay()];
                const day = {
                    tempDay: uitgeschrevenTemp[Math.abs(Math.floor(Math.floor(e.temp.day)))],
                    tempNight: uitgeschrevenTemp[Math.abs(Math.floor(Math.floor(e.temp.night)))],
                    description: e.weather[0].description,
                    iconId: e.weather[0].icon,
                    //fullDate: fullDate,
                    dayName: dayName
                };
                weatherReport.days.push(day);
            });
        })
        .then(function() {

            //indien aan elke promise wordt voldaan wordt de functie createHtmlContent() aangeroepen
            createHtmlContent();

        })
        .catch(error => {
            console.error(error);
            showError("Fout bij het ophalen van weergegevens");
            errorFlag = true;
        });
}

function createHtmlContent() {
    //de gegevens uit het object weatherReport worden in deze functie naar de HTML pagina verzonden.
    //onderstaande code is een voorbeeld, pas deze code aan volgens jouw ontwerp

    //indien geen foutmeldingen, verberg de footer
    //(!errorFlag) verkort alternatief voor (errorFlag === false)
    if (!errorFlag) {
        notificationElement.style.display = "none";
    }
    //CURRENT

    console.log(weatherReport)



    /*locationElement.textContent = weatherReport.locationName;
    tempDescElement.textContent = `Momenteel ${weatherReport.current.description}`;
    iconElement.src = `img/${weatherReport.current.iconId}.webm`;
    iconElement.alt = `Icoon ${weatherReport.current.description}`;
    //als temperatuur lager is dan 0 "min" toevoegen
    if (weatherReport.current.temp < 0) {
        tempElement.textContent = "min " + weatherReport.current.temp;
    } else {
        tempElement.textContent = weatherReport.current.temp;
    };*/

    //FORECAST
    weatherReport.days.forEach(function(e, index) {
        //toon maximaal 5 komende dagen // dag 0 -> vandaag niet tonen
        allowedDays = [0, 2, 3, 4, 5, 6];
        if (allowedDays.includes(index)) {

            const dagenWeer = `
            <div class="card-body" >
                <video src="img/${e.iconId}.webm" muted autoplay loop></video>
                <h2 class="dayName">${e.dayName}</h2>
                <div class="align-self-center weather-temp">
                    <span class="temperatuur">${e.tempDay}</span><br>
                    <span class="graden-celsius"> graden <br> celsius</span>
                </div>               
                <p class="quote">Dit is dus een fantastische quote die een top quote is met zonder een quote</p>
            </div>`;
            document.querySelector('.forecast').innerHTML += dagenWeer;
        }
    })

    /*//tabel cel voor afkorting dag
    const tdDayName = document.createElement("td");
    tdDayName.textContent = e.dayName;
    tdDayName.className = 'fw-bolder';
    forecastDays.appendChild(tdDayName);

    //tabel cel voor icoon
    const tdIcon = document.createElement("td");
    const imgIcon = document.createElement("img");
    imgIcon.src = `img/${e.iconId}.png`;
    imgIcon.className = 'img-fluid';
    imgIcon.alt = `icoon ${e.description}`;
    imgIcon.title = e.description; //opgelet title attribuut niet bruikbaar bij touchscreens
    tdIcon.appendChild(imgIcon);
    forecastIcons.appendChild(tdIcon);

    //tabel cel voor dag temperatuur
    const tdDayTemp = document.createElement("td");
    tdDayTemp.textContent = `${e.tempDay}`;
    tdDayTemp.title = 'Temperatuur overdag';
    forecastDayTemp.appendChild(tdDayTemp);

    //tabel cel voor nacht temperatuur
    const tdNightTemp = document.createElement("td");
    tdNightTemp.textContent = `${e.tempNight}`;
    tdNightTemp.className = 'text-muted';
    tdNightTemp.title = 'Temperatuur \'s nachts';
    forecastNightTemp.appendChild(tdNightTemp);*/
};