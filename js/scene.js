function initScene () {
  var material = new THREE.MeshPhongMaterial({ color: 0xff5533, specular: 0x111111, shininess: 200 });

  loadObject('/assets/daf-drone.stl');

  loadObject('/assets/daf-drone.stl');

  loadObject('/assets/daf-drone.stl');

  loadObject('/assets/daf-drone.stl');

  loadObject('/assets/daf-drone.stl');

  console.log(scene);
}

function loadObject (path) {
  var geometry = new THREE.Geometry();
  var loader = new THREE.STLLoader();

  loader.load(path, function (object) {
    object.computeBoundingSphere();
    object.computeBoundingBox();
    object.computeVertexNormals();
    object.center();

    var r = object.boundingSphere.radius;
    object.scale(1 / r, 1 / r, 1 / r);

    var attrib = object.getAttribute('position');

    if (attrib === undefined) {
      throw new Error('a given BufferGeometry object must have a position attribute.');
    }

    var positions = attrib.array;
    var vertices = [];
    for (var i = 0, n = positions.length; i < n; i += 3) {
      var x = positions[i];
      var y = positions[i + 1];
      var z = positions[i + 2];
      vertices.push(new THREE.Vector3(x, y, z));
    }
    var faces = [];
    for (var i = 0, n = vertices.length; i < n; i += 3) {
      faces.push(new THREE.Face3(i, i + 1, i + 2));
    }

    geometry.vertices = vertices;
    geometry.faces = faces;
    geometry.computeFaceNormals();
    geometry.mergeVertices();
    geometry.computeVertexNormals();
    var material = new THREE.MeshPhongMaterial({ color: 0xff5533, specular: 0x111111, shininess: 200 });
    var mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());

    mesh.scale.set(128.0, 128.0, 128.0);
    var a = Math.random() * Math.PI * 2.0;
    mesh.position.set(
      Math.cos(a) * 512.0,
      Math.random() * 512.0,
      Math.sin(a) * 512.0
    );

    mesh.rotation.set(
      (Math.random() - 0.5) * Math.PI * 2.0,
      (Math.random() - 0.5) * Math.PI * 2.0,
      (Math.random() - 0.5) * Math.PI * 2.0
    );

    scene.add(mesh);
  });

  return geometry;
}
