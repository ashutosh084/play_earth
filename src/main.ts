import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import {
//   RenderPass,
//   UnrealBloomPass,
//   EffectComposer,
//   ShaderPass,
//   OutputPass
// } from "three/examples/jsm/Addons.js";
//@ts-expect-error
import FakeGlowMaterial from "./FakeGlowMaterial.js";
//scene
const scene = new THREE.Scene();

//sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const sizeMultiplier = Math.min(...Object.values(sizes)) / 1080;

//camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  2000
);
camera.position.z = 20;
camera.fov = 90;

// light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

const lightSource = new THREE.Object3D();
lightSource.add(light);
lightSource.position.set(0, 0, 100);
scene.add(lightSource);
let lightToCameraAngle = 0;

//texure loader
const textureLoader = new THREE.TextureLoader();

//renderer
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setClearColor(0x000000);
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//bloom camera
// const bloomCamera = new THREE.PerspectiveCamera(
//   75,
//   sizes.width / sizes.height,
//   0.1,
//   2000
// );
// bloomCamera.position.z = 20;
// bloomCamera.fov = 90;

//bloom renderer
// const BLOOM_SCENE = 1;

// const bloomLayer = new THREE.Layers();
// bloomLayer.set(BLOOM_SCENE);

// const bloomScene = new THREE.Scene();
// const renderScene = new RenderPass(scene, camera);
// const bloomPass = new UnrealBloomPass(
//   new THREE.Vector2(window.innerWidth, window.innerHeight),
//   1.5,
//   0.4,
//   0.85
// );
// bloomPass.threshold = 0;
// bloomPass.strength = 2;
// bloomPass.radius = 0;

// const bloomComposer = new EffectComposer(renderer);
// bloomComposer.renderToScreen = false;
// bloomComposer.addPass(renderScene);
// bloomComposer.addPass(bloomPass);

// const mixPass = new ShaderPass(
//   new THREE.ShaderMaterial({
//     uniforms: {
//       baseTexture: { value: null },
//       bloomTexture: { value: bloomComposer.renderTarget2.texture },
//     },
//     defines: {},
//   }),
//   "baseTexture"
// );
// mixPass.needsSwap = true;

// const outputPass = new OutputPass();

// const finalComposer = new EffectComposer(renderer);
// finalComposer.addPass(renderScene);
// finalComposer.addPass(mixPass);
// finalComposer.addPass(outputPass);

// sun
const sunShape = new THREE.IcosahedronGeometry(1, 15);
const shine = new THREE.MeshPhongMaterial();
shine.emissive = new THREE.Color("#FFF9D7");
shine.emissiveIntensity = 10;
shine.map = textureLoader.load("textures/sunmap.jpg");
const sun = new THREE.Mesh(sunShape, shine);

const pointLight = new THREE.PointLight("#FFF9D7", 2, 0, 0.5);
sun.add(pointLight);

sun.position.set(0, 0, 800);

scene.add(sun);

//sky box
const skybox = new THREE.BoxGeometry(1500, 1500, 1500);
const textureArray = [
  textureLoader.load("textures/px.png"),
  textureLoader.load("textures/nx.png"),
  textureLoader.load("textures/py.png"),
  textureLoader.load("textures/ny.png"),
  textureLoader.load("textures/pz.png"),
  textureLoader.load("textures/nz.png"),
].map((e) => new THREE.MeshBasicMaterial({ map: e, side: THREE.BackSide }));
const box = new THREE.Mesh(skybox, textureArray);
scene.add(box);

// //earth

const geometry = new THREE.SphereGeometry(sizeMultiplier * 10, 64, 64);
const material = new THREE.MeshPhongMaterial();
material.map = textureLoader.load("textures/earth.jpg");
material.bumpMap = textureLoader.load("maps/bump_map.jpg");
material.bumpScale = 3;
material.specularMap = textureLoader.load("maps/lighting.jpg");
material.specular = new THREE.Color("silver");

//clouds
const cloudGeometry = new THREE.SphereGeometry(
  sizeMultiplier * 10 + 0.1,
  32,
  32
);
const cloudMaterial = new THREE.MeshPhongMaterial();
cloudMaterial.map = textureLoader.load("textures/clouds_blank.jpg");
cloudMaterial.alphaMap = textureLoader.load("maps/cloud_alpha.jpg");
cloudMaterial.side = THREE.DoubleSide;
cloudMaterial.opacity = 0.3;
cloudMaterial.shininess = 0;
cloudMaterial.transparent = true;

//moon
const moonGeometry = new THREE.SphereGeometry(sizeMultiplier * 3, 32, 32);
const moonMaterial = new THREE.MeshPhongMaterial();
moonMaterial.map = textureLoader.load("textures/moonmap1k.jpg");
moonMaterial.bumpMap = textureLoader.load("maps/moonbump1k.jpg");
moonMaterial.bumpScale = 3;
moonMaterial.shininess = 0;
moonMaterial.specularMap = textureLoader.load("maps/lighting.jpg");
moonMaterial.specular = new THREE.Color("silver");
const moon = new THREE.Object3D();
let moonToCameraAngle = 0;

//creating Meshes
const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
const sphere = new THREE.Mesh(geometry, material);
const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
sphere.receiveShadow = true;
sphere.castShadow = true;
moon.castShadow = true;
moon.receiveShadow = true;
cloud.receiveShadow = true;
moon.add(moonMesh);
//adding to scene
sphere.add(cloud);
scene.add(sphere);
scene.add(moon);

// //adding control to drag around the sphere
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 200;

// //pause animation
let continueAnim = true;

//controls
let isClick = false;
let timer: any;

document.addEventListener("mousedown", () => {
  isClick = true;
  timer = setTimeout(() => {
    isClick = false;
  }, 200);
});

document.addEventListener("mouseup", () => {
  clearTimeout(timer);
  if (isClick) {
    continueAnim = !continueAnim;
  }
  isClick = false;
});

document.addEventListener("mousemove", () => {
  if (isClick) {
    // Handle drag event
    //TODO: nothing
  }
});

window.addEventListener("resize", () => {
  //update sizes
  sizes.height = window.innerHeight;
  sizes.width = window.innerWidth;

  //update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //update renderer
  renderer.setSize(sizes.width, sizes.height);
});

/**
 * Function to animate the scene with the given renderer and camera.
 */

function animate() {
  requestAnimationFrame(animate);
  
  if (continueAnim) {
    lightToCameraAngle += 0.01;
    moonToCameraAngle += 0.01;
  }
  lightSource.position.set(
    sizeMultiplier * 100 * Math.cos(lightToCameraAngle),
    0,
    sizeMultiplier * 100 * Math.sin(lightToCameraAngle)
  );
  sun.position.set(
    sizeMultiplier * 800 * Math.cos(lightToCameraAngle),
    0,
    sizeMultiplier * 800 * Math.sin(lightToCameraAngle)
  )
  moon.position.set(
    sizeMultiplier * 40 * Math.sin(moonToCameraAngle),
    0,
    sizeMultiplier * 40 * Math.cos(moonToCameraAngle)
  );
  cloud.rotation.y += 0.001;
  
  renderer.render(scene, camera);
  
  controls.update();
}

animate();
