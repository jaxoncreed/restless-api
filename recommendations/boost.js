
class Boost {
  constructor() {
    this.locations = {};
  }
  update(locationId, rating, profiles) {
    if (!this.locations[locationId]) {
      this.locations[locationId] = {};
    }
    profiles.forEach((profile) => {
      if (this.locations[locationId][profile]) {
        let loc = this.locations[locationId][profile];
        this.locations[locationId][profile] = {
          num: loc.num + 1,
          avg: (loc.avg * loc.num + rating) / loc.num + 1
        }
      } else {
        this.locations[locationId][profile] = {
          num: 1,
          avg: rating
        }
      }
    })
    console.log(this.locations)
  }
  predict (locationsIds, profiles) {
    let locMap = {};
    locationsIds.forEach((id) => {
      if (this.locations[id]) {
        let sum = 0;
        let total = 0;
        profiles.forEach((profile) => {
          if (this.locations[id][profile]) {
            total++;
            sum += this.locations[id][profile].avg;
          }
        });
        console.log(sum)
        console.log(total)
        locMap[id] = sum / total;
      }
    });
    return locMap;
  }
}

const boost = new Boost();

export default boost;
