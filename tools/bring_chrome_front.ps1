Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32Window {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

$chromeProcs = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 }
foreach ($p in $chromeProcs) {
    [Win32Window]::ShowWindow($p.MainWindowHandle, 9) # 9 = SW_RESTORE
    [Win32Window]::SetForegroundWindow($p.MainWindowHandle)
}

$wshell = New-Object -ComObject WScript.Shell
$wshell.AppActivate('Google Chrome')
$wshell.AppActivate('YouTube')
$wshell.AppActivate('Chrome')
Write-Host "Chrome window brought to foreground!"
