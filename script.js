const API_KEY = '17f28bbcc146765155c4ae06bfe70f8c'

document.getElementById('find').addEventListener('click', () => {
    const city = document.getElementById('city').value.trim();
    if (city) {
        getCurrentWeather(city);
        getForecastWeather(city);
    } else {
        alert('Wpisz nazwę miasta');
    }
});

function getCurrentWeather(city){
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;
    
    const req_xml = new XMLHttpRequest();

    req_xml.open('GET', url, true);

    req_xml.addEventListener('load', () => {
        const data = JSON.parse(req_xml.responseText);
        console.log('Current Weather Data (XMLHttpRequest):', data);
        displayCurrentWeather(data);
    });
    req_xml.send();
}
function displayCurrentWeather(data){
    document.getElementById('weather').innerHTML = `
        <h2>Pogoda w ${data.name}, ${data.sys.country}</h2>
        <p>Temperatura: ${data.main.temp} &deg; C</p>
        <p>Temperatura odczuwalna: ${data.main.feels_like} &deg; C</p>
        <p>Opis pogody: ${data.weather[0].description}</p>
        <img id="icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Ikona pogody">
    `;
}

function getForecastWeather(city){
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;

    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log('Forecast Weather Data (Fetch):', data);
            displayForecastWeather(data);
        })
}

function displayForecastWeather(data){
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '<h2>Prognoza pogody w na 5 dni:</h2>';

    for(const item of data.list){
        const div = document.createElement('div');
        div.className = 'forecast-item';

        div.innerHTML = `
            <h2>Pogoda na dzień ${item.dt_txt}</h2>
            <p>Temperatura: ${item.main.temp} &deg; C</p>
            <p>Temperatura odczuwalna: ${item.main.feels_like} &deg; C</p>
            <p>Opis pogody: ${item.weather[0].description}</p>
            <img id="icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Ikona pogody">
        `;
                forecastDiv.appendChild(div);
    }
}
