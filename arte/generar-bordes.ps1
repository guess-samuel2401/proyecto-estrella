# Genera arte\fuentes\bordes_agua.json y bordes_tierra.json: las orillas de cesped
# que se dibujan ENCIMA de un tile de agua o de tierra cuando tiene cesped al lado.
#
# Cuadros b01..b15: segun que vecinos son cesped. Se suman: Norte=1, Este=2, Sur=4, Oeste=8.
#   Ej.: cesped al norte y al este -> b03 (con la esquina redondeada).
# Cuadros esqNE, esqSE, esqSO, esqNO: cesped solo en esa diagonal (esquina interior);
#   se dibujan ademas del cuadro bXX que corresponda.
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$ondula = 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0   # la orilla entra 1 px mas en el centro
$radio = 5

function Es-Cesped($x, $y, $m, $esq) {
    $n = ($m -band 1) -ne 0; $e = ($m -band 2) -ne 0; $s = ($m -band 4) -ne 0; $o = ($m -band 8) -ne 0
    if ($y -lt 0) { if ($n) { return $true }; $y = 0 }
    if ($y -gt 15) { if ($s) { return $true }; $y = 15 }
    if ($x -gt 15) { if ($e) { return $true }; $x = 15 }
    if ($x -lt 0) { if ($o) { return $true }; $x = 0 }
    if ($n -and $y -lt 2 + $ondula[$x]) { return $true }
    if ($s -and (15 - $y) -lt 2 + $ondula[$x]) { return $true }
    if ($e -and (15 - $x) -lt 2 + $ondula[$y]) { return $true }
    if ($o -and $x -lt 2 + $ondula[$y]) { return $true }
    $rincones = @(
        @('NE', $n, $e, (15 - $x), $y),
        @('SE', $s, $e, (15 - $x), (15 - $y)),
        @('SO', $s, $o, $x, (15 - $y)),
        @('NO', $n, $o, $x, $y)
    )
    foreach ($r in $rincones) {
        if ($r[1] -and $r[2]) {
            $dx = (1.5 + $radio) - $r[3]
            $dy = (1.5 + $radio) - $r[4]
            if ($dx -gt 0 -and $dy -gt 0 -and [math]::Sqrt($dx * $dx + $dy * $dy) -gt $radio) { return $true }
        }
        if ($esq -eq $r[0] -and ($r[3] + $r[4]) -lt 3) { return $true }
    }
    return $false
}

function Crear-Cuadro($m, $esq) {
    $filas = @()
    for ($y = 0; $y -lt 16; $y++) {
        $fila = ''
        for ($x = 0; $x -lt 16; $x++) {
            $yo = Es-Cesped $x $y $m $esq
            $distinto = $false
            foreach ($d in @(@(0, -1), @(1, 0), @(0, 1), @(-1, 0))) {
                if ((Es-Cesped ($x + $d[0]) ($y + $d[1]) $m $esq) -ne $yo) { $distinto = $true }
            }
            if ($yo) { $fila += $(if ($distinto) { 'g' } else { 'm' }) }
            else { $fila += $(if ($distinto) { 's' } else { '.' }) }
        }
        $filas += $fila
    }
    return , $filas
}

$cuadros = [ordered]@{}
$nombres = @()
for ($m = 1; $m -le 15; $m++) {
    $nombre = 'b{0:d2}' -f $m
    $cuadros[$nombre] = Crear-Cuadro $m ''
    $nombres += $nombre
}
foreach ($esq in 'NE', 'SE', 'SO', 'NO') {
    $cuadros["esq$esq"] = Crear-Cuadro 0 $esq
    $nombres += "esq$esq"
}
# Variante irregular (cuadros 19..33): la orilla tiene dos "mordiscos" en otros sitios.
# Empieza y acaba en 0 para que encaje con las casillas vecinas.
$ondula = 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0
for ($m = 1; $m -le 15; $m++) {
    $nombre = 'v{0:d2}' -f $m
    $cuadros[$nombre] = Crear-Cuadro $m ''
    $nombres += $nombre
}

$tipos = @{ agua = '#8CC4DC'; tierra = '#8A5A44'; camino = '#E2C08F' }
foreach ($tipo in $tipos.Keys) {
    $doc = [ordered]@{
        nombre      = "bordes_$tipo"
        descripcion = "Orillas de cesped para dibujar encima de un tile de $tipo. bXX: suma de vecinos con cesped (N=1, E=2, S=4, O=8). esqXX: esquina interior cuando solo la diagonal es cesped. Generado por generar-bordes.ps1; no editar a mano."
        colores     = [ordered]@{ m = '#BFE3B4'; g = '#7FBF8E'; s = $tipos[$tipo] }
        animaciones = [ordered]@{ tiles = [ordered]@{ fps = 0; cuadros = $nombres } }
        cuadros     = $cuadros
    }
    $destino = Join-Path $raiz "fuentes\bordes_$tipo.json"
    [IO.File]::WriteAllText($destino, ($doc | ConvertTo-Json -Depth 6))
    Write-Output "Generado: $destino"
}
