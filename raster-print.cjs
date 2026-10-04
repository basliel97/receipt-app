const { chromium } = require('./node_modules/playwright');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

async function printReceipt() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Take screenshot of the exact .pos-receipt element
  const receiptEl = await page.$('.pos-receipt');
  if (!receiptEl) {
    throw new Error('.pos-receipt element not found on page');
  }
  const pngBuffer = await receiptEl.screenshot({ scale: 'css' });
  await browser.close();

  // Load png and convert to 384px 1-bit monochrome raster for ESC/POS GS v 0
  const browser2 = await chromium.launch({ channel: 'msedge' });
  const page2 = await browser2.newPage();
  
  await page2.setContent('<html><body><canvas id="c"></canvas></body></html>');

  const imgBase64 = pngBuffer.toString('base64');
  const rasterData = await page2.evaluate(async (b64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const TARGET_WIDTH = 384; // 58mm printer printable width (384 dots)
        const scale = TARGET_WIDTH / img.width;
        const TARGET_HEIGHT = Math.round(img.height * scale);

        const canvas = document.getElementById('c');
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        const imgData = ctx.getImageData(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        const pixels = imgData.data;

        // Build 1-bit monochrome bitmap bytes (48 bytes per row)
        const bytesPerRow = TARGET_WIDTH / 8; // 48
        const totalBytes = bytesPerRow * TARGET_HEIGHT;
        const bitmap = new Uint8Array(totalBytes);

        for (let y = 0; y < TARGET_HEIGHT; y++) {
          for (let x = 0; x < TARGET_WIDTH; x++) {
            const idx = (y * TARGET_WIDTH + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            // Luminance threshold
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            const isBlack = lum < 185;

            if (isBlack) {
              const byteIdx = y * bytesPerRow + Math.floor(x / 8);
              const bitIdx = 7 - (x % 8);
              bitmap[byteIdx] |= (1 << bitIdx);
            }
          }
        }

        resolve({
          width: TARGET_WIDTH,
          height: TARGET_HEIGHT,
          bytesPerRow,
          bitmap: Array.from(bitmap)
        });
      };
      img.src = 'data:image/png;base64,' + b64;
    });
  }, imgBase64);

  await browser2.close();

  // Build ESC/POS GS v 0 command
  const xL = rasterData.bytesPerRow % 256;
  const xH = Math.floor(rasterData.bytesPerRow / 256);
  const yL = rasterData.height % 256;
  const yH = Math.floor(rasterData.height / 256);

  const header = [
    0x1B, 0x40,                               // ESC @ (Init)
    0x1B, 0x61, 0x01,                         // ESC a 1 (Center)
    0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH   // GS v 0 m xL xH yL yH
  ];

  const footer = [
    0x1B, 0x64, 0x05,                         // ESC d 5 (Feed 5 lines)
    0x1D, 0x56, 0x41, 0x00                    // GS V A 0 (Cut if cutter present)
  ];

  const fullBytes = Buffer.concat([
    Buffer.from(header),
    Buffer.from(rasterData.bitmap),
    Buffer.from(footer)
  ]);

  const binPath = path.join(process.cwd(), 'scratch', 'receipt_raster.bin');
  fs.writeFileSync(binPath, fullBytes);

  // Send binary to BluePOS via PowerShell RawPrinterHelper
  const psScript = `
$code = @"
using System;
using System.IO;
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
    public static bool SendFileToPrinter(string szPrinterName, string fileName) {
        byte[] bytes = File.ReadAllBytes(fileName);
        IntPtr hPrinter;
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "Thermal Graphic Print";
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
$ok = [RawPrinterHelper]::SendFileToPrinter("BluePOS", "${binPath.replace(/\\/g, '\\\\')}")
Write-Output "Printed Graphic: $ok"
`;

  const psPath = path.join(process.cwd(), 'scratch', 'send_raster.ps1');
  fs.writeFileSync(psPath, psScript);

  const res = spawnSync('powershell', ['-ExecutionPolicy', 'Bypass', '-File', psPath], { encoding: 'utf8' });
  console.log(res.stdout);
  return res.stdout.includes('Printed Graphic: True');
}

if (require.main === module) {
  printReceipt()
    .then((ok) => {
      console.log('Done, result:', ok);
      process.exit(ok ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { printReceipt };
