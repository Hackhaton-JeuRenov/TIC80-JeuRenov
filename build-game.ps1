param(
    [string]$Tic80Exe = "C:\Program Files\Tic80\tic80.exe",
    [string]$ProjectDir = "C:\HELMO\B2\hackathon\TIC80-JeuRenov"
)

$ErrorActionPreference = "Stop"

Set-Location $ProjectDir

# Vérifications
$requiredFiles = @(
    "reference.tic",
    "index.js",
    "tiles_spring.png",
    "tiles_winter.png"
)


foreach ($file in $requiredFiles) {
    if (-not (Test-Path (Join-Path $ProjectDir $file))) {
        throw "Fichier manquant : $file"
    }
}

# Petit backup de sécurité
Copy-Item "reference.tic" "reference.backup.tic" -Force

# Génère automatiquement le fichier temporaire copybank.js
$copyBankJs = @'
// title: Copy Bank
// script: js

function BOOT() {
    sync(0, 1, true)
    exit()
}

function TIC() {}
'@

Set-Content -Path (Join-Path $ProjectDir "copybank.js") -Value $copyBankJs -Encoding ASCII

Write-Host "STEP 1 - copie complète de la runtime vers la bank 1..."
$step1 = "load reference.tic & import code copybank.js & run & save reference.tic & exit"
& $Tic80Exe --fs $ProjectDir --cmd $step1

Write-Host "STEP 2 - import des tiles hiver dans la bank 1 + vrai code..."
$step2 = "load reference.tic & import tiles tiles_spring.png bank=0 & import tiles tiles_winter.png bank=1 & import code index.js & save reference.tic & run"
& $Tic80Exe --fs $ProjectDir --cmd $step2

# Nettoyage après fermeture du jeu
if (Test-Path (Join-Path $ProjectDir "copybank.js")) {
    Remove-Item (Join-Path $ProjectDir "copybank.js") -Force
}