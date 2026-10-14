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
import { ARButton } from "three/addons/webxr/ARButton.js";

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
    id: "03", name: "The Grid", accent: "rgba(160,130,255,.55)",
    themes: "DESIGN · PERFORMANCE · WELLNESS",
    description: "A visionary anchor where intelligent design powers peak performance — an urban sanctuary for travellers who refuse to compromise between high-stakes productivity and absolute relaxation. Twelve cascading floors rise around a striking vertical atrium, with four distinct experience zones engineered for both performance and rest.",
    images: [
      { src: "images/grid-base.png", label: "The Base Grid", icon: "🛏️",
        description: "Sleeps two, with a dedicated workspace, minibar, city views, a sofa, and a rain shower — the essentials, done well." },
      { src: "images/grid-core.png", label: "The Core Grid", icon: "💡",
        description: "Sleeps two, with a workspace, minibar, timed LED lighting, city views, a rain shower, and high-speed WiFi — a step up in comfort and connectivity." },
      { src: "images/grid-apex.png", label: "The Apex Grid", icon: "✨",
        description: "Sleeps two, with a workspace, minibar, timed LED lighting, 24/7 butler service, a 360° city view, a sofa, rain shower, high-speed WiFi, and a jacuzzi tub — the flagship suite for those who don't compromise." },
    ],
    features: [
      ["🏙️", "Vertical Atrium", "Twelve cascading floors wrap a striking vertical atrium — the building's architecture is the view."],
      ["🧭", "Four Experience Zones", "Dining, fitness, wellness and work each get their own zone under one roof."],
      ["🍽️", "Tech-Forward Dining", "Restaurants built around fresh, local ingredients and tech-forward service."],
      ["🧘", "Collaborative Wellness", "Fitness and wellness hubs designed for recovery, not just exercise."],
    ],
  },
  {
    id: "04", name: "The Elysium", accent: "rgba(220,170,90,.55)",
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
    id: "06", name: "Multiverse Hotel", accent: "rgba(130,100,255,.6)",
    themes: "IMMERSION · WORLDS · TECHNOLOGY",
    description: "One hotel, infinite worlds — guests step between themed zones, activities and social spaces within a single stay.",
    images: ["images/multiverse-01.jpg", "images/multiverse-02.jpg", "images/multiverse-03.jpg", "images/multiverse-04.jpg"],
    features: [
      ["🌌", "Multiple Worlds", "Guests step between themed zones and experiences without ever leaving the building."],
      ["🎭", "Immersive Activities", "Themed experiences and social spaces bring guests together."],
      ["🚪", "Choose Your World", "Every guest charts a different path through the same hotel."],
    ],
  },
  {
    id: "07", name: "Living Hotel", accent: "rgba(80,210,160,.55)",
    themes: "AI · PERSONALISATION · WELLNESS",
    description: "A personalised hotel experience where AI adapts the environment to each guest.",
    images: ["images/living-01.jpg", "images/living-02.jpg", "images/living-03.jpg"],
    features: [
      ["🧠", "Adaptive Room", "A room that quietly adapts itself — lighting, temperature, mood — to the guest inside it."],
      ["🤖", "Personal AI", "Artificial intelligence personalises every part of the stay, before you even ask."],
    ],
  },
  {
    id: "08", name: "Fantasy Retreat", accent: "rgba(220,120,220,.6)",
    themes: "FANTASY · IMMERSION · STORYTELLING",
    description: "A fantasy-inspired hotel where hospitality becomes storytelling, entertainment and escape.",
    images: ["images/fantasy-01.jpg", "images/fantasy-02.jpg", "images/fantasy-03.jpg", "images/fantasy-04.jpg"],
    features: [
      ["🏰", "Fantasy World", "Guests step into an imagined environment."],
      ["🎨", "Storytelling", "The hotel becomes part of a narrative."],
      ["🪄", "Escape", "The hotel provides an escape from everyday reality."],
    ],
  },
  {
    id: "09", name: "The Hestia", accent: "rgba(120,180,230,.55)",
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
   RENDERER / SCENE / CAMERA
   ============================================================= */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.set(0, 1.6, 0);

const userRig = new THREE.Group();
userRig.add(camera);
scene.add(userRig);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");
document.body.appendChild(renderer.domElement);

/* -------------------------------------------------------------
   ENTRY BUTTONS — AR first, VR as a fallback/alternative
   ------------------------------------------------------------- */

async function mountEntryButtons() {
  const arSupported =
    navigator.xr && (await navigator.xr.isSessionSupported("immersive-ar").catch(() => false));

  if (arSupported) {
    const arBtn = ARButton.createButton(renderer, {
      optionalFeatures: ["local-floor"],
    });
    arBtn.style.bottom = "20px";
    document.body.appendChild(arBtn);
  } else {
    console.info("Immersive AR isn't supported on this browser/device — running in desktop preview mode only.");
  }
}

mountEntryButtons();

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
    ctx.font = `28px ${FONT_BODY}`;
    const lines = body.split("\n");
    lines.forEach((line, i) => ctx.fillText(line, w / 2, 210 + i * 38));
  }
  ctx.textAlign = "left";
}

