import "./style.css";
import * as three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

//scene
const scene = new three.Scene();

//sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//camera
const camera = new three.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

//light
const light = new three.DirectionalLight(0xffffff, 1);
// light.position.set(0, 20, 20);
// scene.add(light);

const lightSource = new three.Object3D();
lightSource.add(light);
lightSource.position.set(0, 0, 20);
scene.add(lightSource);
let lightToCameraAngle = 0;

//texure loader
const textureLoader = new three.TextureLoader();

//renderer
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const renderer = new three.WebGLRenderer({
  canvas: canvas,
});
renderer.setClearColor(0x000000);
renderer.setSize(sizes.width, sizes.height);

camera.position.z = 20;
camera.fov = 90;

//earth

const geometry = new three.SphereGeometry(
  (Math.min(...Object.values(sizes)) / 1080) * 10,
  64,
  64
);
const material = new three.MeshPhongMaterial();
material.map = textureLoader.load("textures/earth.jpg");
material.bumpMap = textureLoader.load("maps/bump_map.jpg");
material.bumpScale = 3;
material.specularMap = textureLoader.load("maps/lighting.jpg");
material.specular = new three.Color("silver");

//clouds
const cloudGeometry = new three.SphereGeometry(
  (Math.min(...Object.values(sizes)) / 1080) * 10 + 0.1,
  32,
  32
);
const cloudMaterial = new three.MeshPhongMaterial();
cloudMaterial.map = textureLoader.load("textures/clouds_blank.jpg");
cloudMaterial.alphaMap = textureLoader.load("maps/cloud_alpha.jpg");
cloudMaterial.side = three.DoubleSide;
cloudMaterial.opacity = 0.3;
cloudMaterial.shininess = 0;
cloudMaterial.transparent = true;

//moon
const moonGeometry = new three.SphereGeometry(
  (Math.min(...Object.values(sizes)) / 1080) * 3,
  32,
  32
);
const moonMaterial = new three.MeshPhongMaterial();
moonMaterial.map = textureLoader.load("textures/moonmap1k.jpg");
moonMaterial.bumpMap = textureLoader.load("maps/moonbump1k.jpg");
moonMaterial.bumpScale = 3;
moonMaterial.shininess = 0;
moonMaterial.specularMap = textureLoader.load("maps/lighting.jpg");
moonMaterial.specular = new three.Color("silver");
const moon = new three.Object3D();
let moonToCameraAngle = 0;

//creating Meshes
const cloud = new three.Mesh(cloudGeometry, cloudMaterial);
const sphere = new three.Mesh(geometry, material);
const moonMesh = new three.Mesh(moonGeometry, moonMaterial);
moon.add(moonMesh);
//adding to scene
sphere.add(cloud);
scene.add(sphere);
scene.add(moon);

//adding control to drag around the sphere
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.dampingFactor = 0.01;

//pause animation
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

//for touch devices
let isTouch = false;
let touchStartX: number;
let touchStartY: number;

document.addEventListener("touchstart", (event) => {
  isTouch = true;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
});

document.addEventListener("touchmove", () => {
  if (isTouch) {
    // Handle drag event
    // const touchMoveX = event.touches[0].clientX;
    // const touchMoveY = event.touches[0].clientY;
    // Calculate movement distance and direction if needed
  }
});

document.addEventListener("touchend", (event) => {
  if (isTouch) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    // Calculate movement distance and determine if it's a tap or a drag
    if (Math.abs(touchEndX - touchStartX) < 10 && Math.abs(touchEndY - touchStartY) < 10) {
      // Handle tap event
      continueAnim = !continueAnim;
    } else {
      // Handle drag event
      // do nothing
    }
  }
  isTouch = false;
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
    20 * Math.cos(lightToCameraAngle),
    0,
    20 * Math.sin(lightToCameraAngle)
  );
  moon.position.set(
    40 * Math.sin(moonToCameraAngle),
    0,
    40 * Math.cos(moonToCameraAngle)
  );

  cloud.rotation.y += 0.001;

  renderer.render(scene, camera);
  controls.update();
}

animate();
