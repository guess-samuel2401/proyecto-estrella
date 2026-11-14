# Convierte cada arte\fuentes\*.json en PNG dentro de arte\sprites:
#   <nombre>.png            -> primer cuadro, tamano real
#   <nombre>_<anim>.png     -> tira horizontal con los cuadros de cada animacion
#   ..._x8.png              -> las mismas imagenes ampliadas para revisarlas
# En las filas, "." es un pixel transparente.
Add-Type -AssemblyName System.Drawing
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$salida = Join-Path $raiz 'sprites'
New-Item -ItemType Directory -Force $salida | Out-Null

function Guardar-Tira($cuadros, $colores, $base) {
    $alto = $cuadros[0].Count
    $ancho = $cuadros[0][0].Length
    foreach ($escala in 1, 8) {
        $bmp = New-Object System.Drawing.Bitmap ($ancho * $cuadros.Count * $escala), ($alto * $escala)
        for ($n = 0; $n -lt $cuadros.Count; $n++) {
            for ($y = 0; $y -lt $alto; $y++) {
                for ($x = 0; $x -lt $ancho; $x++) {
                    $ch = [string]$cuadros[$n][$y][$x]
                    if (-not $colores.ContainsKey($ch)) { continue }
                    for ($dy = 0; $dy -lt $escala; $dy++) {
                        for ($dx = 0; $dx -lt $escala; $dx++) {
                            $bmp.SetPixel(($n * $ancho + $x) * $escala + $dx, $y * $escala + $dy, $colores[$ch])
                        }
                    }
                }
            }
        }
        $sufijo = if ($escala -eq 1) { '' } else { "_x$escala" }
        $destino = Join-Path $salida "$base$sufijo.png"
        $bmp.Save($destino, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Write-Output "Generado: $destino"
    }
}

foreach ($archivo in Get-ChildItem (Join-Path $raiz 'fuentes') -Filter *.json) {
    $s = Get-Content $archivo.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    $colores = @{}
    foreach ($p in $s.colores.PSObject.Properties) {
        $colores[$p.Name] = [System.Drawing.ColorTranslator]::FromHtml($p.Value)
    }
    if ($s.cuadros) {
        $primero = @($s.cuadros.PSObject.Properties)[0].Value
        Guardar-Tira @(, $primero) $colores $s.nombre
        foreach ($anim in $s.animaciones.PSObject.Properties) {
            $lista = @()
            foreach ($nombreCuadro in $anim.Value.cuadros) { $lista += , $s.cuadros.$nombreCuadro }
            Guardar-Tira $lista $colores "$($s.nombre)_$($anim.Name)"
            # Capas: tiras en blanco solo con ciertas letras, para que el juego las tina (p. ej. la bufanda).
            if ($s.capas) {
                foreach ($capa in $s.capas.PSObject.Properties) {
                    $soloCapa = @{}
                    foreach ($letra in $capa.Value) { $soloCapa[[string]$letra] = [System.Drawing.Color]::White }
                    Guardar-Tira $lista $soloCapa "$($s.nombre)_$($anim.Name)_$($capa.Name)"
                }
            }
        }
    } else {
        Guardar-Tira @(, $s.filas) $colores $s.nombre
    }
}
