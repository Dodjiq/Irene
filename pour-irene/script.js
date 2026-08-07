/* =========================================================
   Pour Irène — le ciel, les apparitions, le compteur,
   les cartes et le bouton final.
   ========================================================= */

const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const aleatoire = (min, max) => Math.random() * (max - min) + min;

/* ---------------------------------------------------------
   1. Le ciel : étoiles + cœurs qui montent
   --------------------------------------------------------- */
const ciel = document.getElementById("ciel");

function remplirLeCiel() {
  if (mouvementReduit) return;

  for (let i = 0; i < 70; i++) {
    const etoile = document.createElement("span");
    const taille = aleatoire(1, 2.8);

    etoile.className = "etoile";
    etoile.style.width = etoile.style.height = taille + "px";
    etoile.style.left = aleatoire(0, 100) + "vw";
    etoile.style.top = aleatoire(0, 100) + "vh";
    etoile.style.animationDuration = aleatoire(2.5, 6) + "s";
    etoile.style.animationDelay = aleatoire(0, 5) + "s";

    ciel.appendChild(etoile);
  }

  for (let i = 0; i < 12; i++) {
    const coeur = document.createElement("span");

    coeur.className = "coeur-flottant";
    coeur.textContent = Math.random() > 0.5 ? "🤍" : "💗";
    coeur.style.left = aleatoire(0, 100) + "vw";
    coeur.style.fontSize = aleatoire(11, 22) + "px";
    coeur.style.animationDuration = aleatoire(16, 30) + "s";
    coeur.style.animationDelay = aleatoire(0, 18) + "s";

    ciel.appendChild(coeur);
  }
}

remplirLeCiel();

/* ---------------------------------------------------------
   2. Apparition des éléments au défilement
   --------------------------------------------------------- */
