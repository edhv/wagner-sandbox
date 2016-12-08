WAGNER.vertexShadersPath = '/js/wagner/vertex-shaders';
WAGNER.fragmentShadersPath = '/js/wagner/fragment-shaders';
WAGNER.assetsPath = '../assets/';

var dofPass;
var gui;
var depthTexture;

var container, renderer, scene, camera, torus, material, fov = 70;
var model, quad, oculusEffect;
var light, composer;
var controls;

var c = document.body;

window.addEventListener('load', function () {
  init();
});

function init () {
  container = document.getElementById('container');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 1000;
  scene.add(camera);

  controls = new THREE.OrbitControls(camera);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 1024;

  // LIGHT
  var ambient = new THREE.AmbientLight(0x444444);
  scene.add(ambient);

  light = new THREE.SpotLight(0xaaaaaa, 1, 0, Math.PI / 2, 1);
  light.position.set(0, 1500, 1000);
  light.target.position.set(0, 0, 0);

  light.castShadow = true;

  light.shadow.camera.near = 1200;
  light.shadow.camera.far = 2500;
  light.shadow.camera.fov = 90;

  light.shadow.bias = 0.0001;
  light.shadow.darkness = 0.5;

  light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
  light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

  scene.add(light);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  window.addEventListener('resize', onWindowResize, false);

  initPass();

  initScene();

  onWindowResize();

  render();
}

var depthMaterial = new THREE.MeshBasicMaterial();

function initPass () {
  composer = new WAGNER.Composer(renderer, { useRGBA: false });
  dofPass = new WAGNER.GuidedFullBoxBlurPass();

  dofPass.params.from = 0.7;
  dofPass.params.to = 0.4;
  dofPass.params.amount = 20;

  gui = new DAT.GUI();

  gui.add(dofPass.params, 'from').min(0).max(1);
  gui.add(dofPass.params, 'to').min(0).max(1);
  gui.add(dofPass.params, 'amount').min(0).max(100);
  gui.add(dofPass.params, 'invertBiasMap');

  gui.open();

  var sL = new ShaderLoader();
  sL.add('depth-vs', '/js/wagner/vertex-shaders/packed-depth-vs.glsl');
  sL.add('depth-fs', '/js/wagner/fragment-shaders/packed-depth-fs.glsl');
  sL.load();
  sL.onLoaded(function () {
    depthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        mNear: { type: 'f', value: camera.near },
        mFar: { type: 'f', value: camera.far }
      },
      vertexShader: this.get('depth-vs'),
      fragmentShader: this.get('depth-fs'),
      shading: THREE.SmoothShading
    });
  });
}

var modelMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  shininess: 0.5
});

function onWindowResize () {
  var s = 1,
    w = window.innerWidth,
    h = window.innerHeight;

  renderer.setSize(s * w, s * h);
  camera.projectionMatrix.makePerspective(fov, w / h, camera.near, camera.far);

  resizePass();
}

function render () {
  requestAnimationFrame(render);

  scene.children.forEach(function (object) {
    if (object.type === 'Mesh') {
      object.rotation.x += 0.01;
      object.rotation.y += 0.02;
      object.rotation.z += 0.01;
    }
  });

  renderPass();
}

function renderPass () {
  composer.reset();

  depthMaterial.side = THREE.DoubleSide;
  scene.overrideMaterial = depthMaterial;
  composer.render(scene, camera, null, depthTexture);
  dofPass.params.tBias = depthTexture;

  scene.overrideMaterial = null;
  composer.render(scene, camera);

  composer.pass(dofPass);

  composer.toScreen();
}

function resizePass () {
  composer.setSize(renderer.domElement.width, renderer.domElement.height);
  depthTexture = WAGNER.Pass.prototype.getOfflineTexture(composer.width, composer.height, false);
}
