import boost from './boost.js';

export default function(profiles, locations, req, res) {
  locations.forEach((loc) => {
    boost.update(loc.id, loc.preference, profiles)
  });
  res.send();
}