/* =============================================================
   INTERACTION SYSTEM
   ============================================================= */

const raycaster = new THREE.Raycaster();
let interactiveObjects = [];
let hovered = null;
let dwellStart = 0;
const DWELL_MS = 1200;

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

function setInteractive(list) {
  interactiveObjects = list;
}

function fireSelect(mesh) {
  markActivity();
  if (mesh && typeof mesh.userData.onSelect === "function") {
    mesh.userData.onSelect();
  }
}

let usingControllers = false;

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
    usingControllers = true;
    controller.visible = true;
  });
  controller.addEventListener("disconnected", () => {
    controller.visible = false;
  });

  controller.addEventListener("selectstart", () => {
    markActivity();
    if (hovered) fireSelect(hovered);
  });

  scene.add(controller);
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

function navigate(buildFn) {
  const duration = 220;
  const start = performance.now();
  function fadeOut(now) {
    const t = Math.min(1, (now - start) / duration);
    fadePlane.material.opacity = t;
    if (t < 1) {
      requestAnimationFrame(fadeOut);
    } else {
      clearWorld();
      setInteractive([]);
      buildFn();
      // FIXED: each new scene assumes a forward-facing view — reset
      // any desktop-preview look-around so nothing appears tilted.
      if (!renderer.xr.isPresenting) {
        yaw = 0;
        pitch = 0;
      }
      const start2 = performance.now();
      function fadeIn(now2) {
        const t2 = Math.min(1, (now2 - start2) / duration);
        fadePlane.material.opacity = 1 - t2;
        if (t2 < 1) requestAnimationFrame(fadeIn);
      }
      requestAnimationFrame(fadeIn);
    }
  }
  requestAnimationFrame(fadeOut);
}

/* =============================================================
   SCENE 1 — HOTEL SELECTION
   ============================================================= */

