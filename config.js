/* Connexion à la base Supabase.
   Cette clé est "publiable" : elle est faite pour vivre dans le navigateur.
   Elle ne permet ni de lire la table ni de la modifier — seulement d'appeler
   les deux fonctions prévues, et la lecture exige le mot de passe admin,
   vérifié côté serveur. */
const SUPABASE_URL = "https://ffhgfgdrudkqspgtbcdj.supabase.co";
const SUPABASE_KEY = "sb_publishable_fP4EX7VLtvgNODFNviQvWA_n72pVS6B";

/* Petit utilitaire : appelle une fonction de la base */
async function appelerBase(fonction, parametres) {
  const reponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fonction}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(parametres),
  });

  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    throw new Error(donnees?.message || "Erreur de connexion");
  }

  return donnees;
}
