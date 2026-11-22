 "use client";

import { useEffect, useMemo, useState } from "react";
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, MapPin, Search, Sun, Wind, Droplets, RefreshCw, CalendarDays } from "lucide-react";

type Day = {
  date: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  windSpeed: number;
  humidity: number | null;
};
type WeatherResponse = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: { temperature: number; apparentTemperature: number; weatherCode: number; windSpeed: number; humidity: number };
  daily: Day[];
};

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kochi", "Goa",
  "Nagpur", "Indore", "Bhopal", "Chandigarh", "Dehradun", "Srinagar",
  "Shimla", "Guwahati", "Bhubaneswar", "Patna", "Varanasi", "Mysuru",
  "Thiruvananthapuram", "Visakhapatnam", "Surat", "Nashik", "Amritsar", "Ranchi"
];

function weatherInfo(code: number) {
  if (code === 0) return { label: "Clear sky", Icon: Sun };
  if ([1, 2].includes(code)) return { label: code === 1 ? "Mainly clear" : "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if ([45, 48].includes(code)) return { label: "Fog", Icon: CloudFog };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", Icon: CloudDrizzle };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: "Rain", Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", Icon: CloudSnow };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", Icon: CloudLightning };
  return { label: "Mixed conditions", Icon: Cloud };
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", options).format(new Date(`${date}T12:00:00`));
}

export default function Home() {
  const [city, setCity] = useState("Mumbai");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWeather(selectedCity: string) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(selectedCity)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load weather.");
      setData(result);
      setCity(selectedCity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadWeather("Mumbai"); }, []);

  const filteredCities = useMemo(
    () => CITIES.filter((name) => name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const today = data?.daily[0];
  const todayInfo = today ? weatherInfo(today.weatherCode) : null;
  const TodayIcon = todayInfo?.Icon ?? CloudSun;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark"><CloudSun size={22} /></span><span>India<span className="brand-light">Weather</span></span></a>
        <div className="live-label"><span className="live-dot" /> 10-day forecast</div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">WEATHER AT A GLANCE</p>
          <h1>Plan your days<br /><span>with confidence.</span></h1>
          <p className="intro-copy">Reliable 10-day weather forecasts for cities across India.</p>
        </div>
        <div className="intro-art"><div className="sun-orb" /><CloudSun size={112} strokeWidth={1.15} /></div>
      </section>

      <section className="search-panel">
        <div className="search-heading"><div><p className="eyebrow">EXPLORE A CITY</p><h2>Where would you like to go?</h2></div><span className="country-tag"><MapPin size={14} /> India</span></div>
        <div className="search-box"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search an Indian city..." aria-label="Search cities" /><span className="search-hint">CITY</span></div>
        <div className="city-list">
          {filteredCities.slice(0, 18).map((name) => <button key={name} onClick={() => { setSearch(""); void loadWeather(name); }} className={`city-chip ${city === name ? "selected" : ""}`}>{name}</button>)}
          {filteredCities.length === 0 && <span className="no-cities">No matching city. Try another name.</span>}
        </div>
      </section>

      {error && <div className="error-banner">{error} <button onClick={() => void loadWeather(city)}>Try again</button></div>}

      {loading ? <div className="loading-card"><span className="loader" /> Loading forecast for {city}...</div> : data && today && todayInfo && (
        <>
          <section className="current-card">
            <div className="current-main">
              <div className="current-location"><MapPin size={16} /> {data.city}, India</div>
              <div className="current-temp">{Math.round(data.current.temperature)}<span>°C</span></div>
              <div className="feels-like">Feels like {Math.round(data.current.apparentTemperature)}°C</div>
              <div className="condition">{todayInfo.label}</div>
            </div>
            <div className="current-icon"><TodayIcon size={108} strokeWidth={1.1} /></div>
            <div className="current-stats">
              <div><Wind /><span>Wind</span><strong>{Math.round(data.current.windSpeed)} <small>km/h</small></strong></div>
              <div><Droplets /><span>Humidity</span><strong>{data.current.humidity}<small>%</small></strong></div>
              <div><CloudRain /><span>Rain chance</span><strong>{Math.round(today.precipitation)}<small> mm</small></strong></div>
            </div>
          </section>

          <section className="forecast-section">
            <div className="section-heading"><div><p className="eyebrow">LOOK AHEAD</p><h2>10-day forecast</h2><p className="section-subtitle">Daily conditions for {data.city}</p></div><div className="updated"><CalendarDays size={16} /> {formatDate(today.date, { day: "numeric", month: "short", year: "numeric" })}</div></div>
            <div className="forecast-grid">
              {data.daily.map((day, index) => {
                const info = weatherInfo(day.weatherCode);
                const Icon = info.Icon;
                return <article className={`forecast-day ${index === 0 ? "today" : ""}`} key={day.date}>
                  <span className="day-name">{index === 0 ? "Today" : formatDate(day.date, { weekday: "short" })}</span>
                  <span className="day-date">{formatDate(day.date, { day: "numeric", month: "short" })}</span>
                  <Icon className="day-icon" size={30} strokeWidth={1.5} />
                  <span className="day-condition">{info.label}</span>
                  <div className="temperatures"><strong>{Math.round(day.maxTemp)}°</strong><span>{Math.round(day.minTemp)}°</span></div>
                  <div className="rain-line"><Droplets size={12} /> {Math.round(day.precipitation)} mm</div>
                </article>;
              })}
            </div>
          </section>
          <div className="footnote"><span>Weather data by Open-Meteo</span><button className="refresh-button" onClick={() => void loadWeather(city)}><RefreshCw size={14} /> Refresh forecast</button></div>
        </>
      )}
      <footer>Made for exploring India, one forecast at a time. <span>Temperatures shown in °C</span></footer>
    </main>
  );
}
