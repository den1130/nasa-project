const {
  getAllLaunches,
  scheduleNewLaunch,
  existLaunchWithId,
  abortLaunchById,
} = require('../../models/launches.model');

const {
  getPagination
} = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (!launch.launchDate || !launch.mission || !launch.rocket
    || !launch.target) {
      return res.status(400).json({
        error: 'Missing required launch property',
      })
    }
  
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
      return res.status(400).json({
        error: 'Incorrect date',
      })
  }

  scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunchById(req, res) {
  const launchId = Number(req.params.id);
  const existId = await existLaunchWithId(launchId);

  if (!existId) {
    return res.status(404).json({
      error: 'Launch not found.'
    });  
  }

  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    })
  } else {
    return res.status(200).json({
      ok: true,
    });
  }
}


module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunchById,
}