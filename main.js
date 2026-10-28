/* =============================================================
   HOTEL OF TOMORROW — AR EDITION
   A simplified WebXR rebuild of the touchscreen kiosk experience:
   hotel selection -> walkthrough -> feedback.

   AR-only by design — the environment (sky/floor/stars) hides itself
   on session start so the hotel is seen composited over the real
   room via passthrough, not floating in a virtual void. Also renders
   as a plain 3D scene on a desktop browser so you can build/test
   before a headset is on site (drag to look around, click to select).
   ============================================================= */

import * as THREE from "three";

/* =============================================================
   PALETTE — kept consistent with the original kiosk design
   ============================================================= */

const PALETTE = {
  ink: "#0c1412",
  inkLight: "#16221e",
  glassBorder: "rgba(255,255,255,.16)",
  brass: "#c9a24a",
  teal: "#4fb59a",
  textWarm: "#f3efe6",
  textMuted: "#9fb0aa",
};

const FONT_DISPLAY = "Fraunces, Georgia, serif";
const FONT_BODY = "Manrope, Arial, sans-serif";

/* =============================================================
   HOTEL DATA
   ============================================================= */

const hotels = [
  {
    id: "01", name: "EcoSphere", accent: "rgba(70,210,140,.55)",
    themes: "NATURE · SUSTAINABILITY · WELLNESS",
    description: "EcoSphere imagines hospitality as a restorative environment connecting people, nature and wellbeing.",
    images: [
      { src: "images/ecosphere-juniortomorrow.png", label: "Junior Tomorrow Room", icon: "🛏️",
        description: "An entry-level smart room — AI-controlled lighting and climate in a compact, efficient layout. Ideal for short stays." },
      { src: "images/ecosphere-smartdeluxe.png", label: "Smart Deluxe Room", icon: "💡",
        description: "Adaptive LED walls and personalised entertainment for solo travellers and business guests wanting modern convenience." },
      { src: "images/ecosphere-orbitpremier.png", label: "Orbit Premier Room", icon: "🏙️",
        description: "More space, voice-activated ambience, and a partial skyline view — a balance of comfort and tech." },
      { src: "images/ecosphere-executivehorizon.png", label: "Executive Horizon Club Room", icon: "🏢",
        description: "Lounge access, panoramic city views, and a personalised workspace for executives and long-stay guests." },
      { src: "images/ecosphere-familydiscovery.png", label: "Family Discovery Suite", icon: "👨‍👩‍👧",
        description: "Modular furniture, dual sleeping zones, and interactive wall panels for kids — built for families." },
      { src: "images/ecosphere-infinitygalaxy.png", label: "Infinity Galaxy Suite", icon: "✨",
        description: "An infinity spa tub, panoramic skyline glass, and a private AI concierge. The flagship suite for VIPs and luxury seekers." },
    ],
    features: [
      ["🖼️", "Canvas", "The walls are LED screens you shape yourself — pick a mood before you arrive, from serene and minimal to bold and cinematic.", "images/ecosphere-canvas.png"],
      ["🛏️", "Haven", "A bed that adjusts angle, firmness and temperature on each side, tuned until sleep feels effortless."],
      ["🧬", "Helix", "The room remembers you — temperature, scent, music, even your coffee order — a little more each time you return."],
      ["⏱️", "WatchCycle", "Laundry timers link straight to the room's screen, so a notification catches you exactly when the cycle ends.", "images/ecosphere-watchcycle.png"],
    ],
  },
  {
    id: "02", name: "Nexus Hotel", accent: "rgba(70,220,235,.55)",
    themes: "AI · TECHNOLOGY · WELLNESS",
    description: "A next-generation luxury eco-hotel designed for the future of hospitality — AI-powered services, immersive experiences and sustainable biophilic design, so guests reconnect with nature and experience tomorrow's hospitality today.",
    hero: "images/nexus.png",
    images: [
      { src: "images/nexus-smartdeluxe.png", label: "Smart Deluxe", icon: "🛏️",
        description: "Relax, recharge and reconnect — AI-powered room personalisation, an aromatherapy wellness experience, a smart sleep optimisation system, and a nature-inspired eco-luxury design." },
      { src: "images/nexus-aisuite.png", label: "Executive AI Suite", icon: "💼",
        description: "Work smarter, recover better — an AI productivity workspace, hologram meeting technology, a smart wellness dashboard, and a noise-cancelling executive environment." },
      { src: "images/nexus-presidential.png", label: "Presidential Future Room", icon: "✨",
        description: "Experience tomorrow before everyone else — a private wellness pod, an exclusive AR/VR entertainment suite, a smart wellness dashboard, and an auto-personalised luxury environment." },
    ],
    features: [
      ["🧠", "AI Personalisation", "Every room reads you — lighting, temperature and mood adjust themselves before you notice."],
      ["💆", "Wellness Dashboard", "Aromatherapy, sleep optimisation and a live wellness readout, tuned to how you're actually doing."],
      ["🧊", "Hologram Technology", "Holographic meetings and concierge service — full presence, without needing anyone in the room."],
      ["🥽", "AR/VR Entertainment", "A private suite for immersive entertainment — step into another world without leaving the room."],
    ],
  },
  {
    id: "03", name: "The Elysium", accent: "rgba(220,170,90,.55)",
    themes: "LUXURY · IMMERSION · EXPERIENCE",
    description: "Overlooking Orchard Road, The Elysium is a refined luxury hotel where every realm rises in scale and sophistication — from an effortless 45 sqm retreat to a 500 sqm penthouse crowned by a private infinity pool and 360° skyline views.",
    images: [
      { src: "images/elysium-nova.png", label: "Nova Realm", icon: "🛏️",
        description: "A refined futuristic retreat overlooking Orchard Road, the 45 sqm NOVA Realm is designed for effortless comfort." },
      { src: "images/elysium-orbit.png", label: "Orbit Realm", icon: "🏙️",
        description: "A spacious urban escape with enhanced views of Orchard Road, the 60 sqm ORBIT Realm is made for guests who enjoy elevated comfort." },
      { src: "images/elysium-nexus.png", label: "Nexus Realm", icon: "💼",
        description: "Created for the modern business traveller, the 75 sqm NEXUS Realm combines private workspace and intelligent room technology for a seamless executive stay." },
      { src: "images/elysium-aurora.png", label: "Aurora Suite", icon: "🎬",
        description: "A cinematic junior suite with a separate living area, the 90 sqm AURORA Realm is a stay that feels both personal and unforgettable." },
      { src: "images/elysium-celestia.png", label: "Celestia Suite", icon: "✨",
        description: "Luxury is reimagined in the 120 sqm CELESTIA Realm, creating an elegant sanctuary at the heart of Orchard Road." },
      { src: "images/elysium-infinity.png", label: "Infinity Residence", icon: "🏛️",
        description: "An exclusive presidential residence designed for privacy and prestige, the 250 sqm INFINITY Residence features multiple bedrooms, a private wellness room, butler service, and elevated access to The Elysium's finest facilities." },
      { src: "images/elysium-thecrown.png", label: "The Crown", icon: "👑",
        description: "Occupying the entire top floor, the 500 sqm Crown is the highest expression of The Elysium experience — complete with private elevator access, an infinity pool, sky garden and a 360° Singapore skyline view, crafted for memories that last a lifetime." },
    ],
    features: [
      ["🏍️", "Volt Lightcycle Experience", "Tron-inspired lightcycle vehicles run a smart underground transport network with dedicated routes — fast, futuristic and complimentary across Orchard Road."],
      ["🦕", "Elysium Hologram Safari", "The world's first luxury hotel hologram zoo — AI and holographic technology bring life-sized animals, including dinosaurs, into immersive habitats for interactive, AR-powered encounters."],
      ["🎰", "Elysium Sky Casino", "An exclusive casino high above Singapore's skyline, pairing world-class gaming and AI-powered holographic tables with a floating glass sky deck and a members-only VIP club."],
      ["💪", "AI Smart Fitness Centre", "AI personal trainers and smart equipment track every rep in real time, building a customised fitness and nutrition plan around each guest."],
      ["🧖", "Infinity Wellness Spa", "Floating treatment rooms overlooking the skyline blend traditional spa therapy with cryotherapy, aromatherapy and sound therapy for complete recovery."],
      ["🥂", "VIP Club", "A hidden, members-only lounge connected to the Sky Casino — private gaming rooms, a cigar lounge and personalised butler service for celebrities, royalty and distinguished guests."],
      ["🏊", "Infinity Sky Pool", "An infinity-edge sky pool on Level 50 with glass-bottom viewing sections, private cabanas and poolside dining — built for sunset swims and skyline views."],
      ["🍽️", "The Falls Restaurant", "Modern Pan-Asian fine dining beside Elysium's grand indoor waterfall, drawing on Singaporean, Japanese, Thai and Korean flavours amid lush rainforest surroundings."],
    ],
  },
  {
    id: "04", name: "The Hestia", accent: "rgba(120,180,230,.55)",
    aidenHome: true, // AIDEN "lives" here — special greeting + requests on the Features page
    themes: "LUXURY · AI · HOSPITALITY",
    description: "The Hestia is the future of luxury hospitality — sprawling suites paired with signature technology and a personal AI butler, AIDEN, redefining what a hotel stay can be.",
    images: [
      { src: "images/hestia-sky.png", label: "Sky Suite", icon: "🌃",
        description: "The ultimate expression of luxury at The Hestia. A sprawling two-bedroom sky suite with an infinity plunge pool, private cinema, outdoor sky garden terrace, and every signature technology the hotel has to offer — all yours for the night." },
      { src: "images/hestia-celestial.png", label: "Celestial Suite", icon: "🔭",
        description: "An extraordinary suite for the discerning guest. The Celestial Suite features a private sauna, massage room, observatory lounge with telescope, full kitchen, and dedicated butler team — redefining what a hotel stay can be." },
      { src: "images/hestia-horizon.png", label: "Horizon Suite", icon: "🛋️",
        description: "Sweeping city views and a world of space to call your own. The Horizon Suite offers a separate living room, private steam room, premium home theatre, and a dedicated concierge paired with AIDEN — your personal AI butler." },
      { src: "images/hestia-aurora.png", label: "Aurora Room", icon: "🛁",
        description: "All the hallmarks of The Hestia luxury in a thoughtfully designed space. The Aurora Room features smart glass privacy walls, a heated marble bathroom, Japanese soaking tub, and full access to every facility the hotel has to offer." },
    ],
    features: [
      ["🤖", "AIDEN — Your AI Butler", "A dedicated AI concierge paired with every suite, anticipating what you need before you ask."],
      ["🛎️", "Signature Technology", "Every suite comes fitted with the hotel's own signature technology, no request too specific."],
    ],
  },
];

