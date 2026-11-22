# IndiaWeather — 10-Day Forecast

A responsive weather forecast app built with **Next.js App Router**, **TypeScript**, and **Open-Meteo**. It is ready to deploy on Vercel and does not require an API key.

## Features

- 10-day forecast for cities across India
- Searchable city list with 30 popular Indian cities
- Current temperature, feels-like temperature, humidity and wind
- Daily high/low temperatures and precipitation totals
- Responsive desktop and mobile layout
- Server-side API route so the browser does not call the weather provider directly
- Caching to reduce repeat API requests

## Run locally

1. Install Node.js 20 or newer.
2. Extract this ZIP and open the project folder in a terminal.
3. Install packages:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

No `.env` file or API key is needed.

## Deploy to GitHub and Vercel

1. Create a new repository on GitHub.
2. Push the contents of this folder to that repository:

   ```bash
   git init
   git add .
   git commit -m "Initial India weather forecast app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

3. Sign in to [Vercel](https://vercel.com), choose **Add New → Project**, and import your GitHub repository.
4. Keep the detected framework as **Next.js** and click **Deploy**.
5. Vercel will build and host the app. Future pushes to the connected branch trigger deployments automatically.

## Weather data

Forecasts are supplied by [Open-Meteo](https://open-meteo.com/), using its Geocoding API and Forecast API. The app requests 10 forecast days and uses the city’s detected timezone. Review Open-Meteo's current terms and attribution requirements before public or commercial use.

## Add more cities

Edit the `CITIES` array near the top of `app/page.tsx`. Add city names as strings. The API route filters geocoding results to India.

## Project structure

```text
app/
  api/weather/route.ts   # Server-side city lookup and forecast endpoint
  globals.css            # Responsive styling
  layout.tsx             # App metadata and root layout
  page.tsx               # Weather dashboard UI
```
