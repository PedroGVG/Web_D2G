$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot 'index.html'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Set-LocalizedText {
    param(
        [Parameter(Mandatory)] [string] $Html,
        [Parameter(Mandatory)] [ValidateSet('es', 'en')] [string] $Language
    )

    $pattern = '(?s)<(?<tag>[a-zA-Z][a-zA-Z0-9]*)(?<attributes>[^>]*\bdata-lang-' +
        $Language + '="(?<translation>[^"]*)"[^>]*)>(?<content>.*?)</\k<tag>>'

    return [regex]::Replace($Html, $pattern, {
        param($match)

        return '<' + $match.Groups['tag'].Value + $match.Groups['attributes'].Value + '>' +
            $match.Groups['translation'].Value + '</' + $match.Groups['tag'].Value + '>'
    })
}

function Use-RootRelativeAssets {
    param([Parameter(Mandatory)] [string] $Html)

    $Html = $Html.Replace('href="css/', 'href="/css/')
    $Html = $Html.Replace('src="assets/', 'src="/assets/')
    $Html = $Html.Replace('data-img-es="assets/', 'data-img-es="/assets/')
    $Html = $Html.Replace('data-img-en="assets/', 'data-img-en="/assets/')
    $Html = $Html.Replace('src="js/', 'src="/js/')
    return $Html
}

function Use-EnglishImages {
    param([Parameter(Mandatory)] [string] $Html)

    $pattern = '(?m)^(?<prefix>\s*<img\b[^>]*\bsrc=")[^"]*(?<suffix>"[^>]*\bdata-img-en="(?<target>[^"]+)"[^>]*>)$'
    return [regex]::Replace($Html, $pattern, {
        param($match)

        return $match.Groups['prefix'].Value + $match.Groups['target'].Value + $match.Groups['suffix'].Value
    })
}

