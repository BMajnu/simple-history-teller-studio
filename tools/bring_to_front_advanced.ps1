Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class WinUtil {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    public static extern bool SwitchToThisWindow(IntPtr hWnd, bool fAltTab);
}
"@

$chromePids = (Get-Process chrome -ErrorAction SilentlyContinue).Id
$found = @()

[WinUtil]::EnumWindows({
    param($hWnd, $lParam)
    $pId = 0
    [WinUtil]::GetWindowThreadProcessId($hWnd, [ref]$pId)
    if ($chromePids -contains $pId) {
        if ([WinUtil]::IsWindowVisible($hWnd)) {
            $sb = New-Object System.Text.StringBuilder 256
            [WinUtil]::GetWindowText($hWnd, $sb, 256)
            $title = $sb.ToString()
            if ($title.Length -gt 0) {
                Write-Host "Found Chrome Window HWND: $hWnd (PID: $pId, Title: '$title')"
                [WinUtil]::ShowWindow($hWnd, 3) # 3 = SW_MAXIMIZE
                [WinUtil]::SetForegroundWindow($hWnd)
                [WinUtil]::SwitchToThisWindow($hWnd, $true)
            }
        }
    }
    return $true
}, [IntPtr]::Zero)