/* =============================================================
   AIDEN — WHAT THE GUIDE SAYS
   Edit any line freely. Words in {curly brackets} are filled in
   automatically: {hotel}, {room}, {feature}, {description}.
   ============================================================= */

const AIDEN_LINES = {
  welcome: "Welcome to the Hotel of Tomorrow. I'm AIDEN, your guide. Point at a hotel and pinch your fingers to step inside.",
  selection: "Four hotels, four futures. Which one would you like to visit?",
  selectionHint: "Hold your hand up, point the ray at a hotel card, then pinch your thumb and finger together to select it.",
  hub: "Welcome to {hotel}. Explore the rooms, or discover the features that make it different.",
  hubHome: "Welcome to The Hestia. This is where I live. Visit The Features, and you can ask me for something.",
  hubHint: "Choose The Rooms to see where you would stay, or The Features to see what's new.",
  rooms: "These are the rooms at {hotel}. Pick one to step inside.",
  roomsHint: "Turn your head to see every room, then point at a photo and pinch to open it.",
  roomDetail: "This is the {room}. {description}",
  features: "Pick a feature, and watch the room react.",
  featuresHome: "Pick a feature, or try one of the requests above, and I'll take care of it.",
  featurePicked: "{feature}. {description}",
  // Buttons shown on The Hestia's Features page. effect: "dim" | "warm" | "celebrate"
  homeRequests: [
    { icon: "🌙", label: "Dim the lights", effect: "dim", reply: "Of course. Lights down, nice and calm." },
    { icon: "🌅", label: "Golden hour", effect: "warm", reply: "Golden hour, coming right up." },
    { icon: "✨", label: "Surprise me", effect: "celebrate", reply: "A little celebration, just for you." },
  ],
};

function fillLine(line, vars = {}) {
  return line.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

/* =============================================================
   RENDERER / SCENE / CAMERA
   ============================================================= */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.set(0, 1.6, 0);

const userRig = new THREE.Group();
userRig.add(camera);
scene.add(userRig);

// Render AR slightly above the headset's default resolution so text and
// photos stay crisp. Drop this to 1.0 if the HoloLens starts to stutter.
const XR_RESOLUTION_SCALE = 1.25;
// Eye height the whole layout is designed around.
const EYE_HEIGHT = 1.6;

// The headset's floor estimate is often off (and guests vary in height,
// or sit down), so a moment after AR starts the rig is shifted to put the
// wearer's real eyes at EYE_HEIGHT — the panels then land at eye level
// for everyone. Waits a few frames so the camera holds a real head pose.
const RECENTER_DELAY_FRAMES = 5;
let recenterFramesLeft = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");
document.body.appendChild(renderer.domElement);

/* -------------------------------------------------------------
   ENTRY BUTTON
   Starts AR ourselves instead of via three.js's ARButton. ARButton
   always asks for "local-floor"; if the headset can't provide it,
   three.js fails silently and the HoloLens sits on the Edge logo
   forever. Here we check first and fall back to "local" (origin at
   the headset), lifting the rig so the floor-based layout still lands
   at eye level. Any failure is shown on the page instead of hanging.
   ------------------------------------------------------------- */

const arStatus = document.getElementById("arStatus");

function showARStatus(message) {
  if (!arStatus) return;
  arStatus.textContent = message;
  arStatus.hidden = !message;
}

async function startAR(button) {
  showARStatus("");
  unlockAudio();
  button.disabled = true;

  let session;
  try {
    session = await navigator.xr.requestSession("immersive-ar", { optionalFeatures: ["local-floor"] });
  } catch (err) {
    showARStatus("Couldn't start AR: " + (err?.message || err));
    button.disabled = false;
    return;
  }

  try {
    try {
      await session.requestReferenceSpace("local-floor");
      renderer.xr.setReferenceSpaceType("local-floor");
      userRig.position.y = 0;
    } catch {
      renderer.xr.setReferenceSpaceType("local");
      userRig.position.y = EYE_HEIGHT;
    }
    renderer.xr.setFramebufferScaleFactor(XR_RESOLUTION_SCALE);
    await renderer.xr.setSession(session);
    recenterFramesLeft = RECENTER_DELAY_FRAMES;
    button.textContent = "Stop AR";
    session.addEventListener("end", () => {
      button.textContent = "Start AR";
      userRig.position.y = 0;
    });
  } catch (err) {
    session.end().catch(() => {});
    showARStatus("AR started but the scene couldn't load: " + (err?.message || err));
  }
  button.disabled = false;
}

async function mountEntryButton() {
  if (!window.isSecureContext) {
    showARStatus("AR needs a secure https:// link — open the GitHub Pages address instead.");
    return;
  }
  const arSupported =
    navigator.xr && (await navigator.xr.isSessionSupported("immersive-ar").catch(() => false));
  if (!arSupported) {
    console.info("Immersive AR isn't supported on this browser/device — running in desktop preview mode only.");
    return;
  }

  const button = document.createElement("button");
  button.id = "ARButton";
  button.textContent = "Start AR";
  button.addEventListener("click", () => {
    const session = renderer.xr.getSession();
    if (session) session.end();
    else startAR(button);
  });
  document.body.appendChild(button);
}

mountEntryButton();

// A script error inside AR leaves the headset frozen with no way to see
// what happened — drop back to the page and show the message instead.
window.addEventListener("error", (e) => {
  showARStatus("Something went wrong: " + e.message);
  renderer.xr.getSession()?.end().catch(() => {});
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =============================================================
   LIGHTING + ENVIRONMENT
   ============================================================= */

scene.add(new THREE.HemisphereLight(0x3a4a45, 0x0c1412, 0.8));
const sun = new THREE.DirectionalLight(0xcfe6df, 0.35);
sun.position.set(2, 4, 1);
scene.add(sun);

function makeSkyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#0a1210");
  grad.addColorStop(0.45, "#132420");
  grad.addColorStop(0.72, "#2a2a22");
  grad.addColorStop(1, "#07100e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return new THREE.CanvasTexture(canvas);
}

const sky = new THREE.Mesh(
  new THREE.SphereGeometry(40, 24, 24),
  new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide, fog: false })
);
scene.add(sky);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(12, 48),
  new THREE.MeshStandardMaterial({ color: 0x171e1c, roughness: 1 })
);
floor.rotation.x = -Math.PI / 2;
// Pure backdrop: draw it first and never let it hide panels in front of it
// (low panels were getting clipped by the floor in the desktop preview).
floor.renderOrder = -1;
floor.material.depthWrite = false;
scene.add(floor);

renderer.xr.addEventListener("sessionstart", () => {
  const session = renderer.xr.getSession();
  const isAR = session && session.environmentBlendMode !== "opaque";
  sky.visible = !isAR;
  floor.visible = !isAR;
});

renderer.xr.addEventListener("sessionend", () => {
  sky.visible = true;
  floor.visible = true;
});

/* -------------------------------------------------------------
   STARFIELD + HORIZON GLOW
   Two small additions to keep the "afterhours" sky from reading as a
   flat, empty gradient: a scattering of static stars (sized/tinted at
   creation rather than animated per-frame — cheap, and still reads as
   varied rather than uniform), and a soft additive glow band near the
   horizon whose color re-tints to whichever hotel's accent is active,
   so the room itself feels tied to the space around it.
   ------------------------------------------------------------- */

function makeStarLayer(count, size, opacity) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    // Bias toward the upper half of the sky so stars don't clutter the
    // horizon band or dip below eye level.
    const phi = Math.acos(Math.random()) * 0.92;
    const r = 30 + Math.random() * 4;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) + 2;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xf3efe6, size, opacity, transparent: true, depthWrite: false, sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

const starGroup = new THREE.Group();
starGroup.add(makeStarLayer(260, 0.05, 0.45));
starGroup.add(makeStarLayer(50, 0.09, 0.8));
scene.add(starGroup);

function makeHorizonGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.55, "rgba(255,255,255,0)");
  grad.addColorStop(0.72, "rgba(255,255,255,.55)");
  grad.addColorStop(0.86, "rgba(255,255,255,.15)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return new THREE.CanvasTexture(canvas);
}

const horizonGlow = new THREE.Mesh(
  new THREE.SphereGeometry(38, 24, 24),
  new THREE.MeshBasicMaterial({
    map: makeHorizonGlowTexture(),
    color: 0xc9a24a,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  })
);
scene.add(horizonGlow);

// Called whenever a hotel-specific scene builds, so the environment glow
// matches whatever's currently being explored; hotel selection resets it
// to the neutral brass default.
function setEnvironmentAccent(color) {
  horizonGlow.material.color.copy(color);
}

renderer.xr.addEventListener("sessionstart", () => {
  const session = renderer.xr.getSession();
  const isAR = session && session.environmentBlendMode !== "opaque";
  starGroup.visible = !isAR;
  horizonGlow.visible = !isAR;
});
renderer.xr.addEventListener("sessionend", () => {
  starGroup.visible = true;
  horizonGlow.visible = true;
});

/* =============================================================
   CANVAS PANEL HELPERS
   ============================================================= */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = text.split(" ");
  let line = "";
  let lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
      lines++;
      if (lines >= maxLines - 1) {
        ctx.fillText(line.trim() + (i < words.length - 1 ? "…" : ""), x, y);
        return;
      }
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

function canvasToPlane(canvas, worldWidth, worldHeight) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const geo = new THREE.PlaneGeometry(worldWidth, worldHeight);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.canvas = canvas;
  mesh.userData.texture = texture;
  return mesh;
}

function refreshPanel(mesh, drawFn) {
  const ctx = mesh.userData.canvas.getContext("2d");
  ctx.clearRect(0, 0, mesh.userData.canvas.width, mesh.userData.canvas.height);
  drawFn(ctx);
  mesh.userData.texture.needsUpdate = true;
}

// Feature panels can optionally show a real photo instead of just an emoji
// glyph. Images load async, so this caches them and hands back null until
// the given src is ready — the caller re-draws once onReady fires.
const featureImageCache = {};
function getFeatureImage(src, onReady) {
  let img = featureImageCache[src];
  if (!img) {
    img = new Image();
    img.src = src;
    featureImageCache[src] = img;
  }
  if (img.complete && img.naturalWidth > 0) return img;
  img.addEventListener("load", onReady, { once: true });
  return null;
}

// Source photos are screen-captures and often carry a thin white border
// from however they were cropped. Rather than trust every file to be
// pixel-clean, sample slightly inside the image's own edges so any such
// border falls outside the visible area instead of showing up as a frame
// around the photo.
function cropTextureBorder(tex, margin = 0.035) {
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1 - margin * 2, 1 - margin * 2);
  tex.offset.set(margin, margin);
}

// Same border-trim, for images drawn straight into a canvas (cover-fit into
// a destination rect) rather than mapped onto a plane as a texture.
function drawImageCoverCropped(ctx, img, dx, dy, dw, dh, margin = 0.035) {
  const sx = img.width * margin, sy = img.height * margin;
  const sw = img.width * (1 - margin * 2), sh = img.height * (1 - margin * 2);
  const scale = Math.max(dw / sw, dh / sh);
  const drawW = sw * scale, drawH = sh * scale;
  ctx.drawImage(img, sx, sy, sw, sh, dx + (dw - drawW) / 2, dy + (dh - drawH) / 2, drawW, drawH);
}

function parseAccent(rgbaString) {
  const parts = rgbaString.match(/rgba?\(([^)]+)\)/)?.[1].split(",").map(Number);
  if (!parts) return new THREE.Color(0xc9a24a);
  const [r, g, b] = parts;
  return new THREE.Color(r / 255, g / 255, b / 255);
}

// Same HUD-corner-bracket language used on the feature panels, but as real
// geometry framing a flat plane (a loaded photo) instead of drawn into a
// canvas texture.
function makeCornerBrackets(width, height, color, armLength = 0.12) {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const hw = width / 2, hh = height / 2;
  const corners = [
    [-hw, hh, 1, -1],
    [hw, hh, -1, -1],
    [-hw, -hh, 1, 1],
    [hw, -hh, -1, 1],
  ];
  corners.forEach(([cx, cy, dx, dy]) => {
    const points = [
      new THREE.Vector3(cx, cy + dy * armLength, 0.001),
      new THREE.Vector3(cx, cy, 0.001),
      new THREE.Vector3(cx + dx * armLength, cy, 0.001),
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat));
  });
  return group;
}

// The card's own hero shot: a hotel-wide image if one was captured
// (Nexus has one), otherwise the first room photo — real photography
// instead of a generic dark card, with a graceful gradient+icon
// fallback for hotels that don't have real images yet.
function getHotelHeroSrc(hotel) {
  if (hotel.hero) return hotel.hero;
  const first = hotel.images?.[0];
  return typeof first === "string" ? first : first?.src;
}

function drawHotelCard(ctx, hotel, onImageReady) {
  const w = 1024, h = 620;

  roundRect(ctx, 0, 0, w, h, 18);
  ctx.save();
  ctx.clip();

  const heroSrc = getHotelHeroSrc(hotel);
  const img = heroSrc ? getFeatureImage(heroSrc, onImageReady || (() => {})) : null;

  if (img) {
    drawImageCoverCropped(ctx, img, 0, 0, w, h);
  } else {
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, PALETTE.ink);
    base.addColorStop(1, PALETTE.inkLight);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = "center";
    ctx.font = "110px Arial";
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.fillText(hotel.features[0]?.[0] || "🏨", w / 2, h * 0.42);
    ctx.textAlign = "left";
  }

  const scrim = ctx.createLinearGradient(0, h * 0.3, 0, h);
  scrim.addColorStop(0, "rgba(9,15,13,0)");
  scrim.addColorStop(1, "rgba(7,12,11,.97)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();

  ctx.fillStyle = "rgba(12,20,18,.55)";
  roundRect(ctx, 24, 24, 68, 36, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.brass;
  ctx.font = `600 18px ${FONT_BODY}`;
  ctx.fillText("N°" + hotel.id, 35, 48);

  ctx.fillStyle = PALETTE.brass;
  ctx.font = `600 19px ${FONT_BODY}`;
  ctx.fillText(hotel.themes, 44, h - 178);

  ctx.fillStyle = PALETTE.textWarm;
  ctx.font = `400 46px ${FONT_DISPLAY}`;
  ctx.fillText(hotel.name, 42, h - 128);

  ctx.fillStyle = PALETTE.textMuted;
  ctx.font = `22px ${FONT_BODY}`;
  wrapText(ctx, hotel.description, 44, h - 92, w - 90, 27, 2);

  ctx.fillStyle = PALETTE.textWarm;
  ctx.font = `600 20px ${FONT_BODY}`;
  ctx.fillText("ENTER →", 44, h - 30);

  ctx.strokeStyle = PALETTE.glassBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, 1, 1, w - 2, h - 2, 18);
  ctx.stroke();
}

function drawButton(ctx, w, h, label, { selected = false, accent = PALETTE.teal, icon = "" } = {}) {
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  if (selected) {
    ctx.shadowColor = accent;
    ctx.shadowBlur = 26;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, "rgba(255,255,255,.7)");
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = "rgba(255,255,255,.05)";
  }
  roundRect(ctx, 0, 0, w, h, h / 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = selected ? "rgba(255,255,255,.45)" : "rgba(255,255,255,.18)";
  ctx.lineWidth = 3;
  roundRect(ctx, 3, 3, w - 6, h - 6, h / 2 - 3);
  ctx.stroke();

  ctx.fillStyle = selected ? PALETTE.ink : PALETTE.textWarm;
  ctx.font = `600 ${Math.floor(h * 0.28)}px ${FONT_BODY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((icon ? icon + "  " : "") + label, w / 2, h / 2 + 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function makeButton(label, opts = {}, worldWidth = 0.6, worldHeight = 0.18) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 270;
  const ctx = canvas.getContext("2d");
  drawButton(ctx, canvas.width, canvas.height, label, opts);
  const mesh = canvasToPlane(canvas, worldWidth, worldHeight);
  mesh.userData.label = label;
  mesh.userData.opts = opts;
  return mesh;
}

function drawTitlePanel(ctx, w, h, eyebrow, title, body) {
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.brass;
  ctx.font = `600 26px ${FONT_BODY}`;
  ctx.fillText(eyebrow, w / 2, 60);

  ctx.fillStyle = PALETTE.textWarm;
  ctx.font = `400 80px ${FONT_DISPLAY}`;
  ctx.fillText(title, w / 2, 150);

  if (body) {
    ctx.fillStyle = PALETTE.textMuted;
    const lines = body.split("\n");
    // Long descriptions shrink to fit instead of running off both edges.
    let size = 28;
    ctx.font = `${size}px ${FONT_BODY}`;
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
    if (widest > w - 60) {
      size = Math.max(18, Math.floor((size * (w - 60)) / widest));
      ctx.font = `${size}px ${FONT_BODY}`;
    }
    lines.forEach((line, i) => ctx.fillText(line, w / 2, 210 + i * (size + 10)));
  }
  ctx.textAlign = "left";
}

/* =============================================================
   SOUND EFFECTS
   Tiny synthesized blips via Web Audio — no audio files to upload.
   Browsers only allow sound after a real click, so unlockAudio() is
   called from the Start AR button and the first desktop click.
   ============================================================= */

let audioCtx = null;
let audioUnlocked = false;

function unlockAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx && AudioCtor) audioCtx = new AudioCtor();
  audioCtx?.resume?.();
  audioUnlocked = true;
}

function tone(freq, delay, duration, volume) {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

let lastHoverSound = 0;
const sfx = {
  hover() {
    const now = performance.now();
    if (now - lastHoverSound < 120) return; // hand jitter shouldn't machine-gun ticks
    lastHoverSound = now;
    tone(1320, 0, 0.06, 0.035);
  },
  select() {
    tone(660, 0, 0.09, 0.08);
    tone(990, 0.06, 0.12, 0.06);
  },
  chime() {
    tone(784, 0, 0.4, 0.05);
    tone(1175, 0.12, 0.5, 0.04);
  },
};

/* =============================================================
   INTERACTION SYSTEM
   ============================================================= */

const raycaster = new THREE.Raycaster();
let interactiveObjects = [];
let hitTargets = [];
let hovered = null;
let dwellStart = 0;
const DWELL_MS = 1200;

// Every flat button/card gets an invisible, slightly larger "hit pad", so a
// shaky hand ray that lands just off the edge still counts as a hit.
const HIT_MARGIN = 0.04;
const hitPadMaterial = new THREE.MeshBasicMaterial({ visible: false });

/* -------------------------------------------------------------
   IDLE TIMEOUT — a kiosk left untouched should reset itself back
   to hotel selection rather than leaving whoever walks up next
   stranded deep in a stranger's room-detail or feature page.
   ------------------------------------------------------------- */

const IDLE_TIMEOUT_SECONDS = 60;
let lastActivityTime = 0;
let isAtHotelSelection = true;

function markActivity() {
  lastActivityTime = clock.elapsedTime;
}

const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.008, 0.014, 24),
  new THREE.MeshBasicMaterial({ color: 0xf8f5ed, transparent: true, opacity: 0.9, depthTest: false })
);
reticle.renderOrder = 999;
scene.add(reticle);

const dwellRing = new THREE.Mesh(
  new THREE.RingGeometry(0.016, 0.022, 24),
  new THREE.MeshBasicMaterial({ color: 0x8b6f3d, transparent: true, opacity: 0.95, depthTest: false })
);
dwellRing.renderOrder = 999;
dwellRing.visible = false;
scene.add(dwellRing);

function hitTargetFor(obj) {
  if (obj.userData.hitPad) return obj.userData.hitPad;
  if (obj.geometry?.type !== "PlaneGeometry") return obj;
  const { width, height } = obj.geometry.parameters;
  const pad = new THREE.Mesh(
    new THREE.PlaneGeometry(width + HIT_MARGIN * 2, height + HIT_MARGIN * 2),
    hitPadMaterial
  );
  pad.userData.owner = obj;
  obj.add(pad);
  obj.userData.hitPad = pad;
  return pad;
}

// AIDEN is always clickable, on every scene.
function setInteractive(list) {
  interactiveObjects = [...list, aiden.group];
  hitTargets = interactiveObjects.map(hitTargetFor);
}

// Raycast against the hit pads, but report the real object they belong to.
function pick() {
  // Hidden buttons (e.g. Exit AR outside a headset) shouldn't catch the ray.
  const hit = raycaster
    .intersectObjects(hitTargets, false)
    .find((h) => (h.object.userData.owner || h.object).visible);
  if (!hit) return null;
  const { object, point, distance } = hit;
  return { object: object.userData.owner || object, point, distance };
}

const _rayRotation = new THREE.Matrix4();
function pickFromController(controller) {
  _rayRotation.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(_rayRotation);
  return pick();
}

function fireSelect(mesh) {
  markActivity();
  if (mesh && typeof mesh.userData.onSelect === "function") {
    sfx.select();
    mesh.userData.onSelect();
  }
}

// On HoloLens each tracked hand shows up as a "controller". A hand that
// leaves the sensors' view disconnects, and the render loop falls back to
// look-and-hold (gaze dwell) whenever no hand is currently tracked.
function setupController(index) {
  const controller = renderer.xr.getController(index);

  const rayGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -5),
  ]);
  const ray = new THREE.Line(
    rayGeo,
    new THREE.LineBasicMaterial({ color: 0xf8f5ed, transparent: true, opacity: 0.5 })
  );
  ray.name = "ray";
  ray.scale.z = 0.4;
  controller.add(ray);

  controller.addEventListener("connected", () => {
    controller.userData.connected = true;
  });
  controller.addEventListener("disconnected", () => {
    controller.userData.connected = false;
  });

  // Pick from where *this* hand points at the moment of the pinch, not
  // whatever either hand happened to be hovering on the last frame.
  controller.addEventListener("selectstart", () => {
    markActivity();
    const hit = pickFromController(controller);
    if (hit) fireSelect(hit.object);
  });

  // Inside the rig, so hands stay lined up with the head when the rig is
  // lifted for the no-floor-tracking fallback.
  userRig.add(controller);
  return controller;
}

const controller0 = setupController(0);
const controller1 = setupController(1);

let isDragging = false;
let dragDistance = 0;
let lastX = 0, lastY = 0;
let yaw = 0, pitch = 0;
const mouseNDC = new THREE.Vector2(0, 0);

// Track the actual cursor position in normalized device coordinates
// so desktop clicks pick whatever is visually under the pointer —
// not just whatever's dead-center of the screen.
window.addEventListener("pointermove", (e) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNDC.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
});

renderer.domElement.addEventListener("pointerdown", (e) => {
  if (renderer.xr.isPresenting) return;
  markActivity();
  unlockAudio();
  isDragging = true;
  dragDistance = 0;
  lastX = e.clientX; lastY = e.clientY;
  hideDesktopHint();
});
window.addEventListener("pointerup", () => (isDragging = false));
window.addEventListener("pointermove", (e) => {
  if (!isDragging || renderer.xr.isPresenting) return;
  markActivity();
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
  dragDistance += Math.abs(dx) + Math.abs(dy);
  yaw -= dx * 0.0025;
  pitch -= dy * 0.0025;
  pitch = Math.max(-1.2, Math.min(1.2, pitch));
});

renderer.domElement.addEventListener("click", () => {
  if (renderer.xr.isPresenting) return;
  if (dragDistance > 6) return; // that was a look-around drag, not a click
  if (hovered) fireSelect(hovered);
});

/* =============================================================
   SCENE / STATE MANAGEMENT
   ============================================================= */

const worldGroup = new THREE.Group();
scene.add(worldGroup);

const fadePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  new THREE.MeshBasicMaterial({ color: 0x14211f, transparent: true, opacity: 0, depthTest: false })
);
fadePlane.renderOrder = 1000;
camera.add(fadePlane);
fadePlane.position.set(0, 0, -0.15);

function clearWorld() {
  worldGroup.userData.onFrame = null;
  while (worldGroup.children.length) {
    const obj = worldGroup.children.pop();
    obj.traverse?.((n) => {
      if (n.userData?.texture) n.userData.texture.dispose();
      if (n.geometry) n.geometry.dispose?.();
      if (n.material) n.material.dispose?.();
    });
  }
}

// The fade is stepped from the main render loop (updateTransition) rather
// than window.requestAnimationFrame, which can pause while an immersive
// session is running — a transition that never finishes looks like a
// click that did nothing.
const FADE_SECONDS = 0.22;
let transition = null;

function navigate(buildFn) {
  if (transition?.phase === "out") {
    transition.buildFn = buildFn; // a second click mid-fade just changes the destination
    return;
  }
  transition = { phase: "out", t: 0, buildFn };
}

function updateTransition(delta) {
  if (!transition) return;
  transition.t += Math.min(delta, 0.05) / FADE_SECONDS;

  if (transition.phase === "out") {
    fadePlane.material.opacity = Math.min(1, transition.t);
    if (transition.t >= 1) {
      clearWorld();
      setInteractive([]);
      transition.buildFn();
      // Each new scene assumes a forward-facing view — reset any
      // desktop-preview look-around so nothing appears tilted.
      if (!renderer.xr.isPresenting) {
        yaw = 0;
        pitch = 0;
      }
      transition = { phase: "in", t: 0 };
    }
  } else {
    fadePlane.material.opacity = Math.max(0, 1 - transition.t);
    if (transition.t >= 1) transition = null;
  }
}

/* =============================================================
   AIDEN — FLOATING AI BUTLER
   A glowing orb that floats at the lower-left of your view, following
   gently as you turn. It speaks each scene's line aloud (the browser's
   built-in text-to-speech) with a matching speech bubble, and tapping
   it repeats the line or gives a hint. Lines live in AIDEN_LINES.
   ============================================================= */

let aidenVoice = null;

function pickAidenVoice() {
  const english = window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
  aidenVoice =
    english.find((v) => /natural/i.test(v.name) && /GB/i.test(v.lang)) ||
    english.find((v) => /natural/i.test(v.name)) ||
    english.find((v) => /GB/i.test(v.lang)) ||
    english[0] ||
    null;
}

if ("speechSynthesis" in window) {
  pickAidenVoice();
  window.speechSynthesis.onvoiceschanged = pickAidenVoice; // voices load async in most browsers
}

function createAiden() {
  const group = new THREE.Group();
  const orb = new THREE.Group();
  group.add(orb);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xbff3ff })
  );
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.044, 24, 16),
    new THREE.MeshBasicMaterial({
      color: 0x4fc3e8, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.055, 0.0025, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0xc9a24a, transparent: true, opacity: 0.85 })
  );
  orb.add(core, shell, ring);

  // Generous invisible sphere so the small orb is easy to tap.
  const hit = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), hitPadMaterial);
  hit.userData.owner = group;
  group.add(hit);
  group.userData.hitPad = hit;

  const bubbleCanvas = document.createElement("canvas");
  bubbleCanvas.width = 1024;
  bubbleCanvas.height = 340;
  const bubble = canvasToPlane(bubbleCanvas, 0.6, 0.2);
  bubble.position.set(0.36, 0, 0); // to the right of the orb
  bubble.material.opacity = 0;
  bubble.material.depthWrite = false;
  bubble.visible = false;
  group.add(bubble);

  scene.add(group);

  let hint = "";
  let speaking = false;
  let bubbleUntil = 0;
  let placed = false;
  let currentUtterance = null;

  function drawBubble(text) {
    refreshPanel(bubble, (ctx) => {
      const w = 1024, h = 340;
      ctx.fillStyle = "rgba(12,20,18,.88)";
      roundRect(ctx, 4, 4, w - 8, h - 8, 28);
      ctx.fill();
      ctx.strokeStyle = "rgba(79,195,232,.6)";
      ctx.lineWidth = 3;
      roundRect(ctx, 4, 4, w - 8, h - 8, 28);
      ctx.stroke();

      ctx.fillStyle = PALETTE.brass;
      ctx.font = `600 26px ${FONT_BODY}`;
      ctx.fillText("AIDEN", 40, 58);

      ctx.fillStyle = PALETTE.textWarm;
      ctx.font = `30px ${FONT_BODY}`;
      wrapText(ctx, text, 40, 112, w - 80, 42, 5);
    });
  }

  function speak(text) {
    if (!audioUnlocked || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (aidenVoice) utterance.voice = aidenVoice;
    utterance.lang = aidenVoice?.lang || "en-GB";
    currentUtterance = utterance;
    utterance.onstart = () => {
      if (currentUtterance === utterance) speaking = true;
    };
    // cancel() fires end/error on the line being replaced — ignore those.
    utterance.onend = utterance.onerror = () => {
      if (currentUtterance !== utterance) return;
      speaking = false;
      bubbleUntil = clock.elapsedTime + 2.5;
    };
    window.speechSynthesis.speak(utterance);
  }

  // `nextHint` is what tapping the orb says; defaults to repeating the line.
  function say(text, nextHint) {
    hint = nextHint || text;
    drawBubble(text);
    sfx.chime();
    // Fallback timing for when speech is unavailable or blocked.
    bubbleUntil = clock.elapsedTime + 2.5 + text.split(/\s+/).length * 0.4;
    speak(text);
  }

  group.userData.onSelect = () => say(hint, hint);

  const offset = new THREE.Vector3(-0.34, -0.25, -1.3); // lower-left of view, ~1.4 m away
  const target = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const camQuat = new THREE.Quaternion();

  function update(delta, t) {
    camera.getWorldPosition(camPos);
    camera.getWorldQuaternion(camQuat);
    target.copy(offset).applyQuaternion(camQuat).add(camPos);
    if (!placed) {
      group.position.copy(target);
      placed = true;
    } else {
      group.position.lerp(target, 1 - Math.exp(-delta * 2.5)); // lazy follow
    }
    group.lookAt(camPos);

    orb.position.y = Math.sin(t * 1.6) * 0.01;
    ring.rotation.x = t * 0.9;
    ring.rotation.y = t * 0.6;
    shell.scale.setScalar(speaking ? 1 + 0.18 * Math.abs(Math.sin(t * 9)) : 1 + 0.05 * Math.sin(t * 2));
    shell.material.opacity = speaking ? 0.45 : 0.28;

    const bubbleTarget = speaking || t < bubbleUntil ? 1 : 0;
    bubble.material.opacity += (bubbleTarget - bubble.material.opacity) * Math.min(1, delta * 6);
    bubble.visible = bubble.material.opacity > 0.02;
  }

  return {
    group,
    say,
    update,
    snap: () => (placed = false), // jump straight into view (e.g. on AR start)
  };
}

const aiden = createAiden();

renderer.xr.addEventListener("sessionstart", () => {
  aiden.snap();
  aiden.say(AIDEN_LINES.welcome, AIDEN_LINES.selectionHint);
});

/* =============================================================
   SCENE 1 — HOTEL SELECTION
   ============================================================= */

let exitARButton = null;
renderer.xr.addEventListener("sessionstart", () => {
  if (exitARButton) exitARButton.visible = true;
});
renderer.xr.addEventListener("sessionend", () => {
  if (exitARButton) exitARButton.visible = false;
});

function buildHotelSelection() {
  isAtHotelSelection = true;
  setEnvironmentAccent(new THREE.Color(0xc9a24a));

  const title = canvasToPlane(
    (() => {
      const c = document.createElement("canvas");
      c.width = 1200; c.height = 260;
      drawTitlePanel(c.getContext("2d"), c.width, c.height, "THE COLLECTION · 04 FUTURES", "Choose your destination", "Look or point at a hotel, then select to step inside.");
      return c;
    })(),
    2.4, 0.525
  );
  title.position.set(0, 2.45, -2.3);
  worldGroup.add(title);

  // 2×2 grid ~2.2 m away — within HoloLens's comfortable range, and the
  // whole set fits in view with only a small head turn (the old 170° arc
  // at 3.6 m needed a full body turn and felt far away).
  const distance = 2.2;
  const cardW = 0.9, cardH = 0.55, gap = 0.12;
  const cols = 2;

  const interactive = [];

  hotels.forEach((hotel, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 620;
    const card = canvasToPlane(canvas, cardW, cardH);
    // The hero photo loads async — redraw this specific card once it's
    // ready instead of leaving it on the gradient+icon fallback forever.
    refreshPanel(card, (ctx) => drawHotelCard(ctx, hotel, () => refreshPanel(card, (c2) => drawHotelCard(c2, hotel))));

    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * (cardW + gap);
    const y = 1.85 - row * (cardH + gap);
    card.position.set(x, y, -distance);
    card.lookAt(0, 1.6, 0);

    card.userData.baseY = card.position.y;
    card.userData.phase = i * 0.7;
    card.userData.onSelect = () => {
      navigate(() => buildHotelHub(hotel));
    };

    worldGroup.add(card);
    interactive.push(card);
  });

  // The page's Stop AR button can't be seen inside the headset, so offer
  // a way out in the scene itself. Only shown while in AR.
  exitARButton = makeButton("✕  Exit AR", { accent: PALETTE.teal }, 0.6, 0.15);
  exitARButton.position.set(0, 0.62, -1.6); // below the bottom row of cards
  exitARButton.visible = renderer.xr.isPresenting;
  exitARButton.userData.onSelect = () => renderer.xr.getSession()?.end();
  worldGroup.add(exitARButton);
  interactive.push(exitARButton);

  setInteractive(interactive);
  aiden.say(AIDEN_LINES.selection, AIDEN_LINES.selectionHint);
}

/* =============================================================
   SCENE 2 — WALKTHROUGH
   ============================================================= */

function makePlaceholderTexture(hotel, icon) {
  const canvas = document.createElement("canvas");
  canvas.width = 640; canvas.height = 400;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 640, 400);
  grad.addColorStop(0, hotel.accent);
  grad.addColorStop(1, "rgba(255,255,255,.5)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 400);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(30,40,40,.55)";
  ctx.font = "90px Arial";
  ctx.fillText(icon || "🏨", 320, 210);
  ctx.font = "700 20px Arial";
  ctx.fillText(hotel.name.toUpperCase(), 320, 260);
  ctx.textAlign = "left";
  return canvas;
}

function buildHotelHub(hotel) {
  isAtHotelSelection = false;
  setEnvironmentAccent(parseAccent(hotel.accent));

  const intro = canvasToPlane(
    (() => {
      const c = document.createElement("canvas");
      c.width = 1200; c.height = 260;
      drawTitlePanel(c.getContext("2d"), c.width, c.height, hotel.themes, hotel.name, hotel.description.slice(0, 110) + (hotel.description.length > 110 ? "…" : ""));
      return c;
    })(),
    2.4, 0.525
  );
  intro.position.set(0, 2.35, -2.3); // y-range [2.09, 2.61]
  worldGroup.add(intro);

  const interactive = [];

  function makeChoiceCard(icon, title, subtitle) {
    const canvas = document.createElement("canvas");
    canvas.width = 700; canvas.height = 520;
    const ctx = canvas.getContext("2d");
    const base = ctx.createLinearGradient(0, 0, 0, 520);
    base.addColorStop(0, PALETTE.ink);
    base.addColorStop(1, PALETTE.inkLight);
    ctx.fillStyle = base;
    roundRect(ctx, 0, 0, 700, 520, 20);
    ctx.fill();
    ctx.strokeStyle = PALETTE.glassBorder;
    ctx.lineWidth = 1;
    roundRect(ctx, 1, 1, 698, 518, 20);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "120px Arial";
    ctx.fillStyle = PALETTE.textWarm;
    ctx.fillText(icon, 350, 220);

    ctx.font = `400 50px ${FONT_DISPLAY}`;
    ctx.fillText(title, 350, 320);

    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = `24px ${FONT_BODY}`;
    wrapText(ctx, subtitle, 350, 375, 580, 32, 3);

    ctx.fillStyle = PALETTE.brass;
    ctx.font = `600 22px ${FONT_BODY}`;
    ctx.fillText("ENTER →", 350, 480);
    ctx.textAlign = "left";

    return canvasToPlane(canvas, 1.1, 0.82);
  }

  // Cards: y-range [1.04, 1.86] — clear of the title above (bottom 2.09)
  const roomsCard = makeChoiceCard("🛏️", "The Rooms", "Room types you can step inside, from an entry-level smart room to the flagship suite.");
  roomsCard.position.set(-0.65, 1.45, -2.0);
  roomsCard.lookAt(0, 1.45, 0);
  roomsCard.userData.onSelect = () => navigate(() => buildRooms(hotel));
  worldGroup.add(roomsCard);
  interactive.push(roomsCard);

  const featuresCard = makeChoiceCard("🧬", "The Features", "The ideas and technology that make this hotel different.");
  featuresCard.position.set(0.65, 1.45, -2.0);
  featuresCard.lookAt(0, 1.45, 0);
  featuresCard.userData.onSelect = () => navigate(() => buildFeatures(hotel));
  worldGroup.add(featuresCard);
  interactive.push(featuresCard);

  const exitBtn = makeButton("← Return to the Collection", { accent: PALETTE.teal }, 0.9, 0.17);
  exitBtn.position.set(0, 0.75, -1.6); // y-range [0.665, 0.835] — clear of the cards above
  exitBtn.userData.onSelect = () => navigate(buildHotelSelection);
  worldGroup.add(exitBtn);
  interactive.push(exitBtn);

  setInteractive(interactive);
  aiden.say(
    hotel.aidenHome ? AIDEN_LINES.hubHome : fillLine(AIDEN_LINES.hub, { hotel: hotel.name }),
    AIDEN_LINES.hubHint
  );
}

/* =============================================================
   SCENE 2a — ROOMS
   Just the room gallery — touching a photo opens its own detail page.
   No feature orbs or reactive glow here; that's a separate page now,
   so this stays a calm, uncluttered gallery to browse.
   ============================================================= */

function buildRooms(hotel) {
  isAtHotelSelection = false;
  setEnvironmentAccent(parseAccent(hotel.accent));

  const intro = canvasToPlane(
    (() => {
      const c = document.createElement("canvas");
      c.width = 1200; c.height = 260;
      drawTitlePanel(c.getContext("2d"), c.width, c.height, hotel.themes, "The Rooms", "Touch a room to step inside and see more.");
      return c;
    })(),
    2.4, 0.525
  );
  intro.position.set(0, 2.35, -2.3);
  worldGroup.add(intro);

  const interactive = [];

  // Fixed ~32° step between photos (each ~26° wide at this radius), so
  // neighbours never touch and a 3-room hotel stays compact up front
  // instead of being spread across the same arc as a 7-room one.
  const imgCount = hotel.images.length;
  const imgRadius = 2.2;
  const imgStep = 0.56;
  const imgArc = imgStep * Math.max(0, imgCount - 1);
  hotel.images.forEach((img, i) => {
    const src = typeof img === "string" ? img : img.src;
    const label = typeof img === "string" ? null : img.label;
    const roomDescription = typeof img === "string" ? null : img.description;
    const roomIcon = (typeof img === "string" ? null : img.icon) || "🛏️";

    const angle = -imgArc / 2 + (imgArc * i) / Math.max(1, imgCount - 1);
    const planeY = 1.5;
    const imgPos = new THREE.Vector3(Math.sin(angle) * imgRadius, planeY, -Math.cos(angle) * imgRadius);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 0.63),
      new THREE.MeshBasicMaterial({ color: 0xd7dcda })
    );
    plane.position.copy(imgPos);
    plane.lookAt(0, planeY, 0);
    worldGroup.add(plane);

    const loader = new THREE.TextureLoader();
    loader.load(
      src,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        cropTextureBorder(tex);
        plane.material.map = tex;
        plane.material.color.set(0xffffff);
        plane.material.needsUpdate = true;
      },
      undefined,
      () => {
        const icon = hotel.features[i % hotel.features.length]?.[0];
        const tex = new THREE.CanvasTexture(makePlaceholderTexture(hotel, icon));
        plane.material.map = tex;
        plane.material.color.set(0xffffff);
        plane.material.needsUpdate = true;
      }
    );

    if (label) {
      const caption = canvasToPlane(
        (() => {
          const c = document.createElement("canvas");
          c.width = 600; c.height = 110;
          const ctx = c.getContext("2d");
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(243,239,230,.92)";
          ctx.font = `600 34px ${FONT_BODY}`;
          ctx.fillText(label, 300, 62);
          ctx.textAlign = "left";
          return c;
        })(),
        0.7, 0.13
      );
      const captionY = planeY - 0.42; // clear of the image plane above
      caption.position.set(imgPos.x, captionY, imgPos.z);
      caption.lookAt(0, captionY, 0);
      worldGroup.add(caption);
    }

    if (roomDescription) {
      plane.userData.onSelect = () => {
        navigate(() => buildRoomDetail(hotel, { src, label, description: roomDescription, icon: roomIcon }));
      };
      interactive.push(plane);
    }
  });

  const backBtn = makeButton("← Back", { accent: PALETTE.teal }, 0.45, 0.17);
  backBtn.position.set(0, 0.75, -1.5);
  backBtn.userData.onSelect = () => navigate(() => buildHotelHub(hotel));
  worldGroup.add(backBtn);
  interactive.push(backBtn);

  setInteractive(interactive);
  aiden.say(fillLine(AIDEN_LINES.rooms, { hotel: hotel.name }), AIDEN_LINES.roomsHint);
}

/* =============================================================
   SCENE 2b — ROOM DETAIL
   A dedicated stop for a single room, reached by touching its photo in
   the rooms gallery. Full-size image, full description, nothing competing
   for attention — then back into the gallery where you left off.
   ============================================================= */

function buildRoomDetail(hotel, room) {
  isAtHotelSelection = false;
  const accentColor = parseAccent(hotel.accent);
  setEnvironmentAccent(accentColor);

  const glow = new THREE.PointLight(0xc9a24a, 1.1, 6, 2);
  glow.color.copy(accentColor);
  glow.position.set(0, 2.4, -2.0);
  worldGroup.add(glow);

  // The camera's vertical FOV is 60° (±30° from dead ahead) — the previous
  // layout put the description panel entirely below that cone, so it never
  // actually rendered in view at all, not even small. Everything here now
  // stays within roughly ±25°, and the photo gave up some size so the
  // description has real room to show the full room detail, not a trimmed
  // summary of it.
  const title = canvasToPlane(
    (() => {
      const c = document.createElement("canvas");
      c.width = 1200; c.height = 240;
      drawTitlePanel(c.getContext("2d"), c.width, c.height, hotel.name.toUpperCase() + " · ROOM", room.label, null);
      return c;
    })(),
    2.0, 0.42
  );
  title.position.set(0, 2.35, -2.3); // y-range [2.14, 2.56]
  worldGroup.add(title);

  const titleRule = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.006),
    new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.85 })
  );
  titleRule.position.set(0, 2.15, -2.299);
  worldGroup.add(titleRule);

  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xd7dcda })
  );
  photo.position.set(0, 1.7, -2.0); // y-range [1.4, 2.0] — clear of the title above
  worldGroup.add(photo);

  const photoBrackets = makeCornerBrackets(1.3, 0.6, PALETTE.brass, 0.09);
  photoBrackets.position.copy(photo.position);
  worldGroup.add(photoBrackets);

  const loader = new THREE.TextureLoader();
  loader.load(
    room.src,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      cropTextureBorder(tex);
      photo.material.map = tex;
      photo.material.color.set(0xffffff);
      photo.material.needsUpdate = true;
    },
    undefined,
    () => {
      const tex = new THREE.CanvasTexture(makePlaceholderTexture(hotel, room.icon));
      photo.material.map = tex;
      photo.material.color.set(0xffffff);
      photo.material.needsUpdate = true;
    }
  );

  // Description sits just under the photo now (~9-22° below forward — a
  // quick glance, not a big head-tilt), and the back button gets its own
  // band further down (~30-35°) and closer to camera than the panel, so
  // the panel (farther away) can never render in front of it and hide it
  // the way it did before — angular bands don't overlap, so neither
  // element can occlude the other regardless of viewing angle.
  const captionCanvas = document.createElement("canvas");
  captionCanvas.width = 1200; captionCanvas.height = 284;
  const captionPanel = canvasToPlane(captionCanvas, 1.9, 0.45);
  captionPanel.position.set(0, 1.08, -1.8); // ~9-22° below forward
  worldGroup.add(captionPanel);

  refreshPanel(captionPanel, (ctx) => {
    const w = 1200, h = 284;
    ctx.textAlign = "left";
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, PALETTE.ink);
    base.addColorStop(1, PALETTE.inkLight);
    ctx.fillStyle = base;
    roundRect(ctx, 0, 0, w, h, 14);
    ctx.fill();

    ctx.strokeStyle = PALETTE.glassBorder;
    ctx.lineWidth = 1;
    roundRect(ctx, 1, 1, w - 2, h - 2, 14);
    ctx.stroke();

    ctx.fillStyle = PALETTE.brass;
    ctx.font = `600 19px ${FONT_BODY}`;
    ctx.fillText("ABOUT THIS ROOM", 32, 42);

    ctx.font = "38px Arial";
    ctx.fillStyle = PALETTE.textWarm;
    ctx.fillText(room.icon || "🛏️", w - 72, 58);

    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = `24px ${FONT_BODY}`;
    wrapText(ctx, room.description, 32, 90, w - 64, 30, 5);
  });

  const backBtn = makeButton("← Back to the Rooms", { accent: PALETTE.teal }, 0.55, 0.17);
  backBtn.position.set(0, 0.71, -1.4); // ~30-35° below forward, closer than the panel above
  backBtn.userData.onSelect = () => navigate(() => buildRooms(hotel));
  worldGroup.add(backBtn);

  setInteractive([backBtn]);
  aiden.say(fillLine(AIDEN_LINES.roomDetail, { room: room.label, description: room.description }));
}

/* =============================================================
   SCENE 2c — FEATURES
   The reactive-orb layer, now its own page: touch a marker and the room
   itself responds (glow, embers, a small burst) while the panel below
   fills in the detail — nothing sharing space with the room gallery.
   ============================================================= */

function buildFeatures(hotel) {
  isAtHotelSelection = false;
  const intro = canvasToPlane(
    (() => {
      const c = document.createElement("canvas");
      c.width = 1200; c.height = 260;
      drawTitlePanel(c.getContext("2d"), c.width, c.height, hotel.themes, "The Features", "Touch a marker to see what makes it different.");
      return c;
    })(),
    2.4, 0.525
  );
  intro.position.set(0, 2.35, -2.3); // y-range [2.09, 2.61]
  worldGroup.add(intro);

  const interactive = [];
  const accentColor = parseAccent(hotel.accent);
  const baseGlowColor = new THREE.Color(0xc9a24a);
  setEnvironmentAccent(accentColor);

  const roomLight = new THREE.PointLight(0xc9a24a, 1.0, 6, 2);
  roomLight.position.set(0, 2.2, -1.2);
  worldGroup.add(roomLight);

  const emberCount = 90;
  const emberPositions = new Float32Array(emberCount * 3);
  const emberSpeeds = new Float32Array(emberCount);
  for (let i = 0; i < emberCount; i++) {
    const r = 1.2 + Math.random() * 1.8;
    const a = Math.random() * Math.PI * 2;
    emberPositions[i * 3] = Math.cos(a) * r;
    emberPositions[i * 3 + 1] = 0.3 + Math.random() * 2.2;
    emberPositions[i * 3 + 2] = Math.sin(a) * r - 1.2;
    emberSpeeds[i] = 0.05 + Math.random() * 0.08;
  }
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPositions, 3));
  const emberMat = new THREE.PointsMaterial({
    color: baseGlowColor, size: 0.02, transparent: true, opacity: 0.32, depthWrite: false,
  });
  const embers = new THREE.Points(emberGeo, emberMat);
  worldGroup.add(embers);

  const transientEffects = [];
  function spawnBurst(position, color) {
    const count = 22;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.4 + Math.random() * 0.5;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.cos(phi) * speed;
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.035, transparent: true, opacity: 1, depthWrite: false });
    const points = new THREE.Points(geo, mat);
    points.userData.velocities = velocities;
    points.userData.life = 0;
    worldGroup.add(points);
    transientEffects.push(points);
  }

  let glowLerp = 0;
  let dimLerp = 0; // "Dim the lights" request — fades panels down, then slowly back
  let activeGlowColor = baseGlowColor.clone();
  let activeBtn = null;
  const featureBtns = [];
  const dimmables = [intro];

  function reactToTouch(position, color) {
    glowLerp = 1;
    activeGlowColor = color.clone();
    spawnBurst(position.clone(), color);
  }

  worldGroup.userData.onFrame = (delta) => {
    const pos = embers.geometry.attributes.position;
    for (let i = 0; i < emberCount; i++) {
      let y = pos.getY(i) + emberSpeeds[i] * delta;
      if (y > 2.6) y = 0.2;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;

    glowLerp = Math.max(0, glowLerp - delta * 0.6);
    const settled = activeGlowColor.clone().lerp(baseGlowColor, 1 - glowLerp);
    roomLight.color.copy(settled);
    roomLight.intensity = 1.0 + glowLerp * 1.6;
    emberMat.color.copy(settled);

    dimLerp = Math.max(0, dimLerp - delta * 0.12);
    emberMat.opacity = (0.3 + glowLerp * 0.35) * (1 - 0.7 * dimLerp);
    const brightness = 1 - 0.6 * dimLerp;
    dimmables.forEach((m) => m.material.color.setScalar(brightness));

    for (let i = transientEffects.length - 1; i >= 0; i--) {
      const fx = transientEffects[i];
      fx.userData.life += delta;
      const p = fx.geometry.attributes.position;
      const v = fx.userData.velocities;
      for (let j = 0; j < p.count; j++) {
        p.setX(j, p.getX(j) + v[j * 3] * delta);
        p.setY(j, p.getY(j) + v[j * 3 + 1] * delta);
        p.setZ(j, p.getZ(j) + v[j * 3 + 2] * delta);
      }
      p.needsUpdate = true;
      fx.material.opacity = Math.max(0, 1 - fx.userData.life / 0.7);
      if (fx.userData.life > 0.7) {
        worldGroup.remove(fx);
        fx.geometry.dispose();
        fx.material.dispose();
        transientEffects.splice(i, 1);
      }
    }
  };

  // Nothing else shares this scene now, so the panel can sit closer and
  // bigger — it's the main content, not something dodging a photo gallery.
  const detailCanvas = document.createElement("canvas");
  detailCanvas.width = 1100; detailCanvas.height = 420;
  const detailPanel = canvasToPlane(detailCanvas, 2.3, 0.88);
  detailPanel.position.set(0, 1.25, -1.9); // y-range [0.81, 1.69]
  worldGroup.add(detailPanel);
  dimmables.push(detailPanel);

  function showFeature(feature) {
    refreshPanel(detailPanel, (ctx) => {
      ctx.textAlign = "left";
      const w = 1100, h = 420;
      const base = ctx.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, PALETTE.ink);
      base.addColorStop(1, PALETTE.inkLight);
      ctx.fillStyle = base;
      roundRect(ctx, 0, 0, w, h, 14);
      ctx.fill();

      ctx.strokeStyle = PALETTE.glassBorder;
      ctx.lineWidth = 1;
      roundRect(ctx, 1, 1, w - 2, h - 2, 14);
      ctx.stroke();

      // corner brackets — HUD framing instead of a boxed border
      ctx.strokeStyle = PALETTE.brass;
      ctx.lineWidth = 2;
      const bl = 34, m = 22;
      ctx.beginPath();
      ctx.moveTo(m, m + bl); ctx.lineTo(m, m); ctx.lineTo(m + bl, m);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w - m - bl, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - bl);
      ctx.stroke();

      const imageSrc = feature[3];
      const image = imageSrc ? getFeatureImage(imageSrc, () => showFeature(feature)) : null;

      if (imageSrc) {
        const thumbW = 380;
        ctx.save();
        roundRect(ctx, w - thumbW - 24, 24, thumbW, h - 48, 12);
        ctx.clip();
        if (image) {
          drawImageCoverCropped(ctx, image, w - thumbW - 24, 24, thumbW, h - 48);
        } else {
          ctx.fillStyle = "rgba(255,255,255,.05)";
          ctx.fillRect(w - thumbW - 24, 24, thumbW, h - 48);
        }
        ctx.restore();

        const textW = w - thumbW - 24 - m * 2;
        ctx.fillStyle = PALETTE.textWarm;
        ctx.font = "56px Arial";
        ctx.fillText(feature[0], m, 100);

        ctx.font = `400 44px ${FONT_DISPLAY}`;
        ctx.fillText(feature[1], m, 165);

        ctx.fillStyle = PALETTE.textMuted;
        ctx.font = `25px ${FONT_BODY}`;
        wrapText(ctx, feature[2], m, 220, textW, 33, 5);
      } else {
        ctx.textAlign = "center";
        ctx.font = "72px Arial";
        ctx.fillStyle = PALETTE.textWarm;
        ctx.fillText(feature[0], 550, 150);

        ctx.font = `400 46px ${FONT_DISPLAY}`;
        ctx.fillText(feature[1], 550, 220);

        ctx.fillStyle = PALETTE.textMuted;
        ctx.font = `26px ${FONT_BODY}`;
        wrapText(ctx, feature[2], 550, 275, 820, 34, 3);
        ctx.textAlign = "left";
      }
    });
  }

  // Plain pill buttons, not abstract glowing orbs — they need to read as
  // "click me" at a glance, same button language used everywhere else in
  // the app. The room still reacts (light/embers/burst) on selection; that
  // ambient touch just isn't the only cue that these are interactive.
  //
  // A handful of features stay on the original tight arc in front of the
  // guest (a single glance covers all of them). Hotels with a lot of
  // amenities (e.g. Elysium's 8) instead ring the whole 360° around the
  // guest at one height, evenly spaced — walk/turn to find each one,
  // rather than cramming them into overlapping or stacked rows up front.
  const hotspotRadius = 1.9;
  const featureCount = hotel.features.length;
  const useFullCircle = featureCount > 4;
  const frontArc = 1.4;
  // The detail panel sits at y 0.81–1.69 (center 1.25, height 0.88) — a
  // full-circle ring at that same height would pass straight through it
  // wherever a button swings near the front. Drop the ring below the
  // panel's bottom edge instead, with clearance from the back button too.
  const btnY = useFullCircle ? 0.6 : 0.95;

  hotel.features.forEach((feature, i) => {
    // Full circle starts at a half-step offset so no button lands dead
    // center (where the detail panel sits) or dead behind the guest.
    const angle = useFullCircle
      ? ((i + 0.5) / featureCount) * Math.PI * 2
      : featureCount > 1
      ? -frontArc / 2 + (frontArc * i) / (featureCount - 1)
      : 0;
    const btnPos = new THREE.Vector3(Math.sin(angle) * hotspotRadius, btnY, -Math.cos(angle) * hotspotRadius);

    const btn = makeButton(feature[1], { icon: feature[0], accent: PALETTE.teal }, 0.7, 0.2);
    btn.position.copy(btnPos);
    btn.lookAt(0, btnY, 0);
    btn.userData.baseY = btnPos.y;
    btn.userData.phase = i * 0.9;
    worldGroup.add(btn);
    featureBtns.push(btn);
    interactive.push(btn);
    dimmables.push(btn);

    btn.userData.selectFeature = (announce) => {
      showFeature(feature);
      activeBtn = btn;
      featureBtns.forEach((m) =>
        refreshPanel(m, (ctx) => drawButton(ctx, 900, 270, m.userData.label, { ...m.userData.opts, selected: m === activeBtn }))
      );
      reactToTouch(btnPos, accentColor);
      if (announce) aiden.say(fillLine(AIDEN_LINES.featurePicked, { feature: feature[1], description: feature[2] }));
    };
    btn.userData.onSelect = () => btn.userData.selectFeature(true);
  });

  // Pre-select the first feature quietly, so AIDEN's intro line isn't talked over.
  featureBtns[0]?.userData.selectFeature(false);

  // AIDEN's home (The Hestia): a row of requests above the panel — guests
  // ask AIDEN for something and the room responds.
  if (hotel.aidenHome) {
    AIDEN_LINES.homeRequests.forEach((request, i) => {
      const reqBtn = makeButton(request.label, { icon: request.icon, accent: PALETTE.brass }, 0.52, 0.15);
      reqBtn.position.set((i - (AIDEN_LINES.homeRequests.length - 1) / 2) * 0.6, 1.88, -1.85);
      reqBtn.userData.onSelect = () => runHomeRequest(request, reqBtn.position);
      worldGroup.add(reqBtn);
      interactive.push(reqBtn);
      dimmables.push(reqBtn);
    });
  }

  function runHomeRequest(request, position) {
    if (request.effect === "dim") {
      dimLerp = 1;
      glowLerp = 1;
      activeGlowColor = new THREE.Color(0x3a5cff);
    } else if (request.effect === "warm") {
      dimLerp = 0;
      baseGlowColor.set(0xffa040); // embers stay golden for the rest of this visit
      reactToTouch(position, new THREE.Color(0xffa040));
    } else if (request.effect === "celebrate") {
      dimLerp = 0;
      glowLerp = 1;
      activeGlowColor = new THREE.Color(0xff66cc);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        spawnBurst(
          new THREE.Vector3(Math.sin(a) * 1.3, 1.3 + Math.random() * 0.8, -Math.cos(a) * 1.3),
          new THREE.Color().setHSL(i / 8, 0.8, 0.6)
        );
      }
    }
    aiden.say(request.reply);
  }

  const backBtn = makeButton("← Back", { accent: PALETTE.teal }, 0.45, 0.17);
  backBtn.position.set(0, 0.5, -1.4);
  backBtn.userData.onSelect = () => navigate(() => buildHotelHub(hotel));
  worldGroup.add(backBtn);
  interactive.push(backBtn);

  setInteractive(interactive);
  aiden.say(hotel.aidenHome ? AIDEN_LINES.featuresHome : AIDEN_LINES.features);
}

// Canvas text doesn't repaint itself when a webfont finishes loading, so the
// very first panels would render in the fallback serif/sans-serif until the
// next redraw (e.g. selecting something). Wait for the fonts once up front
// instead, so the opening scene is never a font-swap away from correct.
const fontsReady = document.fonts
  ? Promise.all([
      document.fonts.load(`400 64px ${FONT_DISPLAY}`),
      document.fonts.load(`600 22px ${FONT_BODY}`),
    ]).catch(() => {})
  : Promise.resolve();

fontsReady.then(() => buildHotelSelection());
/* =============================================================
   RENDER LOOP
   ============================================================= */

const clock = new THREE.Clock();
const _eyePosition = new THREE.Vector3();

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();

  // Idle kiosk reset — nobody's touched a button, dragged the view, or
  // pulled a controller trigger for a while, so hand the next guest a
  // clean hotel-selection screen instead of leaving them mid-stranger's-stay.
  if (!isAtHotelSelection && clock.elapsedTime - lastActivityTime > IDLE_TIMEOUT_SECONDS) {
    markActivity(); // reset now so the fade-back can't retrigger this every frame
    navigate(buildHotelSelection);
  }

  worldGroup.children.forEach((child) => {
    if (child.userData.baseY !== undefined) {
      child.position.y =
        child.userData.baseY + Math.sin(clock.elapsedTime * 0.8 + child.userData.phase) * 0.02;
    }
  });

  worldGroup.userData.onFrame?.(delta, clock.elapsedTime);
  starGroup.rotation.y += delta * 0.004;
  updateTransition(delta);

  if (!renderer.xr.isPresenting) {
    camera.rotation.set(pitch, yaw, 0, "YXZ");
  } else if (recenterFramesLeft > 0 && --recenterFramesLeft === 0) {
    userRig.position.y += EYE_HEIGHT - camera.getWorldPosition(_eyePosition).y;
    aiden.snap();
  }
  aiden.update(delta, clock.elapsedTime);

  // ---- Raycast: tracked hands/controllers > gaze (no hand in view) > desktop mouse ----
  let pickedRay = null;
  let mode = "desktop";
  const trackedControllers = renderer.xr.isPresenting
    ? [controller0, controller1].filter((c) => c.userData.connected && c.visible)
    : [];

  if (trackedControllers.length) {
    mode = "controller";
    trackedControllers.forEach((controller) => {
      const hit = pickFromController(controller);
      if (hit && !pickedRay) pickedRay = hit;
      // Ray geometry is 5 m long — scale it to stop at whatever it hits.
      const ray = controller.getObjectByName("ray");
      if (ray) ray.scale.z = (hit ? hit.distance : 2) / 5;
    });
  } else if (renderer.xr.isPresenting) {
    // No hand currently tracked — pick from the center of the view,
    // since that's what "looking at" means here.
    mode = "gaze";
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    pickedRay = pick();
  } else {
    // Desktop preview — pick from the actual mouse position, so
    // clicking works wherever a button visually is on screen.
    raycaster.setFromCamera(mouseNDC, camera);
    pickedRay = pick();
  }

  const newHover = pickedRay ? pickedRay.object : null;

  if (newHover !== hovered) {
    hovered = newHover;
    dwellStart = clock.elapsedTime;
    if (hovered) sfx.hover();
  }

  if (hovered) {
    const eye = camera.getWorldPosition(_eyePosition);
    // Grow the cursor with distance so it stays visible on far panels.
    const cursorScale = Math.max(1, pickedRay.point.distanceTo(eye) * 0.9);
    reticle.visible = true;
    reticle.position.copy(pickedRay.point);
    reticle.lookAt(eye);
    reticle.scale.setScalar(cursorScale);

    // Dwell-to-select only applies when no hand is tracked — hands
    // use a pinch (selectstart listener), desktop uses a real click
    // (listener above), neither should need a forced wait.
    if (mode === "gaze") {
      const elapsed = (clock.elapsedTime - dwellStart) * 1000;
      const progress = Math.min(1, elapsed / DWELL_MS);
      dwellRing.visible = true;
      dwellRing.position.copy(pickedRay.point);
      dwellRing.lookAt(eye);
      dwellRing.scale.setScalar((0.3 + progress * 0.7) * cursorScale);
      dwellRing.material.opacity = 0.95;
      if (progress >= 1) {
        fireSelect(hovered);
        dwellStart = clock.elapsedTime; // avoid instant re-trigger
      }
    } else {
      dwellRing.visible = false;
    }
  } else {
    reticle.visible = false;
    dwellRing.visible = false;
  }

  // ---- Gentle hover lift so the focused panel reads as "live" ----
  interactiveObjects.forEach((obj) => {
    const target = obj === hovered ? 1.06 : 1;
    const k = Math.min(1, delta * 12);
    obj.scale.x += (target - obj.scale.x) * k;
    obj.scale.y += (target - obj.scale.y) * k;
  });

  renderer.render(scene, camera);
});

/* =============================================================
   DESKTOP HINT
   Fades out the first time someone drags/clicks, and whenever an
   immersive session starts (it lives in the DOM, not the scene,
   so it would otherwise linger behind the headset view).
   ============================================================= */

function hideDesktopHint() {
  document.getElementById("desktopHint")?.classList.add("hidden");
}

renderer.xr.addEventListener("sessionstart", hideDesktopHint);