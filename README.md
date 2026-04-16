# 📱 RestoGest Mobile - APK Android

Application de gestion de restaurant en version mobile Android.

## 🎯 Obtenir l'APK (GUIDE PAS-À-PAS)

Suivez ces étapes dans l'ordre — aucune installation requise sur votre ordinateur !

---

### ✅ ÉTAPE 1 — Créer un compte GitHub (3 minutes)

1. Allez sur **https://github.com/signup**
2. Entrez votre email, créez un mot de passe
3. Choisissez un nom d'utilisateur (exemple : `mohamedbenali2026`)
4. Vérifiez votre email
5. Choisissez le plan **Free** (gratuit)

---

### ✅ ÉTAPE 2 — Créer un nouveau dépôt (2 minutes)

1. Une fois connecté, cliquez sur le bouton vert **"New"** en haut à gauche
   (ou allez sur https://github.com/new)
2. Remplissez :
   - **Repository name** : `restogest-mobile`
   - **Description** : `Mon app de gestion de restaurant`
   - Cochez **Private** (pour garder votre code privé)
   - **NE PAS cocher** "Add README" (on l'a déjà)
3. Cliquez sur **"Create repository"**

---

### ✅ ÉTAPE 3 — Uploader les fichiers du projet (5 minutes)

Sur la page du dépôt que vous venez de créer :

1. Cliquez sur le lien bleu **"uploading an existing file"**
   (ou glissez-déposez directement)
2. **Glissez-déposez TOUS les fichiers et dossiers** de ce projet :
   - `src/` (dossier)
   - `.github/` (dossier) ⚠️ important : commence par un point
   - `public/` (dossier)
   - `resources/` (dossier)
   - `package.json`
   - `vite.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `capacitor.config.json`
   - `index.html`
   - `.gitignore` ⚠️ commence par un point
   - `README.md`

3. En bas de la page, dans **"Commit changes"** :
   - Laissez le message par défaut ou écrivez "Upload initial"
4. Cliquez sur le bouton vert **"Commit changes"**

📝 **Astuce** : Si vous ne voyez pas les fichiers commençant par un point (`.github`, `.gitignore`), activez l'affichage des fichiers cachés sur votre ordinateur :
- **Windows** : Dans l'explorateur, Affichage → cochez "Éléments masqués"
- **Mac** : Dans le Finder, appuyez sur `Cmd + Shift + .`

---

### ✅ ÉTAPE 4 — Lancer le build de l'APK (1 clic !)

1. Sur la page du dépôt, cliquez sur l'onglet **"Actions"** (tout en haut)
2. Vous verrez **"Build Android APK"** dans la liste à gauche
3. Si c'est votre premier build, cliquez sur le gros bouton vert qui dit 
   **"I understand my workflows, go ahead and enable them"**
4. Le build démarre automatiquement ! 🎉

**OU** pour le lancer manuellement :
- Cliquez sur **"Build Android APK"** dans la colonne de gauche
- Cliquez sur **"Run workflow"** (bouton à droite)
- Sélectionnez la branche `main` et cliquez sur **"Run workflow"**

---

### ⏱️ ÉTAPE 5 — Attendre la compilation (8 à 12 minutes)

- Un nouveau job apparaît avec un point jaune 🟡 (en cours)
- Cliquez dessus pour voir la progression en temps réel
- Les étapes s'exécutent une par une (cases vertes ✅)
- Allez prendre un thé à la menthe ☕ pendant ce temps !

Quand le point devient **vert ✅**, c'est terminé !

---

### ✅ ÉTAPE 6 — Télécharger l'APK (1 minute)

1. Cliquez sur le job terminé
2. Scrollez jusqu'en bas de la page
3. Dans la section **"Artifacts"**, vous verrez **"RestoGest-APK"**
4. Cliquez dessus → ça télécharge un fichier ZIP
5. **Extrayez le ZIP** sur votre ordinateur
6. À l'intérieur : `RestoGest-v1.0.0.apk` 🎉

---

### ✅ ÉTAPE 7 — Installer l'APK sur votre téléphone Android

#### Méthode A : Par câble USB

1. Connectez votre téléphone à l'ordinateur en USB
2. Copiez `RestoGest-v1.0.0.apk` dans le dossier "Téléchargements" du téléphone
3. Sur le téléphone, ouvrez **Fichiers** → **Téléchargements**
4. Appuyez sur `RestoGest-v1.0.0.apk`
5. Si Android vous dit "installation bloquée" → **Paramètres** → 
   **Autoriser depuis cette source**
6. Appuyez sur **Installer**
7. Ouvrez l'app **RestoGest** depuis votre liste d'apps ! 🎉

#### Méthode B : Par email/WhatsApp (sans câble)

1. Envoyez `RestoGest-v1.0.0.apk` à vous-même par email ou WhatsApp
2. Sur le téléphone, ouvrez l'email/message
3. Téléchargez et ouvrez le fichier APK
4. Même procédure d'installation que ci-dessus

#### Méthode C : Par QR Code (le plus simple !)

1. Uploadez l'APK sur Google Drive, Dropbox, ou votre hébergement
2. Générez un QR code du lien de téléchargement (utilisez qr-code-generator.com)
3. Scannez le QR avec votre téléphone → téléchargement direct

---

## 🔄 Mises à jour

Pour générer une nouvelle version :

1. Modifiez votre code dans le dépôt GitHub
2. Le build se déclenche **automatiquement** à chaque modification
3. Téléchargez la nouvelle APK après 10 minutes
4. Installez par-dessus l'ancienne (les données sont conservées)

---

## 🐛 Problèmes fréquents

### ❌ "Build failed" en rouge
- Cliquez sur le job rouge pour voir l'erreur
- Vérifiez que **TOUS** les fichiers ont bien été uploadés (y compris `.github/workflows/build-apk.yml`)

### ❌ "L'APK ne s'installe pas"
- Autorisez les "sources inconnues" dans **Paramètres → Sécurité**
- Vérifiez que votre Android est version 6.0+ (devrait être bon pour tous les téléphones depuis 2016)

### ❌ "Application non installée"
- Vous avez peut-être déjà une ancienne version avec une signature différente
- Désinstallez-la d'abord, puis réessayez

---

## 💡 Astuces

- **GitHub Actions est gratuit** : 2000 minutes/mois de build (environ 200 builds)
- **L'APK pèse ~12 Mo**, téléchargeable même en 3G
- **Cette version est en mode debug** — parfait pour tester, pas pour distribution finale
- Pour un APK "release" signé (plus petit, plus sécurisé), voir `capacitor-android-guide.md`

---

## 📱 Configuration recommandée téléphone

- **Android 6.0+** (Marshmallow, 2015)
- **2 Go RAM** minimum
- **50 Mo** d'espace libre
- **Usage en restaurant** : tablette 10" Android (Samsung Tab A / Huawei MatePad)

---

Bon courage ! 🚀🇹🇳