const observateur = new IntersectionObserver((entrees) => {
  entrees.forEach((entree) => {
    if (!entree.isIntersecting) return;
    entree.target.classList.add("visible");
    observateur.unobserve(entree.target);
  });
}, { threshold: 0.25, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveler").forEach((el) => observateur.observe(el));

/* Les cartes des raisons apparaissent l'une après l'autre */
document.querySelectorAll(".raisons .raison").forEach((carte, i) => {
  carte.style.transitionDelay = 0.1 + i * 0.09 + "s";
});

/* ---------------------------------------------------------
   3. Le compteur qui déborde
   --------------------------------------------------------- */
const jauge     = document.getElementById("jauge");
const valeur    = document.getElementById("jaugeValeur");
const barre     = document.getElementById("jaugeBarre");
const legende   = document.getElementById("jaugeLegende");

const paliers = [
  [0,  "mesure en cours..."],
  [25, "déjà plus que tout ce que j'avais prévu"],
  [55, "on approche du maximum"],
  [80, "attention, ça monte encore"],
  [97, "le compteur commence à chauffer"],
];

function lancerCompteur() {
  const duree = 2600;
  const depart = performance.now();

  function etape(maintenant) {
    const avancee = Math.min(1, (maintenant - depart) / duree);
    // Démarrage franc puis ralentissement
    const adouci = 1 - Math.pow(1 - avancee, 3);
    const pourcentage = Math.round(adouci * 100);

    valeur.firstChild.textContent = pourcentage;
    barre.style.width = pourcentage + "%";

    const palier = paliers.filter(([seuil]) => pourcentage >= seuil).pop();
    if (palier) legende.textContent = palier[1];

    if (avancee < 1) {
      requestAnimationFrame(etape);
    } else {
      setTimeout(deborder, 900);
    }
  }

  requestAnimationFrame(etape);
}

/* Arrivé à 100 %, la mesure lâche */
function deborder() {
  jauge.classList.add("depasse");
  valeur.firstChild.textContent = "∞";
  legende.textContent = "il n'existe pas d'unité pour ça.";
}

const observateurJauge = new IntersectionObserver((entrees) => {
  entrees.forEach((entree) => {
    if (!entree.isIntersecting) return;
    observateurJauge.unobserve(entree.target);

    if (mouvementReduit) { deborder(); barre.style.width = "100%"; return; }
    setTimeout(lancerCompteur, 500);
  });
}, { threshold: 0.5 });

observateurJauge.observe(jauge);

/* ---------------------------------------------------------
   4. Les cartes se retournent
   --------------------------------------------------------- */
document.querySelectorAll(".raison").forEach((carte) => {
  carte.addEventListener("click", () => carte.classList.toggle("retournee"));
});

/* ---------------------------------------------------------
   5. La lettre s'écrit
   --------------------------------------------------------- */
const entete = document.getElementById("lettreEntete");
const lignes = document.querySelectorAll(".lettre-ligne");
const final  = document.querySelector(".lettre-final");
const signature = document.querySelector(".signature");
const TEXTE_ENTETE = "Irène,";

function ecrireLaLettre() {
  // Les paragraphes montent un par un
  lignes.forEach((ligne, i) => {
    setTimeout(() => ligne.classList.add("visible"), 900 + i * 700);
  });

  setTimeout(() => final.classList.add("visible"), 900 + lignes.length * 700);
  setTimeout(() => signature.classList.add("visible"), 1200 + lignes.length * 700);

  // L'en-tête se tape lettre par lettre
  entete.classList.add("frappe");
  let i = 0;

  const frappe = setInterval(() => {
    entete.textContent = TEXTE_ENTETE.slice(0, ++i);
    if (i < TEXTE_ENTETE.length) return;

    clearInterval(frappe);
    setTimeout(() => entete.classList.remove("frappe"), 1600);
  }, 170);
}

const observateurLettre = new IntersectionObserver((entrees) => {
  entrees.forEach((entree) => {
    if (!entree.isIntersecting) return;
    observateurLettre.unobserve(entree.target);

    if (mouvementReduit) {
      entete.textContent = TEXTE_ENTETE;
      [...lignes, final, signature].forEach((el) => el.classList.add("visible"));
      return;
    }

    ecrireLaLettre();
  });
}, { threshold: 0.2 });

observateurLettre.observe(document.querySelector(".lettre"));

/* ---------------------------------------------------------
   6. Le bouton "Je t'aime"
   --------------------------------------------------------- */
const bouton  = document.getElementById("boutonAmour");
const message = document.getElementById("compteMessage");
const total   = document.getElementById("compteTotal");

const CLE = "irene-je-taime";
let compte = Number(localStorage.getItem(CLE) || 0);

// Le message change au fil des clics
const etapes = [
  [1,   "Encore une fois pour être sûr."],
  [3,   "Tu peux continuer, je ne me lasse pas."],
  [7,   "Sept fois. Et je le pense à chaque fois."],
  [15,  "Tu commences à comprendre l'idée ?"],
  [30,  "Trente. Et ce n'est même pas la moitié."],
  [50,  "Cinquante fois, et le compteur tient encore mieux que l'autre."],
  [100, "Cent. Là, tu le fais exprès — et j'adore ça."],
  [200, "Deux cents. Bon, je te laisse, j'ai une déclaration à écrire."],
];

const COEURS = ["❤️", "💗", "💖", "💓", "🤍", "💘"];

function majMessage() {
  const etape = etapes.filter(([seuil]) => compte >= seuil).pop();
  if (etape) message.textContent = etape[1];

  total.textContent = compte > 0
    ? `${compte} fois ${compte > 1 ? "déjà" : ""}`.trim()
    : "";
}

if (compte > 0) majMessage();

bouton.addEventListener("click", (e) => {
  compte++;
  localStorage.setItem(CLE, compte);
  majMessage();

  const r = bouton.getBoundingClientRect();
  const x = e.clientX || r.left + r.width / 2;
  const y = e.clientY || r.top + r.height / 2;

  faireJaillirDesCoeurs(x, y);
});

function faireJaillirDesCoeurs(x, y) {
  if (mouvementReduit) return;

  for (let i = 0; i < 9; i++) {
    const coeur = document.createElement("span");

    coeur.className = "eclat";
    coeur.textContent = COEURS[Math.floor(Math.random() * COEURS.length)];
    coeur.style.left = x + "px";
    coeur.style.top = y + "px";
    coeur.style.fontSize = aleatoire(16, 34) + "px";
    coeur.style.setProperty("--dx", aleatoire(-160, 160) + "px");
    coeur.style.setProperty("--dy", aleatoire(-220, -70) + "px");
    coeur.style.setProperty("--rot", aleatoire(-90, 90) + "deg");

    document.body.appendChild(coeur);
    setTimeout(() => coeur.remove(), 1200);
  }
}
