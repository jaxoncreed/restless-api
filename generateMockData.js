
function randomBetween(a, b) {
  return Math.floor(Math.random() * b) + a;
}

let items = [];
for (let i = 0; i < 100; i++) {
  items.push({
    id: i + 'id',
    title: 'item' + i,
    rating: randomBetween(1, 5),
    cost: randomBetween(5, 200),
    duration: randomBetween(1, 16),
    open: randomBetween(0, 48),
    close: randomBetween(48, 96),
    note: "some string"
  })
}
console.log(items);
