$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$animalsDir = Join-Path $root "public/assets/animals"
$animatedRoot = Join-Path $animalsDir "animated"
$tracksRoot = Join-Path $animalsDir "tracks"

$profileMap = @{
  unicorn = "mythic"
  dragon = "mythic"
  phoenix = "mythic"
  penguin = "splash"
  seal = "splash"
  otter = "splash"
  turtle = "splash"
  dolphin = "splash"
  whale = "splash"
  duck = "splash"
  swan = "splash"
  octopus = "splash"
  chick = "wing"
  ladybug = "wing"
  bee = "wing"
  butterfly = "wing"
  owl = "wing"
  dove = "wing"
  parrot = "wing"
  flamingo = "wing"
  peacock = "wing"
}

$palette = @(
  [System.Drawing.Color]::FromArgb(255, 250, 174, 200),
  [System.Drawing.Color]::FromArgb(255, 147, 197, 253),
  [System.Drawing.Color]::FromArgb(255, 253, 224, 71),
  [System.Drawing.Color]::FromArgb(255, 167, 139, 250),
  [System.Drawing.Color]::FromArgb(255, 110, 231, 183),
  [System.Drawing.Color]::FromArgb(255, 251, 146, 60)
)

function Get-ProfileForAnimal([string]$animalId) {
  if ($profileMap.ContainsKey($animalId)) {
    return $profileMap[$animalId]
  }
  return "paw"
}

function New-Graphics([System.Drawing.Bitmap]$bitmap) {
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  return $graphics
}

function Save-Png([System.Drawing.Bitmap]$bitmap, [string]$destPath) {
  $dir = Split-Path -Parent $destPath
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  $bitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

function New-Frame(
  [string]$srcPath,
  [string]$destPath,
  [float]$translateX,
  [float]$translateY,
  [float]$rotation,
  [float]$scale,
  [bool]$flipX
) {
  $image = [System.Drawing.Image]::FromFile($srcPath)
  try {
    $bitmap = New-Object System.Drawing.Bitmap($image.Width, $image.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = New-Graphics $bitmap
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.TranslateTransform(($image.Width / 2) + $translateX, ($image.Height / 2) + $translateY)
      $graphics.RotateTransform($rotation)
      $scaleX = if ($flipX) { -1 * $scale } else { $scale }
      $graphics.ScaleTransform($scaleX, $scale)
      $graphics.TranslateTransform(-1 * ($image.Width / 2), -1 * ($image.Height / 2), [System.Drawing.Drawing2D.MatrixOrder]::Append)
      $graphics.DrawImage($image, 0, 0, $image.Width, $image.Height)
    } finally {
      $graphics.Dispose()
    }
    Save-Png $bitmap $destPath
    $bitmap.Dispose()
  } finally {
    $image.Dispose()
  }
}

function Draw-PawTrack([System.Drawing.Graphics]$graphics, [System.Drawing.Color]$color) {
  $brush = New-Object System.Drawing.SolidBrush($color)
  try {
    $graphics.FillEllipse($brush, 18, 28, 28, 20)
    $graphics.FillEllipse($brush, 13, 16, 10, 10)
    $graphics.FillEllipse($brush, 24, 10, 10, 10)
    $graphics.FillEllipse($brush, 36, 12, 10, 10)
    $graphics.FillEllipse($brush, 47, 19, 10, 10)
  } finally {
    $brush.Dispose()
  }
}

function Draw-WingTrack([System.Drawing.Graphics]$graphics, [System.Drawing.Color]$color) {
  $brush = New-Object System.Drawing.SolidBrush($color)
  try {
    $pointsA = [System.Drawing.Point[]]@(
      (New-Object System.Drawing.Point(15, 34)),
      (New-Object System.Drawing.Point(24, 18)),
      (New-Object System.Drawing.Point(36, 30)),
      (New-Object System.Drawing.Point(29, 47))
    )
    $pointsB = [System.Drawing.Point[]]@(
      (New-Object System.Drawing.Point(34, 34)),
      (New-Object System.Drawing.Point(45, 18)),
      (New-Object System.Drawing.Point(55, 30)),
      (New-Object System.Drawing.Point(49, 47))
    )
    $graphics.FillPolygon($brush, $pointsA)
    $graphics.FillPolygon($brush, $pointsB)
    $graphics.FillEllipse($brush, 24, 28, 16, 16)
  } finally {
    $brush.Dispose()
  }
}

function Draw-SplashTrack([System.Drawing.Graphics]$graphics, [System.Drawing.Color]$color) {
  $brush = New-Object System.Drawing.SolidBrush($color)
  try {
    $graphics.FillEllipse($brush, 24, 22, 18, 24)
    $graphics.FillEllipse($brush, 16, 34, 12, 14)
    $graphics.FillEllipse($brush, 39, 34, 12, 14)
    $graphics.FillEllipse($brush, 30, 12, 8, 10)
  } finally {
    $brush.Dispose()
  }
}

function Draw-MythicTrack([System.Drawing.Graphics]$graphics, [System.Drawing.Color]$color) {
  $brush = New-Object System.Drawing.SolidBrush($color)
  try {
    $points = [System.Drawing.Point[]]@(
      (New-Object System.Drawing.Point(32, 10)),
      (New-Object System.Drawing.Point(39, 25)),
      (New-Object System.Drawing.Point(56, 27)),
      (New-Object System.Drawing.Point(43, 38)),
      (New-Object System.Drawing.Point(47, 54)),
      (New-Object System.Drawing.Point(32, 45)),
      (New-Object System.Drawing.Point(17, 54)),
      (New-Object System.Drawing.Point(21, 38)),
      (New-Object System.Drawing.Point(8, 27)),
      (New-Object System.Drawing.Point(25, 25))
    )
    $graphics.FillPolygon($brush, $points)
    $graphics.FillEllipse($brush, 9, 11, 7, 7)
    $graphics.FillEllipse($brush, 49, 13, 6, 6)
  } finally {
    $brush.Dispose()
  }
}

function New-TrackIcon([string]$destPath, [string]$profile, [System.Drawing.Color]$color) {
  $bitmap = New-Object System.Drawing.Bitmap(64, 64, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = New-Graphics $bitmap
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    switch ($profile) {
      "wing" { Draw-WingTrack $graphics $color }
      "splash" { Draw-SplashTrack $graphics $color }
      "mythic" { Draw-MythicTrack $graphics $color }
      default { Draw-PawTrack $graphics $color }
    }
  } finally {
    $graphics.Dispose()
  }
  Save-Png $bitmap $destPath
  $bitmap.Dispose()
}

Get-ChildItem -Path $animalsDir -Filter "*.png" | Sort-Object Name | ForEach-Object -Begin { $index = 0 } -Process {
  $animalId = $_.BaseName
  $profile = Get-ProfileForAnimal $animalId
  $color = $palette[$index % $palette.Count]
  $flip = ($index % 2) -eq 0
  $destDir = Join-Path $animatedRoot $animalId

  New-Frame $_.FullName (Join-Path $destDir "idle.png") 0 0 0 1.00 $false
  New-Frame $_.FullName (Join-Path $destDir "walk-a.png") -3 -1 -5 1.02 $flip
  New-Frame $_.FullName (Join-Path $destDir "walk-b.png") 3 1 4 0.98 (-not $flip)
  New-Frame $_.FullName (Join-Path $destDir "held.png") 0 -8 8 1.06 $flip
  New-TrackIcon (Join-Path $tracksRoot "$animalId.png") $profile $color

  $index += 1
}
