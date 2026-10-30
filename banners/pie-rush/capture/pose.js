(() => {
  const s = game.state;
  const [red, blue] = s.players;
  red.x = 15.5; red.z = 20.5; blue.x = 17.5; blue.z = 21.5;
  red.facing = +window.RF; blue.facing = +window.BF;
  let id = 90000;
  red.carrying = Array.from({ length: 16 }, () => ({ kind: 'pie', slot: -1, id: id++ }));
  blue.carrying = Array.from({ length: 22 }, (_, i) => ({ kind: i % 4 ? 'apple' : 'pie', slot: -1, id: id++ }));
})()
