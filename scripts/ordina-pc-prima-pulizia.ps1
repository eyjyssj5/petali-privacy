# Pulizia prudente di Desktop e Download. Non cancella dati, non modifica Ubuntu o APK.
# Repository Petali: snapshot del 27/10/2026. Eseguire in Windows PowerShell 5.1.
$ErrorActionPreference = 'Stop'
$root = Join-Path $env:USERPROFILE 'ARCHIVIO_PC_2026-10-27'
$desktop = [Environment]::GetFolderPath('Desktop')
$downloads = Join-Path $env:USERPROFILE 'Downloads'
$work = Join-Path $desktop 'app ama no ama'
$apk = Join-Path $work '01_APP_ATTUALE\Petali-debug.apk'
$key = Join-Path $work '02_CHIAVI_GOOGLE_PLAY\chiavi-petali.jks'
$save = Join-Path $root '00_SICUREZZA_PETALI'
$reportDir = Join-Path $root '99_REPORT'

if (!(Test-Path -LiteralPath $apk -PathType Leaf)) {
    throw "STOP: manca l'APK attuale in $apk. Nessun file e' stato spostato."
}
if (!(Test-Path -LiteralPath $key -PathType Leaf)) {
    throw "STOP: manca la chiave di firma in $key. Nessun file e' stato spostato."
}
if (!(Test-Path -LiteralPath $downloads -PathType Container)) {
    throw "STOP: non trovo la cartella Download: $downloads"
}
if (!(Test-Path -LiteralPath $desktop -PathType Container)) {
    throw "STOP: non trovo il Desktop: $desktop"
}
New-Item -ItemType Directory -Force -Path $save,$reportDir | Out-Null

function CopyAndVerify([string]$from,[string]$to) {
    Copy-Item -LiteralPath $from -Destination $to -Force
    $a=(Get-FileHash -LiteralPath $from -Algorithm SHA256).Hash
    $b=(Get-FileHash -LiteralPath $to -Algorithm SHA256).Hash
    if ($a -ne $b) { throw "STOP: copia non verificata: $from" }
    Write-Host "SALVATO E VERIFICATO: $to" -ForegroundColor Green
}
CopyAndVerify $apk (Join-Path $save 'Petali-debug-ultima-versione.apk')
CopyAndVerify $key (Join-Path $save 'chiavi-petali.jks')

$log = New-Object 'System.Collections.Generic.List[object]'
$errors = New-Object 'System.Collections.Generic.List[string]'
$keptFolders = New-Object 'System.Collections.Generic.List[string]'

function IsProtected([System.IO.FileSystemInfo]$item) {
    if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { return $true }
    if (($item.Attributes -band [System.IO.FileAttributes]::System) -ne 0) { return $true }
    if (($item.Attributes -band [System.IO.FileAttributes]::Hidden) -ne 0) { return $true }
    if ($item.Name -match '(?i)(^desktop\.ini$|^~\$|\.crdownload$|\.part$|\.download$|\.tmp$)') { return $true }
    if ($item.Name -match '(?i)(\.jks$|\.keystore$|\.p12$|\.p8$|\.pem$|\.key$|\.kdbx$|^\.env|google-services\.json$|service.account|^key\.properties$|^local\.properties$|^gradle\.properties$)') { return $true }
    return $false
}
function Category([System.IO.FileSystemInfo]$item) {
    if ($item.PSIsContainer) { return 'CARTELLE' }
    $e = $item.Extension.ToLowerInvariant()
    if (@('.zip','.7z','.rar','.tar','.gz') -contains $e) { return 'ARCHIVI' }
    if (@('.png','.jpg','.jpeg','.webp','.gif','.bmp','.heic','.svg') -contains $e) { return 'IMMAGINI' }
    if (@('.mp4','.mov','.avi','.mkv','.mp3','.wav','.m4a','.webm') -contains $e) { return 'VIDEO_AUDIO' }
    if (@('.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.txt','.rtf','.csv','.md','.odt') -contains $e) { return 'DOCUMENTI' }
    if (@('.apk','.aab','.exe','.msi') -contains $e) { return 'PROGRAMMI_APK' }
    return 'ALTRI_FILE'
}
function MoveIntoArchive([System.IO.FileSystemInfo]$item,[string]$origin) {
    $dir = Join-Path (Join-Path $root $origin) (Category $item)
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $name = $item.Name
    $stem = if ($item.PSIsContainer) { $item.Name } else { [IO.Path]::GetFileNameWithoutExtension($item.Name) }
    $ext = if ($item.PSIsContainer) { '' } else { $item.Extension }
    $dest = Join-Path $dir $name
    $n = 1
    while (Test-Path -LiteralPath $dest) {
        $dest = Join-Path $dir ("{0}_{1:D3}{2}" -f $stem,$n,$ext)
        $n++
    }
    try {
        Move-Item -LiteralPath $item.FullName -Destination $dest -ErrorAction Stop
        $log.Add([pscustomobject]@{Origine=$item.FullName;Destinazione=$dest;Data=(Get-Date).ToString('s')})
    } catch {
        $errors.Add("Non spostato: $($item.FullName) - $($_.Exception.Message)")
    }
}

