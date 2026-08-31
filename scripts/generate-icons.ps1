$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot 'assets\logo.png'
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

function New-IconBitmap {
    param(
        [Parameter(Mandatory)] [int] $Size,
        [double] $ContentScale = 1.0
    )

    $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.Clear([System.Drawing.Color]::FromArgb(255, 0, 0, 0))
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

        $contentSize = [int][Math]::Round($Size * $ContentScale)
        $offset = [int][Math]::Round(($Size - $contentSize) / 2)
        $graphics.DrawImage($sourceImage, $offset, $offset, $contentSize, $contentSize)
    }
    finally {
        $graphics.Dispose()
    }

    return $bitmap
}

function Save-PngIcon {
    param(
        [Parameter(Mandatory)] [int] $Size,
        [Parameter(Mandatory)] [string] $FileName,
        [double] $ContentScale = 1.0
    )

    $bitmap = New-IconBitmap -Size $Size -ContentScale $ContentScale
    try {
        $outputPath = Join-Path $projectRoot $FileName
        $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "Generated $outputPath"
    }
    finally {
        $bitmap.Dispose()
    }
}

function Get-PngBytes {
    param([Parameter(Mandatory)] [int] $Size)

    $bitmap = New-IconBitmap -Size $Size
    $stream = [System.IO.MemoryStream]::new()
    try {
        $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        return ,$stream.ToArray()
    }
    finally {
        $stream.Dispose()
        $bitmap.Dispose()
    }
}

function Save-Favicon {
    $sizes = @(16, 32, 48, 256)
    $frames = [System.Collections.Generic.List[byte[]]]::new()
    foreach ($size in $sizes) {
        $frames.Add((Get-PngBytes -Size $size))
    }
    $outputPath = Join-Path $projectRoot 'favicon.ico'
    $stream = [System.IO.File]::Open($outputPath, [System.IO.FileMode]::Create)
    $writer = [System.IO.BinaryWriter]::new($stream)

    try {
        $writer.Write([uint16] 0)
        $writer.Write([uint16] 1)
        $writer.Write([uint16] $frames.Count)

        $offset = 6 + (16 * $frames.Count)
        for ($index = 0; $index -lt $frames.Count; $index++) {
            $size = $sizes[$index]
            $dimensionByte = if ($size -eq 256) { 0 } else { $size }
            $writer.Write([byte] $dimensionByte)
            $writer.Write([byte] $dimensionByte)
            $writer.Write([byte] 0)
            $writer.Write([byte] 0)
            $writer.Write([uint16] 1)
            $writer.Write([uint16] 32)
            $writer.Write([uint32] $frames[$index].Length)
            $writer.Write([uint32] $offset)
            $offset += $frames[$index].Length
        }

        foreach ($frame in $frames) {
            $writer.Write($frame)
        }
    }
    finally {
        $writer.Dispose()
        $stream.Dispose()
    }

    Write-Output "Generated $outputPath"
}

try {
    Save-PngIcon -Size 16 -FileName 'favicon-16x16.png'
    Save-PngIcon -Size 32 -FileName 'favicon-32x32.png'
    Save-PngIcon -Size 180 -FileName 'apple-touch-icon.png'
    Save-PngIcon -Size 192 -FileName 'icon-192.png'
    Save-PngIcon -Size 512 -FileName 'icon-512.png'
    Save-PngIcon -Size 512 -FileName 'icon-512-maskable.png' -ContentScale 0.8
    Save-Favicon
}
finally {
    $sourceImage.Dispose()
}
