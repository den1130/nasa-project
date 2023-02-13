const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  })

  describe('Test GET/ launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
      .get('/v1/launches')
      .expect('Content-Type', /json/)
      .expect(200);
      // Alternative: expect(response.statusCode).toBe(200);
    });
  });
  
  describe('Test POST/ launches', () => {
    const completeLaunchData = {
      launchDate: 'January 1, 2030',
      mission: 'WT 1',
      rocket: 'Mavs',
      target: 'Kepler-62 f'
    };
  
    const launchDataWithoutDate = {
      mission: 'WT 1',
      rocket: 'Mavs',
      target: 'Kepler-62 f'
    };
  
    const wrongDateLaunchData = {
      launchDate: 'hello',
      mission: 'WT 1',
      rocket: 'Mavs',
      target: 'Kepler-62 f'
    };
  
    test('It should respond with 201 created', async () => {
      const response = await request(app)
      .post('/v1/launches')
      .send(completeLaunchData)
      .expect('Content-Type', /json/)
      .expect(201);
  
      const reqDate = new Date(completeLaunchData.launchDate).valueOf();
      const resDate = new Date(response.body.launchDate).valueOf();
      expect(reqDate).toBe(resDate);
  
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });
  
    test('It should catch missing required properties', async () => {
      const response = await request(app)
      .post('/v1/launches')
      .send(launchDataWithoutDate)
      .expect('Content-Type', /json/)
      .expect(400);
  
      expect(response.body).toStrictEqual({
        error: 'Missing required launch property'
      });
    });
  
    test('It should catch invalid date ', async () => {
      const response = await request(app)
      .post('/v1/launches')
      .send(wrongDateLaunchData)
      .expect('Content-Type', /json/)
      .expect(400);
  
      expect(response.body).toStrictEqual({
        error: 'Incorrect date'
      });
    });
  });
});


