# Irene

Un petit site en HTML, CSS et JavaScript natifs — une demande en 5 étapes.

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

## Lancer le site

Ouvrir `index.html` dans un navigateur. Aucune dépendance, aucune installation.

## Fichiers

- `index.html` — les 5 pages
- `style.css` — le style, les animations et le responsive
- `script.js` — l'esquive du bouton « Non », la navigation et les choix
- `config.js` — connexion à la base (clé publiable)
- `admin/` — le back-office (`index.html`, `admin.css`, `admin.js`)
