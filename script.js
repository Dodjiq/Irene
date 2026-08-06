/* =========================================================
   Le bouton "Non" reste à côté du "Oui", mais glisse
   toujours du côté opposé au curseur : impossible à cliquer.
   ========================================================= */

const page1   = document.getElementById("page1");
const page2   = document.getElementById("page2");
const page3   = document.getElementById("page3");
const page4   = document.getElementById("page4");
const page5   = document.getElementById("page5");
const btnNon  = document.getElementById("btnNon");
const btnOui  = document.getElementById("btnOui");
const btnDaccord = document.getElementById("btnDaccord");
const piste   = document.getElementById("piste");
const message = document.getElementById("message");
const bulles  = document.getElementById("bulles");

const RAYON_H    = 110;  // distance horizontale de détection (px)
const RAYON_V    = 90;   // distance verticale de détection (px)
const REPOS      = 200;  // délai minimum entre deux esquives (ms)
const ECHELLE_MIN = 0.7;

let posX          = 0;   // décalage horizontal actuel dans la piste
let nbFuites      = 0;
let derniereFuite = 0;

const phrases = [
  "Essaie encore 😏",
  "Trop lent !",
  "Non... mais non 😄",
  "Il file à gauche !",
  "Et hop, à droite !",
  "Tu n'y arriveras pas",
  "Raté !",
  "Allez, dis oui 💕",
];

function aleatoire(min, max) {
  return Math.random() * (max - min) + min;
}

/* Largeur de déplacement disponible dans la piste */
function courseMax() {
  return Math.max(0, piste.clientWidth - btnNon.offsetWidth);
}

/* Esquive : le bouton part du côté opposé au curseur */
function fuir(sourisX) {
  if (!page1.classList.contains("active")) return; // page 1 quittée : plus rien à esquiver

  const maintenant = Date.now();
  if (maintenant - derniereFuite < REPOS) return;
  derniereFuite = maintenant;

  const max = courseMax();
  const rect = btnNon.getBoundingClientRect();
  const centreBouton = rect.left + rect.width / 2;

  // Le curseur vient de la gauche -> on fuit à droite, et inversement
  const versLaDroite = (sourisX ?? centreBouton) <= centreBouton;

  // On vise l'extrémité opposée, avec un léger aléa pour varier
  let cible = versLaDroite ? max - aleatoire(0, max * 0.15)
                           : aleatoire(0, max * 0.15);

  // Si on est déjà collé à cette extrémité, on repart de l'autre côté
  if (Math.abs(cible - posX) < max * 0.25) {
    cible = versLaDroite ? aleatoire(0, max * 0.1) : max - aleatoire(0, max * 0.1);
  }

  posX = Math.min(max, Math.max(0, cible));
  nbFuites++;

  const echelle  = Math.max(ECHELLE_MIN, 1 - nbFuites * 0.02);
  const rotation = aleatoire(-12, 12);

  btnNon.style.transform = `translateX(${posX}px) scale(${echelle}) rotate(${rotation}deg)`;

  btnNon.classList.remove("tremble");
  void btnNon.offsetWidth; // relance l'animation
  btnNon.classList.add("tremble");

  message.textContent = phrases[nbFuites % phrases.length];
}

/* ---------- Déclencheurs ---------- */

// 1) Survol direct
btnNon.addEventListener("mouseenter", (e) => fuir(e.clientX));
btnNon.addEventListener("mouseover",  (e) => fuir(e.clientX));

// 2) Approche du curseur : il part avant même le survol
document.addEventListener("mousemove", (e) => {
  const rect = btnNon.getBoundingClientRect();
  const centreX = rect.left + rect.width / 2;
  const centreY = rect.top + rect.height / 2;

  if (Math.abs(e.clientX - centreX) < RAYON_H + rect.width / 2 &&
      Math.abs(e.clientY - centreY) < RAYON_V) {
    fuir(e.clientX);
  }
});

// 3) Tentative de clic (souris, tactile, stylet)
btnNon.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  derniereFuite = 0;          // un clic passe toujours : pas de temporisation
  fuir(e.clientX);
});

btnNon.addEventListener("touchstart", (e) => {
  e.preventDefault();
  derniereFuite = 0;
  fuir(e.touches[0].clientX);
}, { passive: false });

btnNon.addEventListener("click", (e) => {
  e.preventDefault();
  derniereFuite = 0;
  fuir();
});

// 4) Navigation au clavier : il s'échappe aussi
btnNon.addEventListener("focus", () => {
  derniereFuite = 0;
  fuir();
  btnNon.blur();
});

// 5) Redimensionnement : on le garde dans sa piste
window.addEventListener("resize", () => {
  posX = Math.min(posX, courseMax());
  btnNon.style.transform = `translateX(${posX}px)`;
});

/* ---------- Navigation entre les pages ---------- */

function allerAPage(pageCible) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  pageCible.classList.add("active");
}

/* Oui -> page 2 : la réaction */
btnOui.addEventListener("click", () => {
  allerAPage(page2);
  pluieDeCoeurs();
});

/* "D'accord d'accord" -> page 3 : on fixe le rendez-vous */
btnDaccord.addEventListener("click", () => {
  allerAPage(page3);
});

