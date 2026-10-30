(() => {
  const r = game.renderer, orig = r.render.bind(r), T = game.THREE;
  const target = new T.Vector3(+window.CX, 0, +window.CZ);
  r.render = (scene, cam) => { cam.position.set(target.x + +window.OX, +window.OY, target.z + +window.OZ); cam.lookAt(target); orig(scene, cam); };
})()
