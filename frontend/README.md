# Anti — Boutique de mobilier (React + Vite + TypeScript + TailwindCSS)

Site e-commerce complet de meubles, entièrement en français, converti depuis un prototype HTML/Tailwind en application **React + Vite + TypeScript (strict) + TailwindCSS**.

## 🚀 Démarrage

```bash
npm install
npm run dev       # développement (http://localhost:5173)
npm run typecheck # vérification TypeScript (mode strict)
npm run build     # tsc --noEmit && build de production
npm run preview   # prévisualiser le build
```

## 🔑 Comptes de démonstration

| Rôle   | Email          | Mot de passe |
| ------ | -------------- | ------------ |
| Admin  | admin@anti.fr  | admin123     |
| Client | client@anti.fr | client123    |

## 🧩 Fonctionnalités

### Boutique publique
- **Accueil** : héro animé, catégories, collection signature, nouveautés, bannière promo, avis, blog
- **Boutique** : recherche, filtres (catégorie, prix, stock), tri, pagination par défilement
- **Fiche produit** : onglets description/caractéristiques/avis, gestion du stock, produits associés
- **Collections**, **À propos**, **Blog** (4 articles), **Contact** (formulaire validé + FAQ)
- **Panier** : tiroir latéral + page dédiée, livraison offerte dès 300 €, quantités persistées
- **Commande** : adresses enregistrées, livraison standard/express, 3 moyens de paiement (simulés), codes promo `ANTI10` (−10 %) et `BIENVENUE` (−15 %)
- **Favoris** persistants, notifications toast, recherche instantanée

### Espace client (`/espace-client`)
- Tableau de bord : commandes, total dépensé, points fidélité
- Historique et suivi détaillé des commandes (chronologie de statut)
- Carnet d'adresses (CRUD, adresse par défaut)
- Profil : modification des informations et du mot de passe

### Espace admin (`/admin`)
- **Tableau de bord** : chiffre d'affaires, panier moyen, graphique 6 mois, statuts, alertes stock
- **Produits** : CRUD complet (modal, sélecteur d'images, prix barré, étiquettes Nouveau/Vedette)
- **Commandes** : filtres par statut, recherche, changement de statut, fiche détaillée
- **Clients** : liste, nombre de commandes, total dépensé

### Technique
- React Router v6 (routes protégées par rôle), Context API (Store / Cart / Toast)
- Persistance `localStorage` : produits, commandes, utilisateurs, panier, favoris, session
- Design system Material 3 adapté (palette chaude), composants UI réutilisables
- 100 % responsive (mobile-first), animations au scroll et respect de `prefers-reduced-motion`

## 📁 Structure

```
src/
├── components/
│   ├── admin/       # Layouts & widgets spécifiques
│   ├── home/        # Sections de la page d'accueil
│   ├── layout/      # Navbar, Footer, Drawer panier, Layouts client/admin
│   ├── product/     # ProductCard
│   ├── shop/        # Filtres boutique
│   └── ui/          # Button, Modal, Badge, Form, Avatar, BarChart…
├── context/         # StoreContext (données), CartContext, ToastContext
├── data/            # Produits, catégories, collections, blog, seed
├── pages/
│   ├── public/      # Accueil, Boutique, Produit, Panier, Commande…
│   ├── client/      # Dashboard, commandes, adresses, profil
│   └── admin/       # Dashboard, produits, commandes, clients
└── utils/           # Formats (€, dates FR), constantes (statuts, livraison…)
```

> 💡 Les données de démo sont stockées dans `localStorage`. Pour repartir de zéro :
> ouvrez la console du navigateur et exécutez `localStorage.clear()`.
