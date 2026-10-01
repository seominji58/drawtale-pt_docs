param([string]$pptx, [string]$outDir)
$pp = New-Object -ComObject PowerPoint.Application
$pres = $pp.Presentations.Open($pptx, $true, $false, $false)
New-Item -ItemType Directory -Force $outDir | Out-Null
$i = 1
foreach ($s in $pres.Slides) { $s.Export((Join-Path $outDir ("s{0:D2}.png" -f $i)), "PNG", 1600, 900); $i++ }
$pres.Close()
$pp.Quit()