/* ---------- Page 3 : jour + heure ---------- */

const selJour  = document.getElementById("jour");
const selHeure = document.getElementById("heure");
const recap    = document.getElementById("recap");
const btnDate  = document.getElementById("btnDate");

// Ce que l'utilisateur a choisi au fil des pages
const rendezVous = { jour: "", heure: "", ambiance: "" };

// Petit commentaire selon l'heure choisie
const motsHeure = {
  "17h00": "Debout avant tout le monde, j'admire 🌅",
  "18h00": "Parfait, ni trop tôt ni trop tard 👌",
  "19h00": "L'heure des gens qui ont du style ✨",
  "20h00": "Va pour la nuit, alors 🌙",
};

function majRecap() {
  const jour  = selJour.value;
  const heure = selHeure.value;

  rendezVous.jour  = jour;
  rendezVous.heure = heure;

  // Le champ garde sa couleur "placeholder" tant qu'il est vide
  selJour.classList.toggle("vide", !jour);
  selHeure.classList.toggle("vide", !heure);

  // Le bouton ne s'active qu'une fois les deux champs remplis
  btnDate.disabled = !(jour && heure);

  if (jour && heure) {
    recap.textContent = `${jour}, ${heure}. ${motsHeure[heure]}`;
  } else if (jour) {
    recap.textContent = `${jour}, noté. Et à quelle heure ?`;
  } else if (heure) {
    recap.textContent = `${heure}, parfait. Reste à trouver le jour !`;
  } else {
    recap.textContent = "";
  }
}

selJour.addEventListener("change", majRecap);
selHeure.addEventListener("change", majRecap);
majRecap();

/* "Fixer la date !" -> page 4 : l'ambiance */
btnDate.addEventListener("click", () => {
  allerAPage(page4);
  pluieDeCoeurs();
});

/* ---------- Page 4 : le choix de l'ambiance ---------- */

const cartesAmbiance = document.querySelectorAll(".ambiance");
const recapAmbiance  = document.getElementById("recapAmbiance");
const btnAmbiance    = document.getElementById("btnAmbiance");

// Un mot pour chaque ambiance
const motsAmbiance = {
  "Sortie en amoureux": "Rien que nous deux, c'est noté 💕",
  "Mougouli intense":   "Ambiance chaude, j'arrive 🔥",
  "Soirée cinéma":      "Je m'occupe du popcorn 🍿",
  "Balade à la plage":  "Coucher de soleil et pieds nus 🌊",
};

cartesAmbiance.forEach((carte) => {
  carte.addEventListener("click", () => {
    cartesAmbiance.forEach((c) => c.classList.remove("choisie"));
    carte.classList.add("choisie");

    rendezVous.ambiance = carte.dataset.nom;
    recapAmbiance.textContent = motsAmbiance[rendezVous.ambiance];
    btnAmbiance.disabled = false;
  });
});

/* "C'est parti !" -> page 5 : le mot final */
btnAmbiance.addEventListener("click", () => {
  const carteChoisie = document.querySelector(".ambiance.choisie");

  document.getElementById("finalJour").textContent  = rendezVous.jour;
  document.getElementById("finalHeure").textContent = rendezVous.heure;
  document.getElementById("finalAmbiance").textContent =
    `Au programme : ${rendezVous.ambiance} ${carteChoisie.querySelector(".ambiance-icone").textContent}`;

  allerAPage(page5);
  pluieDeCoeurs();
  setTimeout(pluieDeCoeurs, 900);

  enregistrerReponse();
});

/* ---------- Envoi des réponses au back-office ---------- */

function enregistrerReponse() {
  // Si la base n'est pas joignable, le site continue de fonctionner normalement
  if (typeof appelerBase !== "function") return;

  appelerBase("irene_enregistrer", {
    p_jour:       rendezVous.jour,
    p_heure:      rendezVous.heure,
    p_ambiance:   rendezVous.ambiance,
    p_tentatives: nbFuites,          // nombre de tentatives sur le bouton "Non"
    p_appareil:   navigator.userAgent,
  }).catch((erreur) => console.warn("Réponse non enregistrée :", erreur.message));
}

/* ---------- Décor : coeurs qui montent ---------- */

function creerBulle() {
  const b = document.createElement("span");
  b.className = "bulle";
  b.textContent = Math.random() > 0.5 ? "💖" : "💕";
  b.style.left = aleatoire(0, 100) + "vw";
  b.style.fontSize = aleatoire(14, 34) + "px";
  b.style.animationDuration = aleatoire(7, 14) + "s";
  b.style.animationDelay = aleatoire(0, 6) + "s";
  bulles.appendChild(b);
}

for (let i = 0; i < 18; i++) creerBulle();

function pluieDeCoeurs() {
  for (let i = 0; i < 25; i++) {
    const b = document.createElement("span");
    b.className = "bulle";
    b.textContent = "💗";
    b.style.left = aleatoire(0, 100) + "vw";
    b.style.fontSize = aleatoire(18, 40) + "px";
    b.style.animationDuration = aleatoire(3, 6) + "s";
    b.style.animationDelay = aleatoire(0, 1) + "s";
    bulles.appendChild(b);
    setTimeout(() => b.remove(), 8000);
  }
}
