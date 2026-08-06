/* =========================================================
   Back-office : connexion, puis tableau de bord.
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
const compteConnecte = document.getElementById("compteConnecte");
const compteur       = document.getElementById("compteur");
const pastilleTotal  = document.getElementById("pastilleTotal");
const stats          = document.getElementById("stats");
const lignes         = document.getElementById("lignes");
const vide           = document.getElementById("vide");

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
    document.body.classList.add("connecte");
    compteConnecte.textContent = email;

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

/* ---------- Affichage du tableau de bord ---------- */

function afficher(reponses) {
  const total = reponses.length;

  compteur.textContent = total === 0
    ? "Aucune réponse pour le moment"
    : `${total} partie${total > 1 ? "s" : ""} terminée${total > 1 ? "s" : ""}`;
  pastilleTotal.textContent = total;

  afficherStats(reponses);

  lignes.innerHTML = "";
  vide.classList.toggle("cachee", total > 0);

  reponses.forEach((r) => lignes.appendChild(ligne(r)));
}

function ligne(r) {
  const tr = document.createElement("tr");

  tr.appendChild(cellule("Quand", formaterDate(r.cree_le), "cellule-date"));
  tr.appendChild(cellule("Jour choisi", r.jour, "cellule-forte"));
  tr.appendChild(cellule("Heure", r.heure, "cellule-forte"));

  const ambiance = document.createElement("td");
  ambiance.dataset.colonne = "Ambiance";
  ambiance.appendChild(etiquette(`${icones[r.ambiance] || "✨"} ${r.ambiance}`));
  tr.appendChild(ambiance);

  const tentatives = document.createElement("td");
  tentatives.dataset.colonne = "Tentatives « Non »";
  tentatives.appendChild(etiquette(String(r.tentatives_non), true));
  tr.appendChild(tentatives);

  tr.appendChild(cellule("Appareil", appareil(r.appareil), "cellule-appareil"));

  return tr;
}

function cellule(colonne, texte, classe) {
  const td = document.createElement("td");
  td.dataset.colonne = colonne;
  if (classe) td.className = classe;
  td.textContent = texte;
  return td;
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

  const record = total ? Math.max(...reponses.map((r) => r.tentatives_non)) : 0;
  const ambiance = plusFrequent("ambiance");

  const donnees = [
    ["💌", "Parties terminées", total],
    ["🗓️", "Jour préféré",      plusFrequent("jour")],
    ["🕰️", "Heure préférée",    plusFrequent("heure")],
    ["✨", "Ambiance préférée", total ? `${icones[ambiance] || ""} ${ambiance}` : "—"],
    ["🏃", "Record sur « Non »", record],
  ];

  stats.innerHTML = "";

  donnees.forEach(([icone, nom, valeur]) => {
    const bloc = document.createElement("div");
    bloc.className = "stat";

    const i = document.createElement("span");
    i.className = "stat-icone";
    i.textContent = icone;

    const n = document.createElement("span");
    n.className = "stat-nom";
    n.textContent = nom;

    const v = document.createElement("span");
    v.className = "stat-valeur";
    v.textContent = valeur;

    bloc.append(i, n, v);
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
