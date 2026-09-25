const axios = require("axios");
require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/slacky-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});


app.command("/slacky-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/slacky-weather", async ({ command, ack, respond }) => {
    await ack();

    // Get the city name the user typed after the command (e.g., "Tokyo")
    const city = command.text.trim();

    if (!city) {
        await respond({ text: "Please provide a city name! Example: `/slacky-weather Paris`" });
        return;
    }

    try {
        // Step 1: Convert the city name into latitude and longitude using Open-Meteo's geocoding API
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`);
        
        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            await respond({ text: `Sorry, I couldn't find a city named "${city}".` });
            return;
        }

        const location = geoResponse.data.results[0];
        const { latitude, longitude, name, country } = location;

        // Step 2: Fetch the weather using those coordinates
        const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`);
        
        const temp = weatherResponse.data.current.temperature_2m;
        const wind = weatherResponse.data.current.wind_speed_10m;

        // Step 3: Respond to Slack with the global weather results
        await respond({ 
            text: `Weather for *${name}, ${country || ""}*:\nTemperature: ${temp}°C\nWind Speed: ${wind} km/h` 
        });

    } catch (err) {
        await respond({ text: "Failed to fetch the weather forecast right now." });
    }
});

app.command("/slacky-day", async ({ command, ack, respond }) => {
    await ack();

    const inputDate = command.text ? command.text.trim() : "";

    if (!inputDate) {
        await respond({ text: "Please provide a date! Example: `/slacky-day 2026-12-25` (Format: YYYY-MM-DD)" });
        return;
    }

    try {
        // Create a date object from the user's input
        const dateObj = new Date(inputDate);

        // Check if the user typed a valid date
        if (isNaN(dateObj.getTime())) {
            await respond({ text: `Invalid date format: "${inputDate}". Please use YYYY-MM-DD format.` });
            return;
        }

        // List of days to translate number to text name
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = daysOfWeek[dateObj.getDay()];

        await respond({ text: `The date *${inputDate}* was/is a *${dayName}*! 📅` });

    } catch (err) {
        await respond({ text: "Oops! Something went wrong while calculating the day." });
    }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();
