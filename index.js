const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.planplus.rs/subotica/ulice';

const setAllStreets = async () => {
  const data = fs.readFileSync('output.json');
  const streets = JSON.parse(data);
  // Potrebno je da se unese Google maps API key, da bi moglo da se pristupi apiju
  const GOOGLE_MAPS_API_KEY = '';

  const newArr = await Promise.all(
    streets.map(async (street) => {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${street.streetName},Subotica&key=${GOOGLE_MAPS_API_KEY}`
      );
      const dataCoords = response.data;
      return {
        place_id: dataCoords.results[0].place_id,
        streetName: street.streetName,
        coordinates: dataCoords.results[0].geometry.location,
      };
    })
  );

  const outputData = { newArr };
  console.log('Output', outputData);
  const jsonData = JSON.stringify(outputData, null, 2);
  fs.writeFileSync('finalOutput.json', jsonData);

  console.log('DONE');
};

const getAllStreets = async () => {
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const streets = [];
    $('a').each((index, element) => {
      streets.push($(element).text());
    });

    streets.splice(0, 15);
    streets.splice(-18, 18);

    console.log('Streets:');
    streets.forEach((street) => {
      console.log(street);
    });

    const newArr = streets.map((street) => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        streetName: street,
      };
    });

    const outputData = { newArr };
    const jsonData = JSON.stringify(outputData, null, 2);
    fs.writeFileSync('output.json', jsonData);
    console.log('Data exported to output.json');
  } catch (error) {
    console.error('Error:', error);
  }
};

getAllStreets();
// setAllStreets();
