<?php
declare(strict_types=1);

const DEFAULT_MESSAGE = 'Estamos realizando tareas de mantenimiento. Vuelve a visitarnos pronto.';

function maintenance_response(string $message, bool $api): void
{
    http_response_code(503);
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Retry-After: 60');
    header('X-Robots-Tag: noindex');
    if ($api) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'maintenance', 'message' => $message], JSON_UNESCAPED_UNICODE);
        return;
    }
    header('Content-Type: text/html; charset=utf-8');
    $safeMessage = htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    // Static assets are also gated during maintenance, so embed the brand mark.
    $logoFile = __DIR__ . '/imgs/logo-color.webp';
    $logoBytes = is_file($logoFile) ? file_get_contents($logoFile) : false;
    $logo = $logoBytes !== false
        ? '<img src="data:image/webp;base64,' . base64_encode($logoBytes) . '" alt="YAP Partners Corporation" width="270" height="80">'
        : '<strong class="wordmark">YAP PARTNERS</strong>';
    echo <<<HTML
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#1b2a4a">
  <meta name="robots" content="noindex, nofollow">
  <title>En mantenimiento | YAP Partners</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root { --navy: #1b2a4a; --gold: #c9a74c; --paper: #f6f6f6; font-family: Manrope, Arial, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: var(--paper); color: var(--navy); }
    .site-header { background: #fff; border-bottom: 1px solid rgba(27, 42, 74, .09); }
    .header-inner { max-width: 1170px; margin: auto; min-height: 112px; padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .brand img { display: block; width: min(270px, 58vw); height: auto; }
    .wordmark { font-size: 20px; letter-spacing: .16em; }
    .header-note { font-size: 11px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #8a691b; white-space: nowrap; }
    .hero { min-height: calc(100vh - 112px); display: grid; align-items: center; position: relative; overflow: hidden; background: var(--navy); color: #fff; }
    .hero::before { content: ""; position: absolute; width: min(72vw, 840px); aspect-ratio: 1; border: 1px solid rgba(201, 167, 76, .16); border-radius: 50%; right: -17%; top: -42%; box-shadow: 0 0 0 90px rgba(255,255,255,.025), 0 0 0 180px rgba(255,255,255,.018); pointer-events: none; }
    .hero::after { content: ""; position: absolute; inset: auto 0 0; height: 5px; background: linear-gradient(90deg, var(--gold), #e7d9ad 45%, var(--gold)); }
    .hero-inner { width: 100%; max-width: 1170px; margin: auto; padding: 110px 28px 130px; position: relative; z-index: 1; }
    .eyebrow { display: flex; align-items: center; gap: 16px; color: #e1c678; font-size: 12px; font-weight: 800; letter-spacing: .23em; text-transform: uppercase; }
    .eyebrow::before { content: ""; width: 42px; height: 2px; background: var(--gold); }
    h1 { max-width: 900px; margin: 32px 0 24px; font-size: clamp(45px, 7.5vw, 94px); font-weight: 600; letter-spacing: -.055em; line-height: 1.06; }
    h1 span { color: var(--gold); }
    .message { max-width: 620px; margin: 0; color: rgba(255,255,255,.78); font-size: clamp(17px, 2vw, 20px); line-height: 1.7; }
    .retry { display: inline-flex; align-items: center; gap: 34px; margin-top: 42px; padding: 16px 25px; border: 1px solid var(--gold); border-radius: 100px; color: #fff; text-decoration: none; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; transition: background .2s, color .2s; }
    .retry:hover, .retry:focus-visible { background: var(--gold); color: var(--navy); outline: none; }
    .retry svg { width: 18px; height: 18px; }
    .hero-footer { position: absolute; bottom: 38px; left: max(28px, calc((100% - 1114px) / 2)); z-index: 1; color: rgba(255,255,255,.46); font-size: 11px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; }
    @media (max-width: 640px) {
      .header-inner { min-height: 86px; padding: 18px 22px; }
      .header-note { display: none; }
      .hero { min-height: calc(100vh - 86px); }
      .hero::before { width: 110vw; right: -60%; top: -15%; }
      .hero-inner { padding: 88px 24px 126px; }
      .eyebrow { font-size: 10px; letter-spacing: .16em; }
      .eyebrow::before { width: 28px; }
      h1 { margin-top: 25px; }
      .retry { margin-top: 34px; }
      .hero-footer { left: 24px; bottom: 30px; font-size: 10px; }
    }
    @media (prefers-reduced-motion: reduce) { .retry { transition: none; } }
  </style>
</head>
<body>
  <header class="site-header"><div class="header-inner"><div class="brand">{$logo}</div><div class="header-note">YAP Partners · Lima, Perú</div></div></header>
  <main class="hero"><div class="hero-inner">
    <div class="eyebrow">Pausa temporal</div>
    <h1>Estamos en <span>mantenimiento.</span></h1>
    <p class="message">{$safeMessage}</p>
    <a class="retry" href="/">Volver a intentar <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  </div><div class="hero-footer">Holding empresarial multisectorial</div></main>
</body>
</html>
HTML;
}

function control_state(string $projectId, string $siteId): ?array
{
    if (!function_exists('curl_init')) {
        return null;
    }
    $url = 'https://firestore.googleapis.com/v1/projects/' . rawurlencode($projectId)
        . '/databases/(default)/documents/site_controls/' . rawurlencode($siteId);
    $handle = curl_init($url);
    if ($handle === false) {
        return null;
    }
    curl_setopt_array($handle, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_HTTPHEADER => ['Cache-Control: no-cache'],
    ]);
    $body = curl_exec($handle);
    $status = curl_getinfo($handle, CURLINFO_HTTP_CODE);
    curl_close($handle);
    if ($body === false || $status !== 200) {
        return null;
    }
    $document = json_decode($body, true);
    $maintenance = $document['fields']['maintenance']['booleanValue'] ?? null;
    if (!is_bool($maintenance)) {
        return null;
    }
    $message = $document['fields']['message']['stringValue'] ?? null;
    return ['maintenance' => $maintenance, 'message' => is_string($message) && trim($message) !== '' ? $message : DEFAULT_MESSAGE];
}

function serve_static(string $path): void
{
    if ($path === '/') {
        $path = '/index.html';
    }
    $parts = explode('/', ltrim($path, '/'));
    if (in_array('..', $parts, true) || in_array('.', $parts, true)
        || strpos($path, "\0") !== false || strpos($path, '\\') !== false) {
        http_response_code(404);
        return;
    }
    $rootFile = count($parts) === 1 && preg_match('/\.(?:html|css|js|xml|txt)$/i', $parts[0]);
    $assetFile = count($parts) > 1 && in_array($parts[0], ['imgs', 'logos', 'videos'], true);
    if (!$rootFile && !$assetFile) {
        http_response_code(404);
        return;
    }
    $root = realpath(__DIR__);
    $file = realpath(__DIR__ . DIRECTORY_SEPARATOR . ltrim($path, '/'));
    if ($root === false || $file === false || strpos($file, $root . DIRECTORY_SEPARATOR) !== 0 || !is_file($file)) {
        http_response_code(404);
        return;
    }
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)) {
        http_response_code(405);
        header('Allow: GET, HEAD');
        return;
    }
    $types = [
        'html' => 'text/html', 'css' => 'text/css', 'js' => 'text/javascript',
        'xml' => 'application/xml', 'txt' => 'text/plain', 'svg' => 'image/svg+xml',
        'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
        'webp' => 'image/webp', 'gif' => 'image/gif', 'ico' => 'image/x-icon',
        'mp4' => 'video/mp4', 'webm' => 'video/webm', 'woff' => 'font/woff',
        'woff2' => 'font/woff2', 'pdf' => 'application/pdf',
    ];
    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if (!array_key_exists($extension, $types)) {
        http_response_code(404);
        return;
    }
    header('Content-Type: ' . ($types[$extension] ?? 'application/octet-stream'));
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Accept-Ranges: bytes');
    $size = filesize($file);
    $start = 0;
    $end = $size - 1;
    $range = $_SERVER['HTTP_RANGE'] ?? '';
    if ($range !== '') {
        if (!preg_match('/^bytes=(\d*)-(\d*)$/', $range, $matches) || ($matches[1] === '' && $matches[2] === '')) {
            http_response_code(416);
            header('Content-Range: bytes */' . $size);
            return;
        }
        if ($matches[1] === '') {
            $start = max(0, $size - (int) $matches[2]);
        } else {
            $start = (int) $matches[1];
        }
        $end = $matches[2] === '' || $matches[1] === '' ? $size - 1 : min((int) $matches[2], $size - 1);
        if ($start > $end || $start >= $size) {
            http_response_code(416);
            header('Content-Range: bytes */' . $size);
            return;
        }
        http_response_code(206);
        header('Content-Range: bytes ' . $start . '-' . $end . '/' . $size);
    }
    header('Content-Length: ' . ($end - $start + 1));
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') {
        return;
    }
    $stream = fopen($file, 'rb');
    if ($stream === false) {
        return;
    }
    fseek($stream, $start);
    $remaining = $end - $start + 1;
    while ($remaining > 0 && !feof($stream)) {
        $chunk = fread($stream, min(65536, $remaining));
        if ($chunk === false || $chunk === '') {
            break;
        }
        echo $chunk;
        $remaining -= strlen($chunk);
    }
    fclose($stream);
}

$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$api = $path === '/api' || strpos($path, '/api/') === 0;
$projectId = trim(getenv('FIREBASE_PROJECT_ID') ?: '');
$siteId = trim(getenv('SITE_ID') ?: '');
if ($projectId !== '' || $siteId !== '') {
    $state = ($projectId !== '' && $siteId !== '') ? control_state($projectId, $siteId) : null;
    if ($state === null || $state['maintenance']) {
        maintenance_response($state['message'] ?? DEFAULT_MESSAGE, $api);
        exit;
    }
}
if ($api) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo json_encode(['error' => 'not_found']);
    exit;
}
serve_static($path);
