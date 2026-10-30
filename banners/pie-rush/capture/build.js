(() => {
  const s = game.state;
  s.players.forEach(p => p.money = 1e7);
  let ovens = 0, belts = 0;
  for (const spot of s.island.ovenSpots) if (game.buildOven(spot, 0)) ovens++;
  for (const [i, dir] of s.island.beltPaths) { const x = i % 60, z = Math.floor(i / 60); if (game.placeBelt(x, z, dir, 0)) belts++; }
  s.players.forEach(p => p.money = 2480);
  console.log('[shot]', JSON.stringify({ ovens, belts, size: 60, trees: s.island.trees.length, shop: s.island.shop, ovenSpots: s.island.ovenSpots.map(o => [o.x, o.z]) }));
})()