function buildHotelSelection() {
  isAtHotelSelection = true;
  setEnvironmentAccent(new THREE.Color(0xc9a24a));

  const title = canvasToPlane(
    (() => {
      const c = document.createElement("canvas");
      c.width = 1200; c.height = 260;
      drawTitlePanel(c.getContext("2d"), c.width, c.height, "THE COLLECTION · 08 FUTURES", "Choose your destination", "Look or point at a hotel, then select to step inside.");
      return c;
    })(),
    3.2, 0.7
  );
  title.position.set(0, 2.35, -3.4);
  worldGroup.add(title);

  // Card angular width must stay well under the spacing between cards, or
  // neighbours overlap — at the old radius/size (3, 1.3 wide) each card was
  // ~24° wide but only 20° apart, guaranteeing overlap. Wider arc + farther
  // radius + a slightly smaller card leaves a real gap instead.
  const radius = 3.6;
  const arc = (170 * Math.PI) / 180;
  const count = hotels.length;
  const startAngle = -arc / 2;

  const interactive = [];

  hotels.forEach((hotel, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 620;
    const card = canvasToPlane(canvas, 1.2, 0.73);
    // The hero photo loads async — redraw this specific card once it's
    // ready instead of leaving it on the gradient+icon fallback forever.
    refreshPanel(card, (ctx) => drawHotelCard(ctx, hotel, () => refreshPanel(card, (c2) => drawHotelCard(c2, hotel))));

    const angle = startAngle + (arc * i) / (count - 1);
    card.position.set(Math.sin(angle) * radius, 1.55, -Math.cos(angle) * radius);
    card.lookAt(0, 1.55, 0);

    card.userData.baseY = card.position.y;
    card.userData.phase = i * 0.7;
    card.userData.onSelect = () => {
      navigate(() => buildHotelHub(hotel));
    };

    worldGroup.add(card);
    interactive.push(card);
  });

  setInteractive(interactive);
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
    3.2, 0.7
  );
  intro.position.set(0, 2.3, -3.0); // y-range [1.95, 2.65]
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

    return canvasToPlane(canvas, 1.4, 1.04);
  }

  // Cards: y-range [0.78, 1.82] — clear of the title above (bottom 1.95)
  const roomsCard = makeChoiceCard("🛏️", "The Rooms", "Room types you can step inside, from an entry-level smart room to the flagship suite.");
  roomsCard.position.set(-0.85, 1.3, -2.4);
  roomsCard.lookAt(0, 1.3, 0);
  roomsCard.userData.onSelect = () => navigate(() => buildRooms(hotel));
  worldGroup.add(roomsCard);
  interactive.push(roomsCard);

  const featuresCard = makeChoiceCard("🧬", "The Features", "The ideas and technology that make this hotel different.");
  featuresCard.position.set(0.85, 1.3, -2.4);
  featuresCard.lookAt(0, 1.3, 0);
  featuresCard.userData.onSelect = () => navigate(() => buildFeatures(hotel));
  worldGroup.add(featuresCard);
  interactive.push(featuresCard);

  const exitBtn = makeButton("← Return to the Collection", { accent: PALETTE.teal }, 0.9, 0.17);
  exitBtn.position.set(0, 0.55, -1.6); // y-range [0.465, 0.635] — clear of the cards above
  exitBtn.userData.onSelect = () => navigate(buildHotelSelection);
  worldGroup.add(exitBtn);
  interactive.push(exitBtn);

  setInteractive(interactive);
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
    3.2, 0.7
  );
  intro.position.set(0, 2.35, -3.2);
  worldGroup.add(intro);

  const interactive = [];

  // Radius/size chosen so adjacent images leave a real angular gap between
  // them rather than nearly touching.
  const imgCount = hotel.images.length;
  const imgRadius = 3.0;
  const imgArc = Math.PI * 1.5;
  hotel.images.forEach((img, i) => {
    const src = typeof img === "string" ? img : img.src;
    const label = typeof img === "string" ? null : img.label;
    const roomDescription = typeof img === "string" ? null : img.description;
    const roomIcon = (typeof img === "string" ? null : img.icon) || "🛏️";

    const angle = -imgArc / 2 + (imgArc * i) / Math.max(1, imgCount - 1);
    const planeY = 1.5;
    const imgPos = new THREE.Vector3(Math.sin(angle) * imgRadius, planeY, -Math.cos(angle) * imgRadius);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 0.82),
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
        0.8, 0.15
      );
      const captionY = planeY - 0.55; // clear of the image plane above
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
  backBtn.position.set(0, 0.55, -1.6);
  backBtn.userData.onSelect = () => navigate(() => buildHotelHub(hotel));
  worldGroup.add(backBtn);
  interactive.push(backBtn);

  setInteractive(interactive);
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
    3.2, 0.7
  );
  intro.position.set(0, 2.35, -3.2); // y-range [2.0, 2.7]
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

  // Multiverse Hotel only: stepping into a feature briefly tints the whole
  // room, echoing its "one hotel, infinite worlds" premise.
  let worldTintMesh = null;
  let worldTintLerp = 0;
  if (hotel.id === "06") {
    worldTintMesh = new THREE.Mesh(
      new THREE.SphereGeometry(6, 16, 16),
      new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false })
    );
    worldGroup.add(worldTintMesh);
  }

  let glowLerp = 0;
  let activeGlowColor = baseGlowColor.clone();
  let activeBtn = null;
  const featureBtns = [];

  function reactToTouch(position, color) {
    glowLerp = 1;
    activeGlowColor = color.clone();
    spawnBurst(position.clone(), color);
    if (worldTintMesh) worldTintLerp = 1;
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
    emberMat.opacity = 0.3 + glowLerp * 0.35;

    if (worldTintMesh) {
      worldTintLerp = Math.max(0, worldTintLerp - delta * 0.8);
      worldTintMesh.material.opacity = worldTintLerp * 0.22;
    }

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

    btn.userData.onSelect = () => {
      showFeature(feature);
      activeBtn = btn;
      featureBtns.forEach((m) =>
        refreshPanel(m, (ctx) => drawButton(ctx, 900, 270, m.userData.label, { ...m.userData.opts, selected: m === activeBtn }))
      );
      reactToTouch(btnPos, accentColor);
    };
  });

  featureBtns[0]?.userData.onSelect();

  const backBtn = makeButton("← Back", { accent: PALETTE.teal }, 0.45, 0.17);
  backBtn.position.set(0, 0.5, -1.4);
  backBtn.userData.onSelect = () => navigate(() => buildHotelHub(hotel));
  worldGroup.add(backBtn);
  interactive.push(backBtn);

  setInteractive(interactive);
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

  if (!renderer.xr.isPresenting) {
    camera.rotation.set(pitch, yaw, 0, "YXZ");
  }
  // ---- Raycast: controllers > gaze (headset, no controllers) > desktop mouse ----
  let pickedRay = null;
  let mode = "desktop";

  if (renderer.xr.isPresenting && usingControllers) {
    mode = "controller";
    [controller0, controller1].forEach((controller) => {
      if (!controller.visible) return;
      const tempMatrix = new THREE.Matrix4().identity().extractRotation(controller.matrixWorld);
      const origin = new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld);
      const dir = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix);
      raycaster.set(origin, dir);
      const hits = raycaster.intersectObjects(interactiveObjects, false);
      if (hits.length) pickedRay = hits[0];
      const ray = controller.getObjectByName("ray");
      if (ray) ray.scale.z = hits.length ? hits[0].distance : 2;
    });
  } else if (renderer.xr.isPresenting) {
    // Gaze-only headset (no controllers detected) — pick from the
    // center of the view, since that's what "looking at" means here.
    mode = "gaze";
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(interactiveObjects, false);
    if (hits.length) pickedRay = hits[0];
  } else {
    // Desktop preview — pick from the actual mouse position, so
    // clicking works wherever a button visually is on screen.
    mode = "desktop";
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(interactiveObjects, false);
    if (hits.length) pickedRay = hits[0];
  }

  const newHover = pickedRay ? pickedRay.object : null;

  if (newHover !== hovered) {
    hovered = newHover;
    dwellStart = clock.elapsedTime;
  }

  if (hovered) {
    reticle.visible = true;
    reticle.position.copy(pickedRay.point);
    reticle.lookAt(camera.position);

    // Dwell-to-select only applies to gaze-only headsets — controllers
    // use their trigger (selectstart listener), desktop uses a real
    // click (listener above), neither should need a forced wait.
    if (mode === "gaze") {
      const elapsed = (clock.elapsedTime - dwellStart) * 1000;
      const progress = Math.min(1, elapsed / DWELL_MS);
      dwellRing.visible = true;
      dwellRing.position.copy(pickedRay.point);
      dwellRing.lookAt(camera.position);
      dwellRing.scale.setScalar(0.3 + progress * 0.7);
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