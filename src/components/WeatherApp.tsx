import { useState, useEffect } from "react";
import { FaDroplet, FaWind } from "react-icons/fa6";
import { BiSearch } from "react-icons/bi";
import RippleLoader from "./Loader";
import "./weather.css";

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    humidity: number;
    wind_kph: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

interface ForecastData {
  forecast: {
    forecastday: {
      date: string;
      day: {
        avgtemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }[];
  };
}

function WeatherApp() {
  const [city, setCity] = useState<string>("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (cityName: string) => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName}`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=3`;

    try {
      setLoading(true);
      setError(null);

      const weatherResponse = await fetch(currentWeatherUrl);
      if (!weatherResponse.ok) {
        throw new Error("City not found! Please Try Again.");
      }

      const weatherData: WeatherData = await weatherResponse.json();
      setWeatherData(weatherData);

      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) {
        throw new Error("Unable to fetch forecast data.");
      }
      const forecastData: ForecastData = await forecastResponse.json();
      setForecastData(forecastData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (city.trim() === "") {
      setError("Please enter a city.");
      setWeatherData(null);
      setForecastData(null);
      return;
    }
    setError(null);
    fetchWeatherData(city);
    setCity("");
  };

  useEffect(() => {
    const getUserLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
            const reverseGeocodeUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`;

            try {
              setLoading(true);
              const response = await fetch(reverseGeocodeUrl);
              if (!response.ok) {
                throw new Error("Unable to fetch location data.");
              }
              const data: WeatherData = await response.json();
              setWeatherData(data);
              setCity(data.location.name);
              await fetchWeatherData(data.location.name);
            } catch (error) {
              if (error instanceof Error) {
                setError(error.message);
              }
              setWeatherData(null);
              setForecastData(null);
            } finally {
              setLoading(false);
            }
          },
          () => {
            setError("Unable to retrieve your location.");
            setWeatherData(null);
            setForecastData(null);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
        setWeatherData(null);
        setForecastData(null);
      }
    };

    getUserLocation();
  }, []);

  return (
    <>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 className="main-heading" style={{ textAlign: "center", marginBottom: "15px", marginTop: "0" }}>
          Weather App - ReactTs + Tailwind
        </h1>
        <div className="container">
          <form className="search-bar" onSubmit={handleSubmit}>
            <div className="textfield">
              <input
                type="text"
                name="search"
                value={city}
                className="search-field"
                placeholder="Search City"
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="search-icon">
              <button className="search-btn" type="submit">
                <BiSearch size={18} />
              </button>
            </div>
          </form>

          {loading && (
            <div className="loader">
              <RippleLoader />
            </div>
          )}

          {error && <p>{error}</p>}

          {!error && weatherData && (
            <>
              <div className="weather-icon">
                <img
                  src={weatherData.current.condition.icon}
                  alt={weatherData.current.condition.text}
                  className="main-icon"
                />
              </div>

              <div className="temp">
                <p className="temp-text">
                  {Math.round(weatherData.current.temp_c)}°C
                </p>
              </div>

              <div className="location">
                <p className="city">{weatherData.location.name}</p>
              </div>

              <div className="wind-humidity">
                <div className="wind">
                  <div className="wind-icon">
                    <span className="w-icon">
                      <FaWind size={28} />
                    </span>
                  </div>
                  <div className="wind-data">
                    <p className="w-data">
                      {Math.round(weatherData.current.wind_kph)} Km/h
                    </p>
                    <p>Wind Speed</p>
                  </div>
                </div>
                <div className="humidity">
                  <div className="humidity-icon">
                    <span className="h-icon">
                      <FaDroplet size={25} />
                    </span>
                  </div>
                  <div className="humidity-data">
                    <p className="h-data">
                      {Math.round(weatherData.current.humidity)}%
                    </p>
                    <p>Humidity</p>
                  </div>
                </div>
              </div>
              <hr style={{ width: "300px", marginTop: "20px" }} />
              {forecastData && (
                <div className="forecast">
                  <span className="forecast-heading">
                    Forecast For Next 3 Days
                  </span>
                  <div className="forecast-data">
                    {forecastData.forecast.forecastday
                      .slice(0, 3)
                      .map((day) => (
                        <div key={day.date}>
                          <img
                            src={day.day.condition.icon}
                            alt={day.day.condition.text}
                          />

                          <p>{Math.round(day.day.avgtemp_c)}°C</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default WeatherApp;
