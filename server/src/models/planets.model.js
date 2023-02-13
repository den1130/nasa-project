const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const planets = require('./planets.mongo');

// Critiria for a habitable planet
function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

// Load planets data from csv file
function loadPlanetsData() {
  planetsList = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../../data/kepler_data.csv'))
      .pipe(parse({
        comment: '#',
        columns: true,
      }))
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data,  planetsList);
        }
      })
      .on('error', (err) => {
        console.log(err); 
        reject(err);
      })
      .on('end', async () => {
        await Promise.all(planetsList);
        const habitablePlanets = await getAllPlanets();
        console.log(`${habitablePlanets.length} habitable planets found!`);
        resolve();
      });
  });
}

// Get all habitable planets without mongo tags
async function getAllPlanets() {
  return await planets.find({}, {
    '_id': 0, '__v': 0,
  });
}

// Save a planet data
async function savePlanet(planet, planetsList) {
  // insert + update = upsert
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name,
    }, {
      keplerName: planet.kepler_name,  // returned field
    }, {
      upsert: true,
    });
  } catch(err) {
    console.error(`Could not save planet ${err}`);
  }
}

module.exports = {
  getAllPlanets,
  loadPlanetsData,
}