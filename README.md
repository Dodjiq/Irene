# Irene

Deux sites en HTML, CSS et JavaScript natifs, sans aucune dépendance.

- **`/`** — le quiz de la demande, en 5 étapes.
- **`/pour-irene/`** — une déclaration à faire défiler, indépendante du quiz.
- **`/admin/`** — le back-office qui affiche les réponses au quiz.

---

# 1. Le quiz

## Le parcours

1. **La question** — « Tu veux toujours sortir avec moi ? » avec un bouton « Non » impossible à cliquer : il glisse toujours du côté opposé au curseur, sans jamais quitter la ligne du bouton « Oui ».
2. **La réaction** — 😳 « Attends... t'as vraiment dit oui ? »
3. **Le rendez-vous** — choix du jour et de l'heure.
4. **L'ambiance** — 4 cartes au choix.
5. **Le mot final** — le récapitulatif du rendez-vous et un petit mot signé.

## Le back-office

Adresse : `/admin` (par exemple `https://dodjiq.github.io/Irene/admin/`).

Connexion par e-mail et mot de passe, puis affichage de chaque partie terminée :
date, jour et heure choisis, ambiance, nombre de tentatives sur le bouton « Non »
et type d'appareil — plus un résumé en haut (jour le plus choisi, record de tentatives).

Le mot de passe n'apparaît nulle part dans le code : il est haché en bcrypt et
vérifié par la base de données. La table n'est pas lisible directement depuis
l'API ; tout passe par deux fonctions Postgres (`irene_enregistrer`, `irene_lire`).

## Fichiers

- `index.html` — les 5 pages
- `style.css` — le style, les animations et le responsive
- `script.js` — l'esquive du bouton « Non », la navigation et les choix
- `config.js` — connexion à la base (clé publiable)
- `admin/` — le back-office (`index.html`, `admin.css`, `admin.js`)

---

# 2. « Pour Irène » — la déclaration

Dossier `pour-irene/`. Un site à part entière, sans base de données et sans
rendez-vous : une page qui se déroule au défilement, sur fond de nuit étoilée.

1. **Ouverture** — son prénom en grand, écrit à la plume.
2. **Le compteur** — « À quel point je t'aime ? » : la mesure monte jusqu'à 100 %
   puis lâche et affiche ∞.
3. **Les raisons** — six cartes à retourner d'un clic.
4. **La lettre** — l'en-tête s'écrit lettre par lettre, les paragraphes montent
   un par un, la signature arrive en dernier.
5. **Le bouton** — « Je t'aime » fait jaillir des cœurs ; le nombre de clics est
   gardé sur l'appareil et le message évolue au fil des appuis.

**À personnaliser** : les six raisons (`index.html`), le texte de la lettre et
les messages du bouton (`script.js`) sont écrits volontairement larges — remplace-les
par vos souvenirs à vous.

## Lancer les sites

Ouvrir `index.html` dans un navigateur, aucune installation. Le back-office a
besoin d'être servi en HTTP (GitHub Pages, ou un simple serveur local).
