import data from './mock.js';
import boost from './boost';
import Promise from 'bluebird';

export default function(body, req, res) {
  let location = body.location;
  let profiles = body.profile;

  new Promise((resolve, reject) => {
    resolve(data);
  }).then((locations) => {
    let prediction = boost.predict(locations.map(loc => loc.id), profiles);
    console.log(prediction);
    let maxRating = locations.reduce((max, loc) => (loc.rating > max) ? loc.rating : max, 0);
    res.send(locations.map((location) => {
      if (prediction[location.id]) {
        location.preference = Math.round(prediction[location.id]);
      } else {
        location.preference = Math.round((location.rating / maxRating) * 3) - 1;
      }
      return location;
    }).sort((locA, locB) => locB.preference - locA.preference).map(loc => {
      loc.preference = Math.round(loc.preference);
      return loc;
    }))
  });
}