function Convert-ToEnglish {
    param([Parameter(Mandatory)] [string] $Html)

    $Html = Set-LocalizedText -Html $Html -Language 'en'
    $Html = $Html.Replace('<html lang="es">', '<html lang="en">')
    $Html = [regex]::Replace($Html, '<meta name="description" content="[^"]*">', '<meta name="description" content="Turn your golf data into a competitive edge with Tour-level telemetry, real-time Strokes Gained analysis, strategic hole maps, and a predictive AI caddie.">')
    $Html = [regex]::Replace($Html, '<meta name="keywords" content="[^"]*">', '<meta name="keywords" content="golf analytics, strokes gained, golf AI, golf course strategy, AI caddie, lower golf handicap, golf coaching platform">')
    $Html = $Html.Replace('<link rel="canonical" href="https://data2gain.com/es/">', '<link rel="canonical" href="https://data2gain.com/en/">')
    $Html = $Html.Replace('<link rel="manifest" href="/site-es.webmanifest">', '<link rel="manifest" href="/site-en.webmanifest">')
    $Html = [regex]::Replace($Html, '<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="Data2Gain — Course Strategy, Telemetry &amp; Specialized Services">')
    $Html = [regex]::Replace($Html, '<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="Feel the shot with intuition. Decide strategy with data. Tour intelligence, without the Tour.">')
    $Html = $Html.Replace('<meta property="og:url" content="https://data2gain.com/es/">', '<meta property="og:url" content="https://data2gain.com/en/">')
    $Html = $Html.Replace('<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="en_US">')
    $Html = $Html.Replace('<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="es_ES">')
    $Html = [regex]::Replace($Html, '<meta name="twitter:title" content="[^"]*">', '<meta name="twitter:title" content="Data2Gain — Advanced Strokes Gained Analytics">')
    $Html = [regex]::Replace($Html, '<meta name="twitter:description" content="[^"]*">', '<meta name="twitter:description" content="Make better on-course decisions with Tour-level golf intelligence.">')

    $schemaReplacements = [ordered]@{
        '"inLanguage": "es"' = '"inLanguage": "en"'
        '"description": "Plataforma de telemetría de golf y analítica avanzada Strokes Gained con IA interactiva."' = '"description": "Golf telemetry and advanced Strokes Gained analytics with interactive AI."'
        '"url": "https://data2gain.com/es/"' = '"url": "https://data2gain.com/en/"'
        '"name": "¿Cómo funciona Data2Gain?"' = '"name": "How does Data2Gain work?"'
        '"text": "Registra o importa tu ronda, analiza tus patrones con Strokes Gained y recibe decisiones y plan de práctica de nuestro Caddie IA."' = '"text": "Record or import your round, analyze your Strokes Gained patterns, and receive decisions and a practice plan from our AI Caddie."'
        '"name": "¿Cuánto cuesta?"' = '"name": "How much does it cost?"'
        '"text": "Data2Gain tiene un precio único de 8,95€ al mes para acceso completo a la analítica pro."' = '"text": "Data2Gain costs €8.95 per month and includes full access to pro analytics."'
    }

    foreach ($entry in $schemaReplacements.GetEnumerator()) {
        $Html = $Html.Replace($entry.Key, $entry.Value)
    }

    $staticReplacements = [ordered]@{
        'href="/es/" class="nav-brand-group" aria-label="Data2Gain Inicio"' = 'href="/en/" class="nav-brand-group" aria-label="Data2Gain Home"'
        '<nav class="lang-switcher-pill" aria-label="Selector de idioma">' = '<nav class="lang-switcher-pill" aria-label="Language selector">'
        '<a href="/es/" class="lang-flag-btn active" data-lang="es" aria-label="Español" title="Español" aria-current="page">' = '<a href="/es/" class="lang-flag-btn" data-lang="es" aria-label="Español" title="Español">'
        '<a href="/en/" class="lang-flag-btn" data-lang="en" aria-label="English" title="English">' = '<a href="/en/" class="lang-flag-btn active" data-lang="en" aria-label="English" title="English" aria-current="page">'
        'aria-label="Plataforma"' = 'aria-label="Platform"'
        'alt="Mapa de hoyo de campeonato con telemetría de Strokes Gained en cada trampa y zona de riesgo"' = 'alt="Championship hole map with Strokes Gained telemetry for every hazard and risk zone"'
        'alt="Gráfico de dispersión real en radar"' = 'alt="Real shot-dispersion radar chart"'
        'alt="Análisis Gap de cobertura de bolsa"' = 'alt="Golf bag gap and distance coverage analysis"'
        'alt="Estadísticas de Putt y matriz de caídas"' = 'alt="Putting statistics and break matrix"'
        'alt="Data2Gain AI Agent - Opciones de análisis y chat"' = 'alt="Data2Gain AI Agent analysis and chat options"'
        'alt="Data2Gain AI Agent - Recomendaciones y gráficos interactivos"' = 'alt="Data2Gain AI Agent recommendations and interactive charts"'
        'aria-label="Ampliar imagen"' = 'aria-label="Enlarge image"'
        'title="Ampliar imagen"' = 'title="Enlarge image"'
        'title="Verificado"' = 'title="Verified"'
        'title="Certificada"' = 'title="Certified"'
        'aria-label="Plataforma para coaches"' = 'aria-label="Platform for coaches"'
        'aria-label="Consultoría"' = 'aria-label="Consulting"'
        'aria-label="Formación"' = 'aria-label="Training"'
        'aria-label="Cerrar visor"' = 'aria-label="Close viewer"'
        'title="Cerrar (Esc)"' = 'title="Close (Esc)"'
        'alt="Captura ampliada"' = 'alt="Enlarged screenshot"'
    }

    foreach ($entry in $staticReplacements.GetEnumerator()) {
        $Html = $Html.Replace($entry.Key, $entry.Value)
    }

    return Use-EnglishImages -Html $Html
}

$sourceHtml = Get-Content -Raw -Encoding UTF8 -LiteralPath $sourcePath
$sourceHtml = Use-RootRelativeAssets -Html $sourceHtml

$spanishHtml = Set-LocalizedText -Html $sourceHtml -Language 'es'
$englishHtml = Convert-ToEnglish -Html $sourceHtml

foreach ($locale in @(
    @{ Name = 'es'; Html = $spanishHtml },
    @{ Name = 'en'; Html = $englishHtml }
)) {
    $localeDirectory = Join-Path $projectRoot $locale.Name
    [System.IO.Directory]::CreateDirectory($localeDirectory) | Out-Null
    $outputPath = Join-Path $localeDirectory 'index.html'
    [System.IO.File]::WriteAllText($outputPath, $locale.Html, $utf8NoBom)
    Write-Output "Generated $outputPath"
}
