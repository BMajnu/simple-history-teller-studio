const { execSync } = require('child_process');

const ps = `
$procs = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 }
if ($procs) {
  $target = $procs[0]
  (New-Object -ComObject WScript.Shell).AppActivate($target.Id)
  Write-Output "Brought Chrome window to front: $($target.MainWindowTitle)"
} else {
  Write-Output "No Chrome window with handle found"
}
`;

try {
  const out = execSync(`powershell -Command "${ps.replace(/\n/g, '; ')}"`, { encoding: 'utf8' });
  console.log(out.trim());
} catch (e) {
  console.error(e.message);
}
