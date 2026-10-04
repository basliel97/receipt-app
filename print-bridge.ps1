<#
.SYNOPSIS
    Receipt App - Local Print Bridge
    Enables instant ESC/POS native 1-click printing from Vercel web app to local USB thermal printer.
#>

param(
    [string]$DefaultPrinter = "BluePOS",
    [int]$Port = 9100
)

$csharpCode = @"
using System;
using System.IO;
using System.Runtime.InteropServices;

public class RawPrinterBridge {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public class DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }

    [DllImport("winspool.drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

    [DllImport("winspool.drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

    public static bool SendBytes(string szPrinterName, byte[] bytes) {
        if (bytes == null || bytes.Length == 0) return false;
        IntPtr hPrinter;
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "Thermal Receipt Native Print";
        di.pDataType = "RAW";
        if (OpenPrinter(szPrinterName.Normalize(), out hPrinter, IntPtr.Zero)) {
            if (StartDocPrinter(hPrinter, 1, di)) {
                if (StartPagePrinter(hPrinter)) {
                    IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(bytes.Length);
                    Marshal.Copy(bytes, 0, pUnmanagedBytes, bytes.Length);
                    int dwWritten;
                    bool success = WritePrinter(hPrinter, pUnmanagedBytes, bytes.Length, out dwWritten);
                    Marshal.FreeCoTaskMem(pUnmanagedBytes);
                    EndPagePrinter(hPrinter);
                    EndDocPrinter(hPrinter);
                    ClosePrinter(hPrinter);
                    return success;
                }
                EndDocPrinter(hPrinter);
            }
            ClosePrinter(hPrinter);
        }
        return false;
    }
}
"@

if (-not ([System.Management.Automation.PSTypeName]'RawPrinterBridge').Type) {
    Add-Type -TypeDefinition $csharpCode -Language CSharp
}

function Resolve-TargetPrinter([string]$preferred) {
    $allPrinters = @(Get-Printer -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
    if ($preferred -and ($allPrinters -contains $preferred)) {
        return $preferred
    }
    if ($allPrinters -contains "BluePOS") {
        return "BluePOS"
    }
    # Look for any printer with 'POS' or 'P58' or 'Receipt' or 'Thermal' in name
    $posMatch = $allPrinters | Where-Object { $_ -match "POS|P58|Receipt|Thermal|58|80" } | Select-Object -First 1
    if ($posMatch) {
        return $posMatch
    }
    # Windows default printer
    $def = (Get-CimInstance Win32_Printer -Filter "Default = True" -ErrorAction SilentlyContinue).Name
    if ($def) {
        return $def
    }
    if ($allPrinters.Count -gt 0) {
        return $allPrinters[0]
    }
    return $DefaultPrinter
}

$activePrinter = Resolve-TargetPrinter $DefaultPrinter

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       RECEIPT APP - LOCAL PRINT BRIDGE (Port $Port)       " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Active Printer : $activePrinter" -ForegroundColor Green
Write-Host " Listening on   : http://localhost:$Port/ and http://127.0.0.1:$Port/" -ForegroundColor White
Write-Host " Ready to receive print jobs from Vercel web app!" -ForegroundColor White
Write-Host " Keep this window open while using the cashier system." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
    $listener.Start()
} catch {
    Write-Host "ERROR: Could not bind to port $Port. It might already be in use!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

function Send-CorsHeaders($response) {
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, *")
    $response.Headers.Add("Access-Control-Allow-Private-Network", "true")
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        Send-CorsHeaders $response

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        $urlPath = $request.Url.AbsolutePath.TrimEnd('/')

        if ($urlPath -eq "" -or $urlPath -eq "/status") {
            $response.ContentType = "application/json"
            $installedPrinters = @(Get-Printer -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
            $statusObj = @{
                status = "ok"
                activePrinter = $activePrinter
                installedPrinters = $installedPrinters
                version = "1.0.0"
            }
            $json = ConvertTo-Json $statusObj
            $buf = [System.Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentLength64 = $buf.Length
            $response.OutputStream.Write($buf, 0, $buf.Length)
            $response.Close()
            continue
        }

        if ($urlPath -eq "/print" -and $request.HttpMethod -eq "POST") {
            $reader = [System.IO.StreamReader]::new($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Close()

            $jobPrinter = $activePrinter
            $success = $false
            $bytesCount = 0

            try {
                $payload = ConvertFrom-Json $body
                if ($payload.printerName) {
                    $jobPrinter = Resolve-TargetPrinter $payload.printerName
                }

                if ($payload.base64) {
                    $rawBytes = [System.Convert]::FromBase64String($payload.base64)
                    $bytesCount = $rawBytes.Length
                    $success = [RawPrinterBridge]::SendBytes($jobPrinter, $rawBytes)
                }
            } catch {
                Write-Host "[-] Failed to process print payload: $($_.Exception.Message)" -ForegroundColor Red
            }

            $timeStr = (Get-Date).ToString("HH:mm:ss")
            if ($success) {
                Write-Host "[$timeStr] Print Job Sent -> $jobPrinter ($bytesCount bytes) [OK]" -ForegroundColor Green
            } else {
                Write-Host "[$timeStr] Print Job Failed -> $jobPrinter" -ForegroundColor Red
            }

            $response.ContentType = "application/json"
            $resObj = @{
                success = $success
                printer = $jobPrinter
                bytes = $bytesCount
            }
            $json = ConvertTo-Json $resObj
            $buf = [System.Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentLength64 = $buf.Length
            $response.OutputStream.Write($buf, 0, $buf.Length)
            $response.Close()
            continue
        }

        # 404 for other paths
        $response.StatusCode = 404
        $response.Close()
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
}
