#!/usr/bin/env fish

# Configuration
set TIC80_EXE "tic80-pro"
set PROJECT_DIR "$HOME/Bureau/Projects/TIC80-JeuRenov"

cd $PROJECT_DIR

# Vérifications
set REQUIRED_FILES reference.tic index.js tiles_winter.png

for file in $REQUIRED_FILES
    if not test -f "$PROJECT_DIR/$file"
        echo "Erreur : Fichier manquant - $file" >&2
        exit 1
    end
end

# Petit backup de sécurité
cp reference.tic reference.backup.tic

# Génère automatiquement le fichier temporaire copybank.js
echo '// title: Copy Bank
// script: js
function BOOT() {
    sync(0, 1, true)
    exit()
}
function TIC() {}' > copybank.js

echo "STEP 1 - copie complète de la runtime vers la bank 1..."
set STEP1 "load reference.tic & import code copybank.js & run & save reference.tic & exit"
command $TIC80_EXE --fs $PROJECT_DIR --cmd $STEP1

echo "STEP 2 - import des tiles hiver dans la bank 1 + vrai code..."
set STEP2 "load reference.tic & import tiles tiles_winter.png bank=1 & import code index.js & save reference.tic & run"
command $TIC80_EXE --fs $PROJECT_DIR --cmd $STEP2

# Nettoyage après fermeture du jeu
if test -f copybank.js
    rm copybank.js
end

echo "Terminé !"