import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GeoResult = { name: string; country: string; latitude: number; longitude: number; timezone?: string };
type OpenMeteoResponse = {
  current: { temperature_2m: number; apparent_temperature: number; weather_code: number; wind_speed_10m: number; relative_humidity_2m: number };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    relative_humidity_2m_mean: number[];
  };
  timezone: string;
};

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim();
  if (!city || city.length > 80) {
    return NextResponse.json({ error: "Please provide a valid city name." }, { status: 400 });
  }

  try {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.search = new URLSearchParams({ name: city, count: "10", language: "en", format: "json" }).toString();
    const geoResponse = await fetch(geoUrl, { next: { revalidate: 86400 } });
    if (!geoResponse.ok) throw new Error("City lookup service is unavailable.");
    const geoData = await geoResponse.json();
    const match = (geoData.results as GeoResult[] | undefined)?.find(
      (place) => place.country === "India" && place.name.toLowerCase() === city.toLowerCase()
    ) ?? (geoData.results as GeoResult[] | undefined)?.find((place) => place.country === "India");

    if (!match) return NextResponse.json({ error: `We couldn't find ${city} in India. Try another city.` }, { status: 404 });

    const params = new URLSearchParams({
      latitude: String(match.latitude),
      longitude: String(match.longitude),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean",
      forecast_days: "10",
      timezone: "auto"
    });
    const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { next: { revalidate: 1800 } });
    if (!forecastResponse.ok) throw new Error("Weather forecast service is unavailable.");
    const forecast = await forecastResponse.json() as OpenMeteoResponse;

    return NextResponse.json({
      city: match.name,
      country: match.country,
      latitude: match.latitude,
      longitude: match.longitude,
      timezone: forecast.timezone,
      current: {
        temperature: forecast.current.temperature_2m,
        apparentTemperature: forecast.current.apparent_temperature,
        weatherCode: forecast.current.weather_code,
        windSpeed: forecast.current.wind_speed_10m,
        humidity: forecast.current.relative_humidity_2m
      },
      daily: forecast.daily.time.map((date, index) => ({
        date,
        weatherCode: forecast.daily.weather_code[index],
        maxTemp: forecast.daily.temperature_2m_max[index],
        minTemp: forecast.daily.temperature_2m_min[index],
        precipitation: forecast.daily.precipitation_sum[index],
        windSpeed: forecast.daily.wind_speed_10m_max[index],
        humidity: forecast.daily.relative_humidity_2m_mean[index]
      }))
    }, { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" } });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json({ error: "Unable to retrieve weather right now. Please try again shortly." }, { status: 502 });
  }
}
