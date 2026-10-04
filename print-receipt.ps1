param(
    [string]$JsonData,
    [string]$JsonFile
)

$code = @"
using System;
using System.Runtime.InteropServices;

public class RawPrinterHelper {
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

    public static bool SendBytesToPrinter(string szPrinterName, byte[] bytes) {
        IntPtr hPrinter;
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "Thermal Receipt Print";
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

if (-not ([System.Management.Automation.PSTypeName]'RawPrinterHelper').Type) {
    Add-Type -TypeDefinition $code -Language CSharp
}

if ($JsonFile -and (Test-Path $JsonFile)) {
    $JsonData = Get-Content -Raw -Encoding UTF8 -Path $JsonFile
} elseif (-not $JsonData) {
    $JsonData = [Console]::In.ReadToEnd()
}

$data = $JsonData | ConvertFrom-Json
$formData = $data.formData
$items = $data.items

function Pad-Row([string]$left, [string]$right, [int]$width = 32) {
    $spaces = $width - $left.Length - $right.Length
    if ($spaces -lt 1) { $spaces = 1 }
    return $left + (" " * $spaces) + $right + "`r`n"
}

function Format-Price([double]$num) {
    return "{0:N2}" -f $num
}

$ESC = [char]0x1B
$GS  = [char]0x1D

$init = "$ESC@"
$center = "$ESC`a`x01"
$left = "$ESC`a`x00"
$right = "$ESC`a`x02"
$boldOn = "$ESC`E`x01"
$boldOff = "$ESC`E`x00"
$doubleSize = "$GS!`x11"
$normalSize = "$GS!`x00"
$feed = "$ESC`d`x04"

$receipt = ""
$receipt += $init
$receipt += $center + $boldOn + $doubleSize + "ELTRADE (R)`r`n" + $normalSize + $boldOff

if ($formData.tin) { $receipt += $center + "TIN:$($formData.tin)`r`n" }
if ($formData.sellerName) { $receipt += $center + "$($formData.sellerName)`r`n" }
if ($formData.companyName) { $receipt += $center + "$($formData.companyName)`r`n" }
if ($formData.location) {
    $locLines = $formData.location -split "`n"
    foreach ($line in $locLines) {
        $receipt += $center + "$line`r`n"
    }
}
if ($formData.landmark) { $receipt += $center + "$($formData.landmark)`r`n" }
if ($formData.eMobile) { $receipt += $center + "E-MOBILE:-$($formData.eMobile)`r`n" }
if ($formData.tel) { $receipt += $center + "TEL:-$($formData.tel)`r`n`r`n" }

if ($formData.fsNo) { $receipt += $left + "FS No. $($formData.fsNo)`r`n" }
$dateStr = "$($formData.date)"
$timeStr = "$($formData.time)"
$receipt += $left + (Pad-Row $dateStr $timeStr 32) + "`r`n"

if ($formData.buyerTin) { $receipt += $left + "Buyer's TIN: $($formData.buyerTin)`r`n" }
if ($formData.buyerName) { $receipt += $left + "Buyer's name: $($formData.buyerName)`r`n" }
if ($formData.buyerSuffix) { $receipt += $left + "$($formData.buyerSuffix)`r`n" }
$receipt += $left + "Buyer's phone:`r`n"
$buyerPhone = if ($formData.buyerPhone) { $formData.buyerPhone } else { "....................." }
$receipt += $left + "$buyerPhone`r`n`r`n"

$taxable = 0
foreach ($item in $items) {
    $priceVal = [double]$item.price
    $taxable += $priceVal
    $priceStr = "*" + (Format-Price $priceVal)
    $receipt += $left + (Pad-Row $item.name $priceStr 32)
}

$receipt += $left + "--------------------------------`r`n"
$taxRate = [double]$formData.taxRate
$taxAmount = ($taxable * $taxRate) / 100.0
$totalAmount = $taxable + $taxAmount

$taxableStr = "*" + (Format-Price $taxable)
$receipt += $left + (Pad-Row "TAXBL1" $taxableStr 32)

$taxRateStr = "TAX1 {0:N2}%" -f $taxRate
$taxAmtStr = "*" + (Format-Price $taxAmount)
$receipt += $left + (Pad-Row $taxRateStr $taxAmtStr 32)
$receipt += $left + "--------------------------------`r`n"

$receipt += $left + $boldOn + "TOTAL:`r`n" + $boldOff
$totalStr = "*" + (Format-Price $totalAmount)
$receipt += $right + $boldOn + $doubleSize + "$totalStr`r`n" + $normalSize + $boldOff

$cashStr = "*" + (Format-Price ([double]$formData.cashBirr))
$receipt += $left + (Pad-Row "CASH BIRR" $cashStr 32)
$itemCountStr = "$($items.Count)"
$receipt += $left + (Pad-Row "ITEM#" $itemCountStr 32) + "`r`n"

$receipt += $center + "ERCA`r`n"
$receipt += $center + $boldOn + "[ET] $($formData.mfeNumber)`r`n" + $boldOff
$receipt += $center + "THANK YOU COME AGAIN!`r`n"
$receipt += $feed

$bytes = [System.Text.Encoding]::GetEncoding("IBM437").GetBytes($receipt)
$ok = [RawPrinterHelper]::SendBytesToPrinter("BluePOS", $bytes)

@{ success = $ok } | ConvertTo-Json
