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

const crypto = require('crypto'); // Built-in Node.js security module

app.command("/slacky-password", async ({ ack, respond }) => {
    await ack();

    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const passwordLength = 14;
    let password = "";

    // Generate cryptographically secure random indices
    for (let i = 0; i < passwordLength; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
    }

    await respond({ text: `🔒 Here is your secure password:\n\`${password}\`` });
});


app.command("/slacky-challenge", async ({ command, ack, respond }) => {
    await ack();

    const difficulty = command.text ? command.text.trim().toLowerCase() : "easy";

    const challenges = {
        easy: [
            "💧 **Hydration:** Step away, drink a full glass of water right now, and take 3 deep breaths.",
            "🚶 **Stretch:** Stand up, touch your toes, and roll your shoulders back 5 times.",
            "🧹 **Quick Clean:** Clear one single item off your physical desk or clean out 3 old notifications on your phone.",
            "🍏 **Snack Break:** Grab a piece of fruit or a healthy snack before you continue what you're doing."
        ],
        medium: [
            "🧠 **Brain Teaser:** Stand up and walk away from your screen for 10 minutes without looking at your phone.",
            "🎵 **Audio Refresh:** Put on your absolute favorite song, close your eyes, and just listen to it all the way through.",
            "📝 **Mind Dump:** Grab a piece of paper and write down everything floating around in your head for 5 minutes.",
            "📚 **Micro-Learn:** Read a Wikipedia page about a completely random historical event or scientific topic."
        ],
        hard: [
            "🏃 **Physical Reset:** Do a 15-minute bodyweight workout or go for a brisk walk outside with zero screens.",
            "📵 **Digital Fast:** Put your phone in another room and don't touch it for a full hour while you work or read.",
            "🍳 **Life Skill:** Cook or prepare a fresh meal from scratch instead of ordering takeout or eating instant food.",
            "🧘 **Focus Sprint:** Do a 25-minute deep work session with zero interruptions, browser tabs closed, and notifications off."
        ]
    };

    const selectedList = challenges[difficulty] || challenges.easy;
    const randomChallenge = selectedList[Math.floor(Math.random() * selectedList.length)];

    await respond({ text: `🎯 **Life Challenge [Tier: ${difficulty.toUpperCase()}]**:\n\n${randomChallenge}` });
});














































































(async () => {
  await app.start();
  console.log("bot is running!");
})();