# Desktop: lasciamo intatti collegamenti, script, cartelle di lavoro e programmi.
$desktopFileExtensions = @('.zip','.7z','.rar','.tar','.gz','.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.txt','.csv','.md','.png','.jpg','.jpeg','.webp','.gif','.heic','.mp4','.mov','.avi','.mkv','.mp3','.wav','.m4a','.apk','.aab')
foreach ($item in @(Get-ChildItem -LiteralPath $desktop -Force -ErrorAction Stop)) {
    if (IsProtected $item) { continue }
    if ($item.PSIsContainer) {
        $keptFolders.Add($item.FullName)
    } elseif ($desktopFileExtensions -contains $item.Extension.ToLowerInvariant()) {
        MoveIntoArchive $item '01_DESKTOP'
    }
}

# Download: riordiniamo file e cartelle generiche.
# Cartelle dei progetti in sviluppo restano dove si trovano per non rompere i percorsi.
foreach ($item in @(Get-ChildItem -LiteralPath $downloads -Force -ErrorAction Stop)) {
    if (IsProtected $item) { continue }
    if ($item.PSIsContainer -and $item.Name -match '(?i)(sofia|simula|gatto|petali|aivevia|android|studio|sdk|node_modules|progett|git|\.venv)') {
        $keptFolders.Add($item.FullName)
        continue
    }
    MoveIntoArchive $item '02_DOWNLOAD'
}

$log | Export-Csv -LiteralPath (Join-Path $reportDir 'MOVIMENTI.csv') -Encoding UTF8 -NoTypeInformation
$errors | Set-Content -LiteralPath (Join-Path $reportDir 'ERRORI.txt') -Encoding UTF8
$keptFolders | Sort-Object -Unique | Set-Content -LiteralPath (Join-Path $reportDir 'CARTELLE_DI_LAVORO_NON_SPOSTATE.txt') -Encoding UTF8
$state = @(
    "PULIZIA PRUDENTE DEL $(Get-Date)"
    "Cartella archivio: $root"
    "APK e chiave: copie SHA256 verificate in $save"
    "Elementi spostati: $($log.Count)"
    "Elementi non spostati per errori: $($errors.Count)"
    "Cartelle lavoro lasciate in sede: $($keptFolders.Count)"
    "Non e' stato cancellato alcun file definitivamente."
    "Non sono stati toccati Ubuntu, GitHub, APK nel percorso originale e keystore originale."
    "Controllare MOVIMENTI.csv prima di cancellare vecchie copie."
)
$state | Set-Content -LiteralPath (Join-Path $reportDir 'RIEPILOGO.txt') -Encoding UTF8
Write-Host ""
Write-Host 'PULIZIA PRUDENTE COMPLETATA' -ForegroundColor Green
Write-Host "Archivio: $root"
Write-Host "Elementi spostati: $($log.Count)"
Write-Host "Errori: $($errors.Count)"
Write-Host "Report: $(Join-Path $reportDir 'RIEPILOGO.txt')"
Write-Host 'NON cancellare ancora cartelle di lavoro o vecchie versioni: prima leggere il report.'
