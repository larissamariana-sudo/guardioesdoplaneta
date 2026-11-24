/**
 * Isometric 3D City Engine for Guardiões 3D
 * Cerrado / Rio Meia Ponte / The Sims-style living simulation
 * Strictly follows Three.js Skill directives:
 * - isSoftwareGl check
 * - PMREMGenerator + RoomEnvironment
 * - Composite 3-12 part procedural models
 * - Zero 404 dependencies (all canvas/data textures & geometries procedural)
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Citizen, Building, WeatherEventType } from '../types/game';

export interface SceneCallbacks {
  onSelectCitizen?: (citizenId: string) => void;
  onSelectBuilding?: (buildingId: string) => void;
}

export class IsometricCityScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private pmremGenerator: THREE.PMREMGenerator | null = null;
  private isSoftwareGl: boolean = false;
  private animationFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Scene entities
  private citizensGroup: THREE.Group = new THREE.Group();
  private buildingsGroup: THREE.Group = new THREE.Group();
  private treesGroup: THREE.Group = new THREE.Group();
  private plantedIpesGroup: THREE.Group = new THREE.Group();
  private weatherFxGroup: THREE.Group = new THREE.Group();
  private riverMesh: THREE.Mesh | null = null;
  private selectionRing: THREE.Mesh;

  // Particle systems
  private smokeParticles: THREE.Points | null = null;
  private rainParticles: THREE.Points | null = null;
  private heatShimmerParticles: THREE.Points | null = null;
  private dustParticles: THREE.Points | null = null;
  private mosquitoParticles: THREE.Points | null = null;

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // Raycasting & Interaction
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouseVec: THREE.Vector2 = new THREE.Vector2();
  private interactiveObjects: THREE.Object3D[] = [];
  private callbacks: SceneCallbacks = {};

  // Camera pan & zoom state
  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private zoomLevel: number = 38;
  private targetZoom: number = 38;
  private isDragging: boolean = false;
  private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };

  // Citizens runtime tracking
  private citizenMeshes: Map<string, THREE.Group> = new Map();
  private citizenSprites: Map<string, THREE.Sprite> = new Map();
  private localCitizens: Citizen[] = [];
  private currentWeatherType: WeatherEventType = 'clear';
  private riverBaseY: number = 0.15;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Detect software WebGL per skill guidelines
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Setup Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdceefb);
    this.scene.fog = new THREE.FogExp2(0xdceefb, 0.012);

    // 4. RoomEnvironment for authentic PBR reflections
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;

    // 5. Isometric Orthographic Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.OrthographicCamera(
      -this.zoomLevel * aspect,
      this.zoomLevel * aspect,
      this.zoomLevel,
      -this.zoomLevel,
      1,
      1000
    );
    // Classical True Isometric Angle: atan(1/sqrt(2)) ~ 35.264°, 45° azimuth
    this.camera.position.set(65, 55, 65);
    this.camera.lookAt(this.currentLookAt);

    // 6. Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0xfffae8, 0x5a7d65, 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfff2ce, 1.4);
    this.dirLight.position.set(50, 80, 30);
    this.dirLight.castShadow = !this.isSoftwareGl;
    if (this.dirLight.castShadow) {
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 10;
      this.dirLight.shadow.camera.far = 200;
      const d = 45;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);

    // Selection ring
    const ringGeo = new THREE.RingGeometry(1.4, 1.8, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    this.selectionRing = new THREE.Mesh(ringGeo, ringMat);
    this.selectionRing.position.set(0, 0.1, 0);
    this.selectionRing.visible = false;
    this.scene.add(this.selectionRing);

    // Add groups
    this.scene.add(this.buildingsGroup);
    this.scene.add(this.citizensGroup);
    this.scene.add(this.treesGroup);
    this.scene.add(this.plantedIpesGroup);
    this.scene.add(this.weatherFxGroup);

    // Build the World
    this.buildTerrainAndRiver();
    this.buildRoadNetwork();
    this.buildBuildings();
    this.buildCerradoPark();
    this.initWeatherParticleSystems();

    // Event listeners
    this.setupEventListeners();

    // Start render loop
    this.animate();
  }

  /* -------------------------------------------------------------
   * PROCEDURAL TEXTURE GENERATION (Zero 404 dependencies)
   * ----------------------------------------------------------- */
  private createGrassTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#6e9858';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle Cerrado speckles and warmth
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 1.5;
      ctx.fillStyle = Math.random() > 0.5 ? '#7ea965' : '#5b8247';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private createWaterNormalMap(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#0ea5e9');
    grad.addColorStop(1, '#0369a1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 18);
      ctx.bezierCurveTo(80, i * 18 + 10, 160, i * 18 - 10, 256, i * 18 + 5);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private createRoofTileTexture(baseColorHex: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < 128; y += 12) {
      ctx.fillRect(0, y, 128, 2);
    }
    for (let x = 0; x < 128; x += 16) {
      ctx.fillRect(x, 0, 2, 128);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private createStatusSprite(icon: string, bgColor: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Circle background with shadow
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(32, 32, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Emoji icon
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 32, 34);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 1.4, 1);
    sprite.position.set(0, 3.2, 0);
    return sprite;
  }

  /* -------------------------------------------------------------
   * TERRAIN, RIO MEIA PONTE & ROAD NETWORK
   * ----------------------------------------------------------- */
  private buildTerrainAndRiver() {
    // 1. Natural Cerrado Ground (Extended beyond playable boundaries)
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x6e9657,
      map: this.createGrassTexture(),
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = !this.isSoftwareGl;
    ground.position.y = 0;
    this.scene.add(ground);

    // 2. Rio Meia Ponte: carved riverbed with sinuous flow from Z: -60 to +60 at X ~ -14 to -8
    // Riverbed ditch
    const bedGeo = new THREE.PlaneGeometry(16, 140);
    bedGeo.rotateX(-Math.PI / 2);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x4a473e,
      roughness: 0.95,
    });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.set(-11, 0.02, 0);
    bedMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(bedMesh);

    // River Water Plane with procedural animated wave reflections
    const waterGeo = new THREE.PlaneGeometry(14, 140, 32, 64);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1d9bf0,
      map: this.createWaterNormalMap(),
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88,
    });
    this.riverMesh = new THREE.Mesh(waterGeo, waterMat);
    this.riverMesh.position.set(-11, this.riverBaseY, 0);
    this.riverMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(this.riverMesh);

    // River stone banks along edges
    const rockGeo = new THREE.DodecahedronGeometry(0.5);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.85,
    });
    for (let z = -50; z <= 50; z += 3.5) {
      const rockLeft = new THREE.Mesh(rockGeo, rockMat);
      rockLeft.position.set(-18 + Math.sin(z * 0.3) * 0.8, 0.25, z);
      rockLeft.scale.set(1 + Math.sin(z), 0.7, 1);
      rockLeft.castShadow = !this.isSoftwareGl;
      this.scene.add(rockLeft);

      const rockRight = new THREE.Mesh(rockGeo, rockMat);
      rockRight.position.set(-4 + Math.cos(z * 0.4) * 0.8, 0.25, z);
      rockRight.scale.set(0.9 + Math.cos(z), 0.75, 1);
      rockRight.castShadow = !this.isSoftwareGl;
      this.scene.add(rockRight);
    }

    // 3. Two Arch Stone Bridges over Rio Meia Ponte (Z = -15 and Z = 20)
    this.buildBridge(-11, -15);
    this.buildBridge(-11, 20);
  }

  private buildBridge(x: number, z: number) {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(x, 0, z);

    // Main bridge deck
    const deckGeo = new THREE.BoxGeometry(16, 0.5, 5);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.7,
      metalness: 0.1,
    });
    const deck = new THREE.Mesh(deckGeo, stoneMat);
    deck.position.y = 1.0;
    deck.castShadow = !this.isSoftwareGl;
    deck.receiveShadow = !this.isSoftwareGl;
    bridgeGroup.add(deck);

    // Stone arch pillars
    const pillarGeo = new THREE.BoxGeometry(2, 1.2, 5.2);
    const leftPillar = new THREE.Mesh(pillarGeo, stoneMat);
    leftPillar.position.set(-5, 0.5, 0);
    const rightPillar = new THREE.Mesh(pillarGeo, stoneMat);
    rightPillar.position.set(5, 0.5, 0);
    bridgeGroup.add(leftPillar);
    bridgeGroup.add(rightPillar);

    // Parapet railings
    const railGeo = new THREE.BoxGeometry(16, 0.6, 0.3);
    const railFront = new THREE.Mesh(railGeo, stoneMat);
    railFront.position.set(0, 1.5, 2.3);
    const railBack = new THREE.Mesh(railGeo, stoneMat);
    railBack.position.set(0, 1.5, -2.3);
    bridgeGroup.add(railFront);
    bridgeGroup.add(railBack);

    // Ramp approaches
    const rampGeo = new THREE.BoxGeometry(4, 0.4, 5);
    const leftRamp = new THREE.Mesh(rampGeo, stoneMat);
    leftRamp.position.set(-9.5, 0.5, 0);
    leftRamp.rotation.z = 0.15;
    const rightRamp = new THREE.Mesh(rampGeo, stoneMat);
    rightRamp.position.set(9.5, 0.5, 0);
    rightRamp.rotation.z = -0.15;
    bridgeGroup.add(leftRamp);
    bridgeGroup.add(rightRamp);

    this.scene.add(bridgeGroup);
  }

  private buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.1,
    });
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.85,
    });

    // Main Avenue East-West connecting bridges to town center (Z = -15 & Z = 20)
    const avenueGeo = new THREE.PlaneGeometry(60, 5);
    avenueGeo.rotateX(-Math.PI / 2);

    const ave1 = new THREE.Mesh(avenueGeo, roadMat);
    ave1.position.set(22, 0.04, -15);
    ave1.receiveShadow = !this.isSoftwareGl;
    this.scene.add(ave1);

    const ave2 = new THREE.Mesh(avenueGeo, roadMat);
    ave2.position.set(22, 0.04, 20);
    ave2.receiveShadow = !this.isSoftwareGl;
    this.scene.add(ave2);

    // North-South Avenue at X = 8 (Connecting residential with community buildings)
    const nsAveGeo = new THREE.PlaneGeometry(5, 70);
    nsAveGeo.rotateX(-Math.PI / 2);
    const nsAve = new THREE.Mesh(nsAveGeo, roadMat);
    nsAve.position.set(8, 0.045, 2);
    nsAve.receiveShadow = !this.isSoftwareGl;
    this.scene.add(nsAve);

    // North-South Avenue at X = 32 (Bordering Parque do Cerrado)
    const nsAve2 = new THREE.Mesh(nsAveGeo, roadMat);
    nsAve2.position.set(32, 0.045, 2);
    nsAve2.receiveShadow = !this.isSoftwareGl;
    this.scene.add(nsAve2);

    // Sidewalks along X = 8
    const swGeo = new THREE.PlaneGeometry(2, 70);
    swGeo.rotateX(-Math.PI / 2);
    const swLeft = new THREE.Mesh(swGeo, sidewalkMat);
    swLeft.position.set(4.5, 0.06, 2);
    const swRight = new THREE.Mesh(swGeo, sidewalkMat);
    swRight.position.set(11.5, 0.06, 2);
    this.scene.add(swLeft);
    this.scene.add(swRight);

    // Pedestrian Crosswalks (Faixas de pedestres)
    this.buildCrosswalk(8, -15);
    this.buildCrosswalk(8, 20);
    this.buildCrosswalk(32, -15);
    this.buildCrosswalk(32, 20);
  }

  private buildCrosswalk(x: number, z: number) {
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripeGeo = new THREE.PlaneGeometry(0.5, 3.8);
    stripeGeo.rotateX(-Math.PI / 2);

    for (let i = -2; i <= 2; i++) {
      const stripe = new THREE.Mesh(stripeGeo, whiteMat);
      stripe.position.set(x + i * 0.8, 0.06, z);
      this.scene.add(stripe);
    }
  }

  /* -------------------------------------------------------------
   * PROCEDURAL BUILDINGS (Composite 3-12 parts)
   * ----------------------------------------------------------- */
  private buildBuildings() {
    // 1. Casas Familiares & Telhados Coloniais
    this.buildColonialHouse('house_pedrinho', 'Casa do Pedrinho', 18, -26, 0xe06d53, 0xb91c1c);
    this.buildColonialHouse('house_maria', 'Residência Dona Maria', 24, -26, 0xf59e0b, 0x9a3412);
    this.buildColonialHouse('house_beatriz', 'Casa da Beatriz (Acessível)', 18, -4, 0x06b6d4, 0x1e3a8a);
    this.buildColonialHouse('house_joao', 'Horta do Seu João', 24, -4, 0x84cc16, 0x4d7c0f);

    // 2. Prédios Comunitários Essenciais
    // Escola Pública / PSE at X = 18, Z = 8
    this.buildPublicSchool('school_pse', 'Escola Pública / PSE', 18, 8);

    // UBS & Polo Respiratório at X = 25, Z = 8
    this.buildUbsClinic('ubs_clinic', 'UBS & Polo Respiratório', 26, 8);

    // Base de Brigadistas at X = 20, Z = 30
    this.buildBrigadeStation('brigade_station', 'Base de Brigadistas de Incêndio', 20, 30);

    // Cisterna Comunitária do Rio Meia Ponte at X = -2, Z = 3
    this.buildCommunityCistern('cistern_meia_ponte', 'Cisterna do Rio Meia Ponte', -2, 3);
  }

  private buildColonialHouse(
    id: string,
    name: string,
    x: number,
    z: number,
    wallColor: number,
    roofColor: number
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.name = id;
    group.userData = { id, name, type: 'colonial_house' };

    // 1. Foundation Base
    const baseGeo = new THREE.BoxGeometry(4.6, 0.4, 4.6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.9,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    group.add(base);

    // 2. Main Colonial Walls
    const wallGeo = new THREE.BoxGeometry(4.2, 2.6, 4.2);
    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.75,
    });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 1.7;
    walls.castShadow = !this.isSoftwareGl;
    walls.receiveShadow = !this.isSoftwareGl;
    group.add(walls);

    // 3. Gable Roof (Triangular Terracotta Roof)
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-2.4, 0);
    roofShape.lineTo(0, 1.8);
    roofShape.lineTo(2.4, 0);
    roofShape.closePath();

    const extrudeSettings = { depth: 4.6, bevelEnabled: false };
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    roofGeo.center();
    const roofMat = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.6,
      map: this.createRoofTileTexture('#b45309'),
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 3.8, 0);
    roof.castShadow = !this.isSoftwareGl;
    group.add(roof);

    // 4. Windows with warm illuminated glass
    const winGeo = new THREE.BoxGeometry(0.8, 0.9, 0.1);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xca8a04,
      emissiveIntensity: 0.3,
      roughness: 0.2,
    });
    const win1 = new THREE.Mesh(winGeo, winMat);
    win1.position.set(-1.2, 1.8, 2.12);
    const win2 = new THREE.Mesh(winGeo, winMat);
    win2.position.set(1.2, 1.8, 2.12);
    group.add(win1);
    group.add(win2);

    // 5. Wooden Colonial Door
    const doorGeo = new THREE.BoxGeometry(0.9, 1.6, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.8,
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.2, 2.12);
    group.add(door);

    // 6. Chimney / Ventilation Flue
    const chimGeo = new THREE.BoxGeometry(0.6, 1.6, 0.6);
    const chimMat = new THREE.MeshStandardMaterial({
      color: 0x713f12,
      roughness: 0.85,
    });
    const chimney = new THREE.Mesh(chimGeo, chimMat);
    chimney.position.set(1.2, 4.4, -0.8);
    chimney.castShadow = !this.isSoftwareGl;
    group.add(chimney);

    // 7. Garden Fence & Plantable Backyard Plot
    const fenceGeo = new THREE.BoxGeometry(5.2, 0.4, 0.1);
    const fenceMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.7,
    });
    const fence = new THREE.Mesh(fenceGeo, fenceMat);
    fence.position.set(0, 0.25, 2.8);
    group.add(fence);

    // Backyard garden earth patch (Ipê tree grows here when planted)
    const patchGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 16);
    const patchMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.95,
    });
    const earthPatch = new THREE.Mesh(patchGeo, patchMat);
    earthPatch.position.set(0, 0.05, -3.2);
    earthPatch.name = `garden_patch_${id}`;
    group.add(earthPatch);

    this.buildingsGroup.add(group);
    this.interactiveObjects.push(walls);
  }

  private buildPublicSchool(id: string, name: string, x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.name = id;
    group.userData = { id, name, type: 'school_pse' };

    // 1. Campus building base
    const baseGeo = new THREE.BoxGeometry(9, 0.4, 6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    group.add(base);

    // 2. Main School Block
    const wallGeo = new THREE.BoxGeometry(8.4, 3.2, 5.4);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.65,
    });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 2.0;
    walls.castShadow = !this.isSoftwareGl;
    walls.receiveShadow = !this.isSoftwareGl;
    group.add(walls);

    // 3. Flat roof with solar panels & parapet
    const roofGeo = new THREE.BoxGeometry(8.8, 0.3, 5.8);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.75;
    group.add(roof);

    // Solar panels on roof
    const solarGeo = new THREE.BoxGeometry(3.2, 0.1, 2.0);
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.8,
      roughness: 0.2,
    });
    const solar = new THREE.Mesh(solarGeo, solarMat);
    solar.position.set(0, 3.95, 0);
    solar.rotation.x = -0.15;
    group.add(solar);

    // 4. Large School Entrance & Signboard
    const signGeo = new THREE.BoxGeometry(4.2, 0.8, 0.2);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.4,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.8, 2.8);
    group.add(sign);

    // 5. Playground court with basketball hoop
    const courtGeo = new THREE.BoxGeometry(4, 0.05, 4);
    const courtMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.9,
    });
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.position.set(-6, 0.05, 0);
    group.add(court);

    // Basketball hoop pole & backboard
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(-7.6, 1.2, 0);
    group.add(pole);

    const boardGeo = new THREE.BoxGeometry(0.1, 0.7, 0.9);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(-7.5, 2.2, 0);
    group.add(board);

    this.buildingsGroup.add(group);
    this.interactiveObjects.push(walls);
  }

  private buildUbsClinic(id: string, name: string, x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.name = id;
    group.userData = { id, name, type: 'ubs_clinic' };

    // 1. Main Clinic structure
    const wallGeo = new THREE.BoxGeometry(6.5, 3.4, 6.0);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
    });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 1.9;
    walls.castShadow = !this.isSoftwareGl;
    walls.receiveShadow = !this.isSoftwareGl;
    group.add(walls);

    // 2. Medical Red Cross on top/front
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.4, 0.15),
      crossMat
    );
    crossV.position.set(0, 2.4, 3.1);
    const crossH = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.4, 0.15),
      crossMat
    );
    crossH.position.set(0, 2.4, 3.1);
    group.add(crossV);
    group.add(crossH);

    // 3. Emergency entrance awning / canopy
    const awningGeo = new THREE.BoxGeometry(4.0, 0.2, 2.0);
    const awningMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.2,
      roughness: 0.5,
    });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 2.2, 3.8);
    group.add(awning);

    // 4. Accessible ambulance ramp
    const rampGeo = new THREE.BoxGeometry(3.6, 0.3, 2.4);
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
    });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.position.set(0, 0.15, 3.8);
    ramp.rotation.x = 0.1;
    group.add(ramp);

    // 5. Oxygen cylinders storage unit on side
    for (let i = 0; i < 3; i++) {
      const cylGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.4, 12);
      const cylMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.6,
      });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.position.set(3.6, 0.7, -1 + i * 0.6);
      group.add(cyl);
    }

    this.buildingsGroup.add(group);
    this.interactiveObjects.push(walls);
  }

  private buildBrigadeStation(
    id: string,
    name: string,
    x: number,
    z: number
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.name = id;
    group.userData = { id, name, type: 'brigade_station' };

    // 1. Station Hangar Base
    const hangarGeo = new THREE.BoxGeometry(8.0, 3.6, 6.0);
    const hangarMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.6,
    });
    const hangar = new THREE.Mesh(hangarGeo, hangarMat);
    hangar.position.y = 2.0;
    hangar.castShadow = !this.isSoftwareGl;
    hangar.receiveShadow = !this.isSoftwareGl;
    group.add(hangar);

    // 2. Rolling garage door
    const doorGeo = new THREE.BoxGeometry(4.0, 2.8, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const garageDoor = new THREE.Mesh(doorGeo, doorMat);
    garageDoor.position.set(0, 1.6, 3.05);
    group.add(garageDoor);

    // 3. Lookout Tower with searchlight
    const towerGeo = new THREE.CylinderGeometry(0.8, 1.2, 7.0, 8);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(-3.2, 4.0, -2.4);
    tower.castShadow = !this.isSoftwareGl;
    group.add(tower);

    // Tower observation deck & siren
    const deckGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.4, 8);
    const deck = new THREE.Mesh(deckGeo, towerMat);
    deck.position.set(-3.2, 7.5, -2.4);
    group.add(deck);

    // Siren beacon
    const sirenGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3);
    const sirenMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const siren = new THREE.Mesh(sirenGeo, sirenMat);
    siren.position.set(-3.2, 8.0, -2.4);
    group.add(siren);

    // 4. Firefighter containment vehicle outside
    const truckGeo = new THREE.BoxGeometry(2.4, 1.6, 4.4);
    const truckMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.5,
      metalness: 0.3,
    });
    const truck = new THREE.Mesh(truckGeo, truckMat);
    truck.position.set(4.8, 1.0, 1.5);
    truck.castShadow = !this.isSoftwareGl;
    group.add(truck);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.position.set(3.5, 0.4, 0.2);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.position.set(6.1, 0.4, 0.2);
    const w3 = new THREE.Mesh(wheelGeo, wheelMat);
    w3.position.set(3.5, 0.4, 2.8);
    const w4 = new THREE.Mesh(wheelGeo, wheelMat);
    w4.position.set(6.1, 0.4, 2.8);
    group.add(w1, w2, w3, w4);

    this.buildingsGroup.add(group);
    this.interactiveObjects.push(hangar);
  }

  private buildCommunityCistern(
    id: string,
    name: string,
    x: number,
    z: number
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.name = id;
    group.userData = { id, name, type: 'cistern' };

    // 1. Raised Stone Pedestal
    const baseGeo = new THREE.CylinderGeometry(2.8, 3.2, 1.0, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.85,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.5;
    group.add(base);

    // 2. Large Stainless Steel / Concrete Reservoir Tank
    const tankGeo = new THREE.CylinderGeometry(2.2, 2.2, 3.4, 24);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.7,
      roughness: 0.3,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 2.7;
    tank.castShadow = !this.isSoftwareGl;
    group.add(tank);

    // 3. Communal Public Fountain & Taps
    const basinGeo = new THREE.BoxGeometry(1.6, 0.6, 1.2);
    const basinMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.4,
    });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.set(0, 0.8, 2.4);
    group.add(basin);

    // Intake pipe connecting from river direction
    const pipeGeo = new THREE.CylinderGeometry(0.15, 0.15, 3.8);
    pipeGeo.rotateZ(Math.PI / 3);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.set(-2.2, 1.8, 0);
    group.add(pipe);

    this.buildingsGroup.add(group);
    this.interactiveObjects.push(tank);
  }

  /* -------------------------------------------------------------
   * PARQUE DO CERRADO (Ipês Amarelos, Buriti, Baru)
   * ----------------------------------------------------------- */
  private buildCerradoPark() {
    const parkX = 40;
    const parkZ = 0;

    // Preserved grass mound
    const parkSoilGeo = new THREE.PlaneGeometry(28, 48);
    parkSoilGeo.rotateX(-Math.PI / 2);
    const parkSoilMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.85,
    });
    const parkSoil = new THREE.Mesh(parkSoilGeo, parkSoilMat);
    parkSoil.position.set(parkX, 0.05, parkZ);
    this.treesGroup.add(parkSoil);

    // Ipês Amarelos em floração (Vibrant golden flower clusters)
    const ipeCoords = [
      { x: 34, z: -16 },
      { x: 42, z: -10 },
      { x: 38, z: 2 },
      { x: 46, z: 12 },
      { x: 35, z: 18 },
    ];
    ipeCoords.forEach((coord, i) => {
      this.createIpeAmareloTree(coord.x, coord.z, 1.0 + (i % 3) * 0.15);
    });

    // Tall Buriti Palms (Distinctive fan fronds near wetlands/river edge)
    const buritiCoords = [
      { x: 32, z: -4 },
      { x: 44, z: -20 },
      { x: 45, z: 20 },
      { x: -5, z: -30 }, // near river
      { x: -6, z: 35 }, // near river
    ];
    buritiCoords.forEach((coord) => {
      this.createBuritiPalmTree(coord.x, coord.z);
    });

    // Native Baru Trees (Twisted trunk Cerrado trees)
    const baruCoords = [
      { x: 36, z: -8 },
      { x: 44, z: 6 },
      { x: 40, z: -18 },
    ];
    baruCoords.forEach((coord) => {
      this.createBaruTree(coord.x, coord.z);
    });

    // Park wooden benches
    this.createParkBench(38, -6);
    this.createParkBench(38, 8);
  }

  public createIpeAmareloTree(x: number, z: number, scale: number = 1.0): THREE.Group {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);
    treeGroup.scale.set(scale, scale, scale);

    // 1. Trunk (slender, slightly curved Cerrado wood)
    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.45, 4.0, 8);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5c3d2e,
      roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.0;
    trunk.castShadow = !this.isSoftwareGl;
    treeGroup.add(trunk);

    // 2. Yellow flowering canopy clusters (3 overlapping spheres)
    const flowerMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Golden yellow
      roughness: 0.6,
      metalness: 0.05,
    });

    const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), flowerMat);
    c1.position.set(0, 4.5, 0);
    c1.castShadow = !this.isSoftwareGl;

    const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), flowerMat);
    c2.position.set(-0.8, 3.8, 0.5);
    c2.castShadow = !this.isSoftwareGl;

    const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 1), flowerMat);
    c3.position.set(0.7, 4.0, -0.6);
    c3.castShadow = !this.isSoftwareGl;

    treeGroup.add(c1);
    treeGroup.add(c2);
    treeGroup.add(c3);

    this.treesGroup.add(treeGroup);
    return treeGroup;
  }

  private createBuritiPalmTree(x: number, z: number) {
    const palmGroup = new THREE.Group();
    palmGroup.position.set(x, 0, z);

    // 1. Tall slender palm trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 6.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x785340,
      roughness: 0.95,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 3.25;
    trunk.castShadow = !this.isSoftwareGl;
    palmGroup.add(trunk);

    // 2. Buriti fan fronds (starburst outward)
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const frondGeo = new THREE.ConeGeometry(0.8, 2.6, 4);
      frondGeo.rotateX(Math.PI / 3);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(Math.cos(angle) * 0.4, 6.4, Math.sin(angle) * 0.4);
      frond.rotation.y = angle;
      palmGroup.add(frond);
    }

    this.treesGroup.add(palmGroup);
  }

  private createBaruTree(x: number, z: number) {
    const baruGroup = new THREE.Group();
    baruGroup.position.set(x, 0, z);

    // Twisted rustic trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x452210,
      roughness: 0.95,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.75;
    trunk.rotation.z = 0.08;
    trunk.castShadow = !this.isSoftwareGl;
    baruGroup.add(trunk);

    // Dense green foliage
    const crownGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.75,
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(0, 4.0, 0);
    crown.castShadow = !this.isSoftwareGl;
    baruGroup.add(crown);

    this.treesGroup.add(baruGroup);
  }

  private createParkBench(x: number, z: number) {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(x, 0, z);

    const seatGeo = new THREE.BoxGeometry(1.6, 0.1, 0.6);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.8,
    });
    const seat = new THREE.Mesh(seatGeo, woodMat);
    seat.position.y = 0.45;
    benchGroup.add(seat);

    const legGeo = new THREE.BoxGeometry(0.1, 0.45, 0.6);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const leg1 = new THREE.Mesh(legGeo, metalMat);
    leg1.position.set(-0.7, 0.22, 0);
    const leg2 = new THREE.Mesh(legGeo, metalMat);
    leg2.position.set(0.7, 0.22, 0);
    benchGroup.add(leg1, leg2);

    this.treesGroup.add(benchGroup);
  }

  /* -------------------------------------------------------------
   * LIVING 3D CITIZENS (Sims-style mini actors)
   * ----------------------------------------------------------- */
  public updateCitizens(citizens: Citizen[]) {
    this.localCitizens = citizens;

    citizens.forEach((c) => {
      let group = this.citizenMeshes.get(c.id);

      if (!group) {
        // Build 3-12 part procedural mini-character
        group = this.buildCitizenProceduralModel(c);
        this.citizenMeshes.set(c.id, group);
        this.citizensGroup.add(group);
        this.interactiveObjects.push(group);

        // Overhead status sprite
        const sprite = this.createStatusSprite(
          c.avatarIcon,
          c.hydration < 40 || c.health < 40 ? '#ef4444' : '#10b981'
        );
        group.add(sprite);
        this.citizenSprites.set(c.id, sprite);
      }

      // Smooth movement towards targetPosition
      const currentPos = group.position;
      const targetPos = new THREE.Vector3(c.position.x, 0, c.position.z);
      currentPos.lerp(targetPos, 0.08);

      // Rotate towards walking direction if moving
      const dx = c.targetPosition.x - c.position.x;
      const dz = c.targetPosition.z - c.position.z;
      if (Math.abs(dx) > 0.05 || Math.abs(dz) > 0.05) {
        group.rotation.y = Math.atan2(dx, dz);
        // Subtle walking bounce
        group.position.y = Math.abs(Math.sin(this.clock.getElapsedTime() * 8)) * 0.15;
      } else {
        group.position.y = 0;
      }

      // Update PFF2 mask visibility
      const maskMesh = group.getObjectByName('pff2_mask');
      if (maskMesh) {
        maskMesh.visible = c.hasPff2Mask;
      }

      // Update status sprite emoji & color based on condition
      const sprite = this.citizenSprites.get(c.id);
      if (sprite) {
        let icon = c.avatarIcon;
        let color = '#10b981'; // safe green
        if (c.hydration < 40) {
          icon = '💧';
          color = '#3b82f6';
        } else if (c.health < 40) {
          icon = '⚠️';
          color = '#ef4444';
        } else if (c.hasPff2Mask) {
          icon = '😷';
          color = '#6366f1';
        }
        // Bob sprite slightly
        sprite.position.y = 3.2 + Math.sin(this.clock.getElapsedTime() * 3 + Number(c.age)) * 0.1;
      }
    });
  }

  private buildCitizenProceduralModel(c: Citizen): THREE.Group {
    const group = new THREE.Group();
    group.position.set(c.position.x, 0, c.position.z);
    group.name = c.id;
    group.userData = { id: c.id, citizen: c };

    // Scale adjustments for child vs adult
    const isChild = c.role === 'child_asthma';
    const isWheelchair = c.role === 'wheelchair_student';
    const scale = isChild ? 0.75 : 1.0;

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdf9b76,
      roughness: 0.8,
    });
    const clothesMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(c.color),
      roughness: 0.7,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
    });

    if (isWheelchair) {
      // 1. Wheelchair Frame & Seat
      const seatGeo = new THREE.BoxGeometry(0.8, 0.1, 0.8);
      const seat = new THREE.Mesh(seatGeo, darkMat);
      seat.position.y = 0.7;
      group.add(seat);

      // Backrest
      const backGeo = new THREE.BoxGeometry(0.8, 0.9, 0.1);
      const back = new THREE.Mesh(backGeo, darkMat);
      back.position.set(0, 1.15, -0.4);
      group.add(back);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
      wheelGeo.rotateZ(Math.PI / 2);
      const leftWheel = new THREE.Mesh(wheelGeo, darkMat);
      leftWheel.position.set(-0.48, 0.5, 0);
      const rightWheel = new THREE.Mesh(wheelGeo, darkMat);
      rightWheel.position.set(0.48, 0.5, 0);
      group.add(leftWheel, rightWheel);

      // Torso (seated)
      const torsoGeo = new THREE.BoxGeometry(0.65, 0.8, 0.4);
      const torso = new THREE.Mesh(torsoGeo, clothesMat);
      torso.position.set(0, 1.2, -0.1);
      group.add(torso);

      // Head
      const headGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(0, 1.85, -0.1);
      group.add(head);
    } else {
      // Standard Walking Sims
      // 1. Legs
      const legGeo = new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 0.9 * scale);
      const leftLeg = new THREE.Mesh(legGeo, darkMat);
      leftLeg.position.set(-0.2 * scale, 0.45 * scale, 0);
      const rightLeg = new THREE.Mesh(legGeo, darkMat);
      rightLeg.position.set(0.2 * scale, 0.45 * scale, 0);
      group.add(leftLeg, rightLeg);

      // 2. Torso
      const torsoGeo = new THREE.BoxGeometry(0.7 * scale, 0.9 * scale, 0.4 * scale);
      const torso = new THREE.Mesh(torsoGeo, clothesMat);
      torso.position.y = 1.35 * scale;
      torso.castShadow = !this.isSoftwareGl;
      group.add(torso);

      // 3. Head
      const headGeo = new THREE.SphereGeometry(0.32 * scale, 12, 12);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 2.05 * scale;
      head.castShadow = !this.isSoftwareGl;
      group.add(head);

      // 4. Role-specific accessories
      if (c.role === 'elderly') {
        // Walking stick for Dona Maria
        const caneGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2);
        const caneMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
        const cane = new THREE.Mesh(caneGeo, caneMat);
        cane.position.set(0.45, 0.6, 0.2);
        group.add(cane);
      } else if (c.role === 'brigadist') {
        // Helmet for Lucas Mendes
        const helmetGeo = new THREE.ConeGeometry(0.45, 0.35, 12);
        const helmetMat = new THREE.MeshStandardMaterial({ color: 0xeab308 });
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.y = 2.3;
        group.add(helmet);
      } else if (c.role === 'nurse_pse') {
        // Medical cross badge for Dra. Ana
        const badgeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.05);
        const badgeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const badge = new THREE.Mesh(badgeGeo, badgeMat);
        badge.position.set(-0.2, 1.45, 0.22);
        group.add(badge);
      }
    }

    // PFF2 protective mask (toggled on/off)
    const maskGeo = new THREE.BoxGeometry(0.35 * scale, 0.22 * scale, 0.2 * scale);
    const maskMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });
    const mask = new THREE.Mesh(maskGeo, maskMat);
    mask.name = 'pff2_mask';
    mask.position.set(0, (isWheelchair ? 1.8 : 2.0) * scale, 0.25 * scale);
    mask.visible = c.hasPff2Mask;
    group.add(mask);

    return group;
  }

  /* -------------------------------------------------------------
   * REAL-TIME WEATHER PARTICLE SYSTEMS
   * ----------------------------------------------------------- */
  private initWeatherParticleSystems() {
    // 1. Wildfire smoke & particulate MP2.5 (Billowing ash particles)
    const smokeCount = this.isSoftwareGl ? 300 : 900;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3] = (Math.random() - 0.5) * 120;
      smokePos[i * 3 + 1] = Math.random() * 35 + 2;
      smokePos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0x78716c,
      size: 1.8,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
    });
    this.smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    this.smokeParticles.visible = false;
    this.weatherFxGroup.add(this.smokeParticles);

    // 2. Torrential Rain particles (Rio Meia Ponte flood)
    const rainCount = this.isSoftwareGl ? 500 : 1800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 140;
      rainPos[i * 3 + 1] = Math.random() * 45;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.9,
      transparent: true,
      opacity: 0.75,
    });
    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.weatherFxGroup.add(this.rainParticles);

    // 3. Heatwave thermal shimmer particles
    const heatCount = this.isSoftwareGl ? 200 : 600;
    const heatGeo = new THREE.BufferGeometry();
    const heatPos = new Float32Array(heatCount * 3);
    for (let i = 0; i < heatCount; i++) {
      heatPos[i * 3] = (Math.random() - 0.5) * 100;
      heatPos[i * 3 + 1] = Math.random() * 18 + 0.5;
      heatPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    heatGeo.setAttribute('position', new THREE.BufferAttribute(heatPos, 3));
    const heatMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 1.4,
      transparent: true,
      opacity: 0.35,
    });
    this.heatShimmerParticles = new THREE.Points(heatGeo, heatMat);
    this.heatShimmerParticles.visible = false;
    this.weatherFxGroup.add(this.heatShimmerParticles);

    // 4. Dust Storm (Haboob do Cerrado)
    const dustCount = this.isSoftwareGl ? 400 : 1200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 130;
      dustPos[i * 3 + 1] = Math.random() * 25 + 0.5;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 130;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xb45309,
      size: 2.2,
      transparent: true,
      opacity: 0.65,
    });
    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.dustParticles.visible = false;
    this.weatherFxGroup.add(this.dustParticles);

    // 5. Aedes aegypti mosquito swarm
    const mosqCount = 180;
    const mosqGeo = new THREE.BufferGeometry();
    const mosqPos = new Float32Array(mosqCount * 3);
    for (let i = 0; i < mosqCount; i++) {
      mosqPos[i * 3] = -11 + (Math.random() - 0.5) * 20; // near river / puddles
      mosqPos[i * 3 + 1] = Math.random() * 4 + 0.5;
      mosqPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    mosqGeo.setAttribute('position', new THREE.BufferAttribute(mosqPos, 3));
    const mosqMat = new THREE.PointsMaterial({
      color: 0x0f172a,
      size: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    this.mosquitoParticles = new THREE.Points(mosqGeo, mosqMat);
    this.mosquitoParticles.visible = false;
    this.weatherFxGroup.add(this.mosquitoParticles);
  }

  public setWeatherState(weather: WeatherEventType, temperature: number) {
    this.currentWeatherType = weather;

    // Reset visibility
    if (this.smokeParticles) this.smokeParticles.visible = weather === 'wildfire';
    if (this.rainParticles) this.rainParticles.visible = weather === 'flood';
    if (this.heatShimmerParticles) this.heatShimmerParticles.visible = weather === 'heatwave';
    if (this.dustParticles) this.dustParticles.visible = weather === 'dust_storm';
    if (this.mosquitoParticles) this.mosquitoParticles.visible = weather === 'dengue_outbreak';

    // Dynamic Atmosphere & Fog Palette
    if (weather === 'heatwave') {
      const heatSky = new THREE.Color(0xfef3c7);
      this.scene.background = heatSky;
      this.scene.fog = new THREE.FogExp2(0xfde68a, 0.015);
      this.dirLight.color.setHex(0xffedd5);
      this.dirLight.intensity = 1.9;
    } else if (weather === 'wildfire') {
      const smokeSky = new THREE.Color(0x78716c);
      this.scene.background = smokeSky;
      this.scene.fog = new THREE.FogExp2(0xa8a29e, 0.024); // dense MP2.5 haze
      this.dirLight.color.setHex(0xf97316); // Amber glowing sun through smoke
      this.dirLight.intensity = 1.1;
    } else if (weather === 'flood') {
      const rainSky = new THREE.Color(0x334155);
      this.scene.background = rainSky;
      this.scene.fog = new THREE.FogExp2(0x475569, 0.018);
      this.dirLight.color.setHex(0x94a3b8);
      this.dirLight.intensity = 0.8;
    } else if (weather === 'dust_storm') {
      const dustSky = new THREE.Color(0x9a3412);
      this.scene.background = dustSky;
      this.scene.fog = new THREE.FogExp2(0xc2410c, 0.022);
      this.dirLight.color.setHex(0xfb923c);
      this.dirLight.intensity = 0.9;
    } else {
      // Clear Cerrado Day
      const clearSky = new THREE.Color(0xdceefb);
      this.scene.background = clearSky;
      this.scene.fog = new THREE.FogExp2(0xdceefb, 0.012);
      this.dirLight.color.setHex(0xfff2ce);
      this.dirLight.intensity = 1.4;
    }

    // River Water level reacts to flood
    if (this.riverMesh) {
      this.riverMesh.position.y = weather === 'flood' ? 0.85 : this.riverBaseY;
    }
  }

  /* -------------------------------------------------------------
   * DYNAMIC IPÊ PLANTING IN BACKYARD GARDENS
   * ----------------------------------------------------------- */
  public plantIpeInHouseGarden(houseId: string) {
    const house = this.buildingsGroup.getObjectByName(houseId);
    if (!house) return;

    // Place an Ipê Amarelo right in the backyard earth patch
    const patch = house.getObjectByName(`garden_patch_${houseId}`);
    if (patch) {
      const pos = new THREE.Vector3();
      patch.getWorldPosition(pos);
      const tree = this.createIpeAmareloTree(pos.x, pos.z, 0.9);
      this.plantedIpesGroup.add(tree);
    }
  }

  /* -------------------------------------------------------------
   * CAMERA PRESETS & CONTROLS
   * ----------------------------------------------------------- */
  public setCameraView(
    preset: 'overview' | 'residential' | 'community' | 'park' | 'river'
  ) {
    if (preset === 'overview') {
      this.targetLookAt.set(12, 0, 0);
      this.targetZoom = 38;
    } else if (preset === 'residential') {
      this.targetLookAt.set(20, 0, -15);
      this.targetZoom = 24;
    } else if (preset === 'community') {
      this.targetLookAt.set(22, 0, 16);
      this.targetZoom = 26;
    } else if (preset === 'park') {
      this.targetLookAt.set(40, 0, 0);
      this.targetZoom = 25;
    } else if (preset === 'river') {
      this.targetLookAt.set(-11, 0, 4);
      this.targetZoom = 24;
    }
  }

  public highlightEntity(x: number, z: number) {
    this.selectionRing.position.set(x, 0.12, z);
    this.selectionRing.visible = true;
  }

  public clearHighlight() {
    this.selectionRing.visible = false;
  }

  /* -------------------------------------------------------------
   * INTERACTION & RAYCASTING
   * ----------------------------------------------------------- */
  private setupEventListeners() {
    const el = this.renderer.domElement;

    // Mouse drag for isometric pan
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;
        this.lastMousePos = { x: e.clientX, y: e.clientY };

        // Pan in isometric diagonal directions
        const panFactor = 0.05 * (this.zoomLevel / 38);
        this.targetLookAt.x -= (dx - dy) * panFactor;
        this.targetLookAt.z += (dx + dy) * panFactor;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (this.isDragging) {
        this.isDragging = false;
      }
    };

    // Tap / Click selection
    const onClick = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouseVec, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.interactiveObjects,
        true
      );

      if (intersects.length > 0) {
        let pickedObj: THREE.Object3D | null = intersects[0].object;
        while (
          pickedObj &&
          !pickedObj.userData?.citizen &&
          !pickedObj.userData?.type &&
          pickedObj.parent
        ) {
          pickedObj = pickedObj.parent;
        }

        if (pickedObj && pickedObj.userData) {
          if (pickedObj.userData.citizen) {
            const cid = pickedObj.userData.id;
            this.highlightEntity(pickedObj.position.x, pickedObj.position.z);
            this.callbacks.onSelectCitizen?.(cid);
          } else if (pickedObj.userData.type) {
            const bid = pickedObj.userData.id;
            this.highlightEntity(pickedObj.position.x, pickedObj.position.z);
            this.callbacks.onSelectBuilding?.(bid);
          }
        }
      }
    };

    // Scroll to zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.targetZoom = THREE.MathUtils.clamp(
        this.targetZoom + e.deltaY * 0.04,
        14,
        65
      );
    };

    // Keyboard WASD for camera navigation
    const onKeyDown = (e: KeyboardEvent) => {
      const step = 2.5;
      if (e.key === 'w' || e.key === 'ArrowUp') {
        this.targetLookAt.x -= step;
        this.targetLookAt.z -= step;
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        this.targetLookAt.x += step;
        this.targetLookAt.z += step;
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        this.targetLookAt.x -= step;
        this.targetLookAt.z += step;
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        this.targetLookAt.x += step;
        this.targetLookAt.z -= step;
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('click', onClick);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    // Window resize
    const onResize = () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      const aspect = width / height;

      this.camera.left = -this.zoomLevel * aspect;
      this.camera.right = this.zoomLevel * aspect;
      this.camera.top = this.zoomLevel;
      this.camera.bottom = -this.zoomLevel;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);
  }

  /* -------------------------------------------------------------
   * ANIMATION & RENDER LOOP
   * ----------------------------------------------------------- */
  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.getElapsedTime();

    // 1. Smooth Camera Damping
    this.currentLookAt.lerp(this.targetLookAt, 0.08);
    this.zoomLevel = THREE.MathUtils.damp(this.zoomLevel, this.targetZoom, 8, dt);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.left = -this.zoomLevel * aspect;
    this.camera.right = this.zoomLevel * aspect;
    this.camera.top = this.zoomLevel;
    this.camera.bottom = -this.zoomLevel;
    this.camera.updateProjectionMatrix();

    this.camera.position.set(
      this.currentLookAt.x + 65,
      this.currentLookAt.y + 55,
      this.currentLookAt.z + 65
    );
    this.camera.lookAt(this.currentLookAt);

    // 2. Animate Water Ripples
    if (this.riverMesh) {
      const tex = (this.riverMesh.material as THREE.MeshStandardMaterial).map;
      if (tex) {
        tex.offset.y += dt * 0.08;
      }
    }

    // 3. Animate Particles
    // Smoke / MP2.5 drifting
    if (this.smokeParticles && this.smokeParticles.visible) {
      const positions = this.smokeParticles.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += dt * 5.0; // drift east with wind
        positions[i + 1] += dt * 1.5; // rise up
        if (positions[i] > 60) positions[i] = -60;
        if (positions[i + 1] > 38) positions[i + 1] = 2;
      }
      this.smokeParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Rain particles falling fast
    if (this.rainParticles && this.rainParticles.visible) {
      const positions = this.rainParticles.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= dt * 38;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 45;
        }
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Dust storm sand swept across
    if (this.dustParticles && this.dustParticles.visible) {
      const positions = this.dustParticles.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] -= dt * 18.0; // heavy haboob blast
        positions[i + 2] += dt * 4.0;
        if (positions[i] < -65) positions[i] = 65;
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Mosquitos hovering chaotically
    if (this.mosquitoParticles && this.mosquitoParticles.visible) {
      const positions = this.mosquitoParticles.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time * 8 + i) * 0.08;
        positions[i + 1] += Math.cos(time * 6 + i) * 0.05;
        positions[i + 2] += Math.sin(time * 7 + i) * 0.08;
      }
      this.mosquitoParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Selection ring spin
    if (this.selectionRing.visible) {
      this.selectionRing.rotation.z = time * 1.5;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
    }
  }
}
