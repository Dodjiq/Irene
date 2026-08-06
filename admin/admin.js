/* =========================================================
   Back-office : connexion puis consultation des réponses.
   Le mot de passe n'est jamais dans le code : il est vérifié
   par la base de données (haché en bcrypt).
   ========================================================= */

const ecranConnexion = document.getElementById("ecranConnexion");
const ecranTableau   = document.getElementById("ecranTableau");
const formConnexion  = document.getElementById("formConnexion");
const champEmail     = document.getElementById("email");
const champMdp       = document.getElementById("motdepasse");
const erreur         = document.getElementById("erreur");
const btnConnexion   = document.getElementById("btnConnexion");
const btnRafraichir  = document.getElementById("btnRafraichir");
const btnDeconnexion = document.getElementById("btnDeconnexion");
const compteur       = document.getElementById("compteur");
const stats          = document.getElementById("stats");
const liste          = document.getElementById("liste");

// Identifiants gardés le temps de l'onglet uniquement
const CLE_SESSION = "irene-admin";

const icones = {
  "Sortie en amoureux": "💑",
  "Mougouli intense":   "🔥",
  "Soirée cinéma":      "🍿",
  "Balade à la plage":  "🏖️",
};

/* ---------- Connexion ---------- */

formConnexion.addEventListener("submit", async (e) => {
  e.preventDefault();
  await connecter(champEmail.value.trim(), champMdp.value);
});

async function connecter(email, mdp) {
  erreur.textContent = "";
  btnConnexion.disabled = true;
  btnConnexion.textContent = "Connexion...";

  try {
    const reponses = await appelerBase("irene_lire", { p_email: email, p_mdp: mdp });

    sessionStorage.setItem(CLE_SESSION, JSON.stringify({ email, mdp }));
    ecranConnexion.classList.add("cachee");
    ecranTableau.classList.remove("cachee");
    afficher(reponses);
  } catch (e) {
    erreur.textContent = e.message === "identifiants invalides"
      ? "E-mail ou mot de passe incorrect."
      : `Connexion impossible : ${e.message}`;
    champMdp.value = "";
  } finally {
    btnConnexion.disabled = false;
    btnConnexion.textContent = "Se connecter";
  }
}

/* Reconnexion automatique si l'onglet est déjà authentifié */
const sessionGardee = sessionStorage.getItem(CLE_SESSION);
if (sessionGardee) {
  const { email, mdp } = JSON.parse(sessionGardee);
  connecter(email, mdp);
}

btnDeconnexion.addEventListener("click", () => {
  sessionStorage.removeItem(CLE_SESSION);
  location.reload();
});

btnRafraichir.addEventListener("click", async () => {
  const garde = sessionStorage.getItem(CLE_SESSION);
  if (!garde) return;

  const { email, mdp } = JSON.parse(garde);
  btnRafraichir.disabled = true;
  btnRafraichir.textContent = "↻ ...";

  try {
    afficher(await appelerBase("irene_lire", { p_email: email, p_mdp: mdp }));
  } catch (e) {
    alert(`Impossible de recharger : ${e.message}`);
  } finally {
    btnRafraichir.disabled = false;
    btnRafraichir.textContent = "↻ Rafraîchir";
  }
});

/* ---------- Affichage ---------- */

function afficher(reponses) {
  compteur.textContent = reponses.length === 0
    ? "Aucune réponse pour le moment"
    : `${reponses.length} réponse${reponses.length > 1 ? "s" : ""} enregistrée${reponses.length > 1 ? "s" : ""}`;

  afficherStats(reponses);

  liste.innerHTML = "";

  if (reponses.length === 0) {
    const vide = document.createElement("p");
    vide.className = "vide-message";
    vide.textContent = "Elle n'a pas encore terminé le quiz... patience 💗";
    liste.appendChild(vide);
    return;
  }

  reponses.forEach((r) => liste.appendChild(carteReponse(r)));
}

function carteReponse(r) {
  const carte = document.createElement("article");
  carte.className = "reponse";

  const date = document.createElement("p");
  date.className = "reponse-date";
  date.textContent = formaterDate(r.cree_le);

  const rdv = document.createElement("p");
  rdv.className = "reponse-rdv";
  rdv.textContent = `${r.jour} à ${r.heure}`;

  const details = document.createElement("div");
  details.className = "reponse-details";
  details.appendChild(etiquette(`${icones[r.ambiance] || "✨"} ${r.ambiance}`));
  details.appendChild(etiquette(`${r.tentatives_non} tentative${r.tentatives_non > 1 ? "s" : ""} sur "Non"`, true));
  details.appendChild(etiquette(appareil(r.appareil), true));

  carte.append(date, rdv, details);
  return carte;
}

function etiquette(texte, gris = false) {
  const e = document.createElement("span");
  e.className = gris ? "etiquette etiquette-gris" : "etiquette";
  e.textContent = texte;
  return e;
}

function afficherStats(reponses) {
  const total = reponses.length;

  // La valeur la plus fréquente d'une colonne
  const plusFrequent = (champ) => {
    if (!total) return "—";
    const comptes = {};
    reponses.forEach((r) => { comptes[r[champ]] = (comptes[r[champ]] || 0) + 1; });
    return Object.entries(comptes).sort((a, b) => b[1] - a[1])[0][0];
  };

  const maxTentatives = total
    ? Math.max(...reponses.map((r) => r.tentatives_non))
    : 0;

  const donnees = [
    ["Réponses", total],
    ["Jour préféré", plusFrequent("jour")],
    ["Heure préférée", plusFrequent("heure")],
    ["Record sur \"Non\"", maxTentatives],
  ];

  stats.innerHTML = "";
  donnees.forEach(([nom, valeur]) => {
    const bloc = document.createElement("div");
    bloc.className = "stat";

    const v = document.createElement("span");
    v.className = "stat-valeur";
    v.textContent = valeur;

    const n = document.createElement("span");
    n.className = "stat-nom";
    n.textContent = nom;

    bloc.append(v, n);
    stats.appendChild(bloc);
  });
}

/* ---------- Petits utilitaires ---------- */

function formaterDate(iso) {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}

/* Transforme le user-agent en quelque chose de lisible */
function appareil(ua) {
  if (!ua) return "Appareil inconnu";
  if (/iPhone|iPad/i.test(ua))  return "iPhone / iPad";
  if (/Android/i.test(ua))      return "Android";
  if (/Windows/i.test(ua))      return "Ordinateur Windows";
  if (/Macintosh/i.test(ua))    return "Mac";
  return "Autre appareil";
}
