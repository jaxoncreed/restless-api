import express from 'express';
import bodyParser from 'body-parser';
import findTrips from './findTrips/findTrips';
import getRecommendations from './recommendations/getRecommendations';
import setRecommendations from './recommendations/setRecommendations';

let app = express();

app.use(bodyParser.json());

app.post('/findtrips', (req, res) => {
  findTrips(req.body, req, res);
});
app.get('/recommendations', (req, res) => {
  getRecommendations(req.query, req, res);
});
app.post('/recommendations', (req, res) => {
  setRecommendations(req.query.profile, req.body, req, res)
});

app.listen('3001', () => {
  console.log('listening on 3001')
})
