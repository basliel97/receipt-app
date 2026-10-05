import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import './Receipt.css';

export default function ReceiptGenerator() {
  const [formData, setFormData] = useState({
    tin: '0056846618',
    sellerName: 'TADESSE HUMNESA ITAHA',
    companyName: 'SIDA CONSTRUCTION & ENGINEERING',
    location: "DANDI\nS/C GINCHI K.01 HN.NEW",
    landmark: 'AROUND ABBA GADA',
    eMobile: '0983461460',
    tel: '0910629988',
    fsNo: '00000021',
    date: '29/07/2026',
    time: '10:57:49',
    buyerTin: '0003380590',
    buyerName: 'ANMOL PRODUCTS',
    buyerPhone: '',
    buyerSuffix: 'ETHIOPIA PLC',
    taxRate: 15.0,
    cashBirr: 276000.00,
    mfeNumber: 'MFE0066951',
  });

  const [items, setItems] = useState([
    { id: 1, name: 'GRAVEL', quantity: 16, unitPrice: 4375.00, price: 70000.00 },
    { id: 2, name: 'SAND', quantity: 16, unitPrice: 10625.00, price: 170000.00 }
  ]);

  const [itemMode, setItemMode] = useState('qty'); // 'qty' or 'flat'
  const [editingItemId, setEditingItemId] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnitPrice, setNewItemUnitPrice] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQtyChange = (val) => {
    setNewItemQty(val);
    if (val && newItemUnitPrice) {
      const q = parseFloat(val);
      const u = parseFloat(newItemUnitPrice);
      if (!isNaN(q) && !isNaN(u)) {
        setNewItemPrice((q * u).toFixed(2));
      }
    }
  };

  const handleUnitPriceChange = (val) => {
    setNewItemUnitPrice(val);
    if (newItemQty && val) {
      const q = parseFloat(newItemQty);
      const u = parseFloat(val);
      if (!isNaN(q) && !isNaN(u)) {
        setNewItemPrice((q * u).toFixed(2));
      }
    }
  };

  const handleTotalPriceChange = (val) => {
    setNewItemPrice(val);
    if (itemMode === 'qty' && newItemQty && parseFloat(newItemQty) > 0 && val) {
      const q = parseFloat(newItemQty);
      const t = parseFloat(val);
      if (!isNaN(q) && !isNaN(t) && q > 0) {
        setNewItemUnitPrice((t / q).toFixed(2));
      }
    }
  };

  const handleSaveItem = (e) => {
    e?.preventDefault();
    if (!newItemName.trim()) return;

    const priceVal = parseFloat(newItemPrice);
    if (isNaN(priceVal) || priceVal <= 0) return;

    const isQty = itemMode === 'qty' && newItemQty && parseFloat(newItemQty) > 0;
    const qtyVal = isQty ? parseFloat(newItemQty) : null;
    const unitPriceVal = isQty ? (parseFloat(newItemUnitPrice) || (priceVal / qtyVal)) : null;

    if (editingItemId) {
      setItems(items.map((item) => {
        if (item.id === editingItemId) {
          return {
            ...item,
            name: newItemName.trim(),
            quantity: qtyVal,
            unitPrice: unitPriceVal,
            price: priceVal
          };
        }
        return item;
      }));
      setEditingItemId(null);
    } else {
      setItems([
        ...items,
        {
          id: Date.now(),
          name: newItemName.trim(),
          quantity: qtyVal,
          unitPrice: unitPriceVal,
          price: priceVal
        }
      ]);
    }

    setNewItemName('');
    setNewItemQty('');
    setNewItemUnitPrice('');
    setNewItemPrice('');
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setNewItemName(item.name);
    if (item.quantity && Number(item.quantity) > 0) {
      setItemMode('qty');
      setNewItemQty(String(item.quantity));
      setNewItemUnitPrice(item.unitPrice ? String(item.unitPrice) : '');
    } else {
      setItemMode('flat');
      setNewItemQty('');
      setNewItemUnitPrice('');
    }
    setNewItemPrice(String(item.price));
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNewItemName('');
    setNewItemQty('');
    setNewItemUnitPrice('');
    setNewItemPrice('');
  };

  const handleRemoveItem = (id) => {
    if (editingItemId === id) handleCancelEdit();
    setItems(items.filter((item) => item.id !== id));
  };

  const [isDirectPrinting, setIsDirectPrinting] = useState(false);
  const [directPrintStatus, setDirectPrintStatus] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleNativePrint = async () => {
    setIsDirectPrinting(true);
    setDirectPrintStatus('');
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // Helper: convert any canvas to 1-bit monochrome ESC/POS GS v 0 raster bytes
      const canvasToEscPosRaster = (canvas) => {
        const targetWidth = canvas.width;
        const targetHeight = canvas.height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const pixels = imgData.data;

        const bytesPerRow = targetWidth / 8; // 48
        const totalBytes = bytesPerRow * targetHeight;
        const bitmap = new Uint8Array(totalBytes);

        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum < 140) {
              const byteIdx = y * bytesPerRow + Math.floor(x / 8);
              const bitIdx = 7 - (x % 8);
              bitmap[byteIdx] |= (1 << bitIdx);
            }
          }
        }

        const xL = bytesPerRow % 256;
        const xH = Math.floor(bytesPerRow / 256);
        const yL = targetHeight % 256;
        const yH = Math.floor(targetHeight / 256);

        const header = [0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH];
        const res = new Uint8Array(header.length + bitmap.length);
        res.set(header, 0);
        res.set(bitmap, header.length);
        return res;
      };

      // 1. ELTRADE Logo Generator:
      // Completely visible, 49px font, left-aligned with 22 dots padding, trademark not bold, compact vertical height (68 dots)
      const createTopLogoChunk = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 384;
        canvas.height = 68;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padLeft = 22;
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold italic 49px "Oswald", "Impact", "Arial Black", sans-serif';
        ctx.fillText('ELTRADE', padLeft, 34);

        const brandWidth = ctx.measureText('ELTRADE').width;
        ctx.font = 'normal 16px "Oswald", "Arial", sans-serif';
        ctx.fillText('®', padLeft + brandWidth + 9, 14);

        return canvasToEscPosRaster(canvas);
      };

      // 2. TOTAL Block Generator:
      // Compact height (24px font, light weight 300), leftPad = 0 (flush left alignment).
      // If < 6 digits before decimal point: single line with TOTAL : on left and *... on right.
      // If >= 6 digits: 2 lines (Line 1: TOTAL :, Line 2: *... with star under colon).
      const createTotalChunk = (totalStr, isTwoLine) => {
        const canvas = document.createElement('canvas');
        canvas.width = 384;
        canvas.height = isTwoLine ? 48 : 28;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'middle';

        const starFont = '600 24px "Roboto Mono", "Consolas", monospace';
        const numFont = '300 24px "Oswald", "Arial", sans-serif';

        const label = 'TOTAL :';
        const leftPad = 0; // Flush left alignment
        const rightMargin = 4;
        const targetRightX = 384 - rightMargin; // 380
        const scaleLabelX = 2.05;

        if (isTwoLine) {
          // Line 1: Measure colon position
          ctx.font = numFont;
          const beforeColonW = ctx.measureText('TOTAL ').width;
          const colonW = ctx.measureText(':').width;
          const colonCenterX = leftPad + ((beforeColonW + colonW / 2) * scaleLabelX);

          // Line 2: Star (same star as CASH BIRR) + digits
          ctx.font = starFont;
          const starW = ctx.measureText('*').width;

          ctx.font = numFont;
          const numW = ctx.measureText(totalStr).width;

          const availSpan = targetRightX - colonCenterX;
          let scaleValueX = availSpan / (numW + starW / 2);
          scaleValueX = Math.min(2.40, Math.max(1.1, scaleValueX));

          const starCanvasX = colonCenterX - ((starW * scaleValueX) / 2);
          const numCanvasX = starCanvasX + (starW * scaleValueX);

          // Draw Line 1 (TOTAL :)
          const centerY1 = 12;
          ctx.save();
          ctx.translate(leftPad, centerY1);
          ctx.scale(scaleLabelX, 1.0);
          ctx.font = numFont;
          ctx.fillText(label, 0, 0);
          ctx.restore();

          // Draw Line 2: Star (CASH BIRR font)
          const centerY2 = 36;
          ctx.save();
          ctx.translate(starCanvasX, centerY2);
          ctx.scale(scaleValueX, 1.0);
          ctx.font = starFont;
          ctx.fillText('*', 0, 0);
          ctx.restore();

          // Draw Line 2: Digits (Oswald font)
          ctx.save();
          ctx.translate(numCanvasX, centerY2);
          ctx.scale(scaleValueX, 1.0);
          ctx.font = numFont;
          ctx.fillText(totalStr, 0, 0);
          ctx.restore();
        } else {
          // Single Line layout:
          // Left: TOTAL :
          const centerY = 14;
          ctx.save();
          ctx.translate(leftPad, centerY);
          ctx.scale(scaleLabelX, 1.0);
          ctx.font = numFont;
          ctx.fillText(label, 0, 0);
          ctx.restore();

          // Right: Star (same star as CASH BIRR) + digits
          ctx.font = starFont;
          const starW = ctx.measureText('*').width;

          ctx.font = numFont;
          const numW = ctx.measureText(totalStr).width;

          const scaleValueX = 1.95;
          const totalValW = (starW + numW) * scaleValueX;
          const starCanvasX = targetRightX - totalValW;
          const numCanvasX = starCanvasX + (starW * scaleValueX);

          // Draw Star (CASH BIRR font)
          ctx.save();
          ctx.translate(starCanvasX, centerY);
          ctx.scale(scaleValueX, 1.0);
          ctx.font = starFont;
          ctx.fillText('*', 0, 0);
          ctx.restore();

          // Draw Digits (Oswald font)
          ctx.save();
          ctx.translate(numCanvasX, centerY);
          ctx.scale(scaleValueX, 1.0);
          ctx.font = numFont;
          ctx.fillText(totalStr, 0, 0);
          ctx.restore();
        }

        return canvasToEscPosRaster(canvas);
      };

      // 3. Bottom ET Emblem + MFE Number Generator:
      // Compact height (36 dots), aligned on exact center line, light weight (no boldness: 300), thin stroke, longer width (1.75x)
      const createBottomEmblemChunk = (mfeNumber) => {
        const canvas = document.createElement('canvas');
        canvas.width = 384;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Vector ET emblem dimensions (scaled to 24 dots font height)
        const scale = 1.50;
        const emblemW = 34 * scale; // 51 dots
        const emblemH = 16 * scale; // 24 dots
        const gap = 12;

        // Clean unslashed oval zeros, light weight (300), 24px, longer width (1.75x)
        ctx.font = '300 24px "Oswald", "Arial", sans-serif';
        const mfeStr = mfeNumber || 'MFE0066951';
        const mfeW = ctx.measureText(mfeStr).width;
        const scaleX = 1.75;

        const totalW = emblemW + gap + (mfeW * scaleX);
        const startX = Math.round((384 - totalW) / 2);
        const centerY = 18;

        // Draw ET monogram vector lines (thinner stroke, italic slant)
        ctx.save();
        ctx.translate(startX, centerY - (emblemH / 2));
        ctx.scale(scale, scale);
        ctx.transform(1, 0, -0.20, 1, 0, 0); // Italic slant
        ctx.lineWidth = 1.0; // Thin stroke (not bold)
        ctx.lineCap = 'square';
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(11, 2); ctx.lineTo(31, 2);
        ctx.moveTo(11, 2); ctx.lineTo(2, 14);
        ctx.moveTo(2, 14); ctx.lineTo(14, 14);
        ctx.moveTo(23, 2); ctx.lineTo(14, 14);
        ctx.moveTo(6.5, 8); ctx.lineTo(15, 8);
        ctx.stroke();
        ctx.restore();

        // Draw MFE number on the exact same horizontal center line, longer width (scaleX = 1.75)
        const mfeStartX = startX + emblemW + gap;
        ctx.save();
        ctx.translate(mfeStartX, centerY);
        ctx.scale(scaleX, 1.0);
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'middle';
        ctx.font = '300 24px "Oswald", "Arial", sans-serif';
        ctx.fillText(mfeStr, 0, 0);
        ctx.restore();

        return canvasToEscPosRaster(canvas);
      };

      const pad = (left, right, width = 32) => {
        const l = String(left || '');
        const r = String(right || '');
        const spaces = width - l.length - r.length;
        if (spaces <= 0) return (l + ' ' + r).slice(0, width);
        return l + ' '.repeat(spaces) + r;
      };

      const taxableAmount = items.reduce((acc, item) => acc + item.price, 0);
      const taxAmount = (taxableAmount * Number(formData.taxRate)) / 100;
      const totalAmount = taxableAmount + taxAmount;
      const totalFormatted = formatCurrency(totalAmount);
      const intDigits = Math.floor(Math.abs(Number(totalAmount) || 0)).toString().length;
      const isTwoLineTotal = intDigits >= 6;

      // Render graphics
      const topLogoBytes = createTopLogoChunk();
      const totalBytes = createTotalChunk(totalFormatted, isTwoLineTotal);
      const bottomEmblemBytes = createBottomEmblemChunk(formData.mfeNumber);

      const chunks = [];
      const pushBytes = (arr) => chunks.push(new Uint8Array(arr));

      const pushText = (str, align = 0, isBold = false) => {
        const header = [0x1B, 0x61, align]; // ESC a align (0: Left, 1: Center)
        let printMode = 0;
        if (isBold) printMode |= 0x08; // Bold
        header.push(0x1B, 0x21, printMode); // ESC ! n

        const strBytes = [];
        for (let i = 0; i < str.length; i++) {
          strBytes.push(str.charCodeAt(i));
        }
        strBytes.push(0x0A); // \n
        strBytes.push(0x1B, 0x21, 0x00); // Reset to standard Font A

        const combined = new Uint8Array(header.length + strBytes.length);
        combined.set(header, 0);
        combined.set(strBytes, header.length);
        chunks.push(combined);
      };

      // --- ASSEMBLE JOB ---
      // Init printer + CP437
      pushBytes([0x1B, 0x40, 0x1B, 0x74, 0x00]);

      // 1. Top Logo Graphic
      chunks.push(topLogoBytes);

      // 2. Seller Info (CENTERED)
      pushText(`TIN:${formData.tin}`, 1);
      pushText(formData.sellerName, 1);
      pushText(formData.companyName, 1);
      const locLines = (formData.location || '').split('\n').filter(Boolean);
      for (const loc of locLines) {
        pushText(loc, 1);
      }
      if (formData.landmark) {
        pushText(formData.landmark, 1);
      }
      pushText(`E-MOBILE:-${formData.eMobile}`, 1);
      pushText(`TEL:-${formData.tel}`, 1);

      // 3. Spacing (micro-feed between seller info and FS No)
      pushBytes([0x1B, 0x4A, 10]);

      // 4. FS No, Date & Time (LEFT)
      pushText(`FS No. ${formData.fsNo}`, 0);
      pushText(pad(formData.date, formData.time, 32), 0);

      // 5. Spacing (micro-feed between Date/Time and Buyer Info)
      pushBytes([0x1B, 0x4A, 8]);

      // 6. Buyer Info (LEFT)
      pushText(`Buyer's TIN: ${formData.buyerTin}`, 0);
      pushText(`Buyer's name: ${formData.buyerName}`, 0);
      if (formData.buyerSuffix) {
        pushText(formData.buyerSuffix, 0);
      }
      pushText("Buyer's phone:", 0);
      pushText(formData.buyerPhone || '.....................', 0);

      // 7. Items (immediately following buyer phone without extra blank line)
      for (const it of items) {
        const hasQty = it.quantity && Number(it.quantity) > 0 && it.unitPrice && Number(it.unitPrice) > 0;
        if (hasQty) {
          const qtyStr = Number(it.quantity) % 1 === 0 ? Number(it.quantity).toString() : Number(it.quantity).toFixed(2);
          const unitPriceStr = Number(it.unitPrice).toFixed(2);
          pushText(`   ${qtyStr} x ${unitPriceStr} =`, 0);
        }
        pushText(pad(it.name, `*${formatCurrency(it.price)}`, 32), 0);
      }

      // 9. Divider
      pushText('--------------------------------', 0);

      // 10. Tax
      pushText(pad('TAXBL1', `*${formatCurrency(taxableAmount)}`, 32), 0);
      pushText(pad(`TAX1 ${Number(formData.taxRate).toFixed(2)}%`, `*${formatCurrency(taxAmount)}`, 32), 0);

      // 11. Divider
      pushText('--------------------------------', 0);

      // 12. Total Graphic (Height smaller, width bigger, close together)
      chunks.push(totalBytes);

      // 13. Cash Paid & Item Count (NO extra blank line spacer!)
      pushText(pad('CASH BIRR', `*${formatCurrency(formData.cashBirr)}`, 32), 0);
      pushText(pad('ITEM#', String(items.length), 32), 0);

      // 14. Spacing (minimized gap between ITEM# and ERCA: 10 dots micro-feed)
      pushBytes([0x1B, 0x4A, 10]);

      // 15. ERCA (CENTERED)
      pushText('ERCA', 1);

      // 16. Bottom Emblem + MFE graphic (CENTERED & ALIGNED)
      chunks.push(bottomEmblemBytes);
      pushBytes([0x1B, 0x64, 0x01]); // Line feed after graphic to prevent overlap with footer!

      // 17. Footer (CENTERED)
      pushText('THANK YOU COME AGAIN!', 1);

      // 18. Minimal tail feed (1 line) + Cut
      pushBytes([0x1B, 0x64, 0x01, 0x1D, 0x56, 0x41, 0x00]);

      // Combine all chunks into one buffer
      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      const fullBuffer = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of chunks) {
        fullBuffer.set(c, offset);
        offset += c.length;
      }

      // Convert to base64
      let binaryString = '';
      const chunkSize = 8192;
      for (let i = 0; i < fullBuffer.length; i += chunkSize) {
        binaryString += String.fromCharCode.apply(null, fullBuffer.subarray(i, i + chunkSize));
      }
      const base64 = btoa(binaryString);

      const res = await fetch('/api/print-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64 })
      });

      const data = await res.json();
      if (data.success) {
        setDirectPrintStatus('success-native');
        setTimeout(() => setDirectPrintStatus(''), 4000);
      } else {
        setDirectPrintStatus('error');
      }
    } catch (err) {
      console.error('Native print error:', err);
      setDirectPrintStatus('error');
    } finally {
      setIsDirectPrinting(false);
    }
  };

  const handleDirectPrint = async () => {
    setIsDirectPrinting(true);
    setDirectPrintStatus('');
    try {
      const receiptEl = document.querySelector('.pos-receipt');
      if (!receiptEl) throw new Error('Receipt element not found');

      // 1. Render DOM element to canvas with high fidelity
      const canvas = await html2canvas(receiptEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      // 2. Scale exactly to 384 dots (standard printable width for 58mm thermal printhead)
      const TARGET_WIDTH = 384;
      const scale = TARGET_WIDTH / canvas.width;
      const TARGET_HEIGHT = Math.round(canvas.height * scale);

      const offscreen = document.createElement('canvas');
      offscreen.width = TARGET_WIDTH;
      offscreen.height = TARGET_HEIGHT;
      const ctx = offscreen.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      ctx.drawImage(canvas, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      const imgData = ctx.getImageData(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      const pixels = imgData.data;

      // 3. Build 1-bit monochrome bitmap bytes (48 bytes per row)
      const bytesPerRow = TARGET_WIDTH / 8; // 48
      const totalBytes = bytesPerRow * TARGET_HEIGHT;
      const bitmap = new Uint8Array(totalBytes);

      for (let y = 0; y < TARGET_HEIGHT; y++) {
        for (let x = 0; x < TARGET_WIDTH; x++) {
          const idx = (y * TARGET_WIDTH + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          // Standard luminance formula
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 185) {
            const byteIdx = y * bytesPerRow + Math.floor(x / 8);
            const bitIdx = 7 - (x % 8);
            bitmap[byteIdx] |= (1 << bitIdx);
          }
        }
      }

      // 4. Construct ESC/POS GS v 0 Command Structure
      const xL = bytesPerRow % 256;
      const xH = Math.floor(bytesPerRow / 256);
      const yL = TARGET_HEIGHT % 256;
      const yH = Math.floor(TARGET_HEIGHT / 256);

      const header = [
        0x1B, 0x40,                               // ESC @ (Init)
        0x1B, 0x61, 0x01,                         // ESC a 1 (Center)
        0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH   // GS v 0 0 xL xH yL yH
      ];

      const footer = [
        0x1B, 0x64, 0x01,                         // ESC d 1 (Feed 1 line)
        0x1D, 0x56, 0x41, 0x00                    // GS V A 0 (Cut if cutter present)
      ];

      const fullBuffer = new Uint8Array(header.length + bitmap.length + footer.length);
      fullBuffer.set(header, 0);
      fullBuffer.set(bitmap, header.length);
      fullBuffer.set(footer, header.length + bitmap.length);

      // Convert Uint8Array to base64
      let binaryString = '';
      const chunkSize = 8192;
      for (let i = 0; i < fullBuffer.length; i += chunkSize) {
        binaryString += String.fromCharCode.apply(null, fullBuffer.subarray(i, i + chunkSize));
      }
      const base64 = btoa(binaryString);

      const res = await fetch('/api/print-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64 })
      });

      const data = await res.json();
      if (data.success) {
        setDirectPrintStatus('success-raster');
        setTimeout(() => setDirectPrintStatus(''), 4000);
      } else {
        setDirectPrintStatus('error');
      }
    } catch (err) {
      console.error('Direct print error:', err);
      setDirectPrintStatus('error');
    } finally {
      setIsDirectPrinting(false);
    }
  };

  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const taxableAmount = items.reduce((acc, item) => acc + item.price, 0);
  const taxAmount = (taxableAmount * Number(formData.taxRate)) / 100;
  const totalAmount = taxableAmount + taxAmount;

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-8 bg-slate-100 min-h-screen">
      
      {/* FORM BUILDER PANEL (Hidden on Print) */}
      <div className="w-full lg:w-1/2 bg-white p-6 md:p-8 rounded-2xl shadow-xl overflow-y-auto max-h-[95vh] no-print border border-slate-200">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">POS Receipt Generator</h2>
          <p className="text-slate-500 text-sm mt-1">Configure your receipt fields and line items dynamically.</p>
        </div>
        
        {/* Seller Info */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Seller Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">TIN Number</label>
              <input type="text" name="tin" value={formData.tin} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">E-Mobile</label>
              <input type="text" name="eMobile" value={formData.eMobile} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Owner Name</label>
              <input type="text" name="sellerName" value={formData.sellerName} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location / Address</label>
              <textarea rows={2} name="location" value={formData.location} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Landmark</label>
              <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Telephone</label>
              <input type="text" name="tel" value={formData.tel} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Transaction Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">FS No.</label>
              <input type="text" name="fsNo" value={formData.fsNo} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
              <input type="text" name="date" value={formData.date} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
              <input type="text" name="time" value={formData.time} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Buyer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Buyer TIN</label>
              <input type="text" name="buyerTin" value={formData.buyerTin} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Buyer Phone</label>
              <input type="text" name="buyerPhone" value={formData.buyerPhone} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Buyer Name</label>
              <input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Name Suffix</label>
              <input type="text" name="buyerSuffix" value={formData.buyerSuffix} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Line Items Manager */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Line Items (Payment/Goods)</h3>
            <span className="text-[11px] text-slate-500 font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-200/80 p-1 rounded-lg gap-1">
            <button
              type="button"
              onClick={() => {
                setItemMode('qty');
                if (newItemQty && newItemUnitPrice) {
                  const q = parseFloat(newItemQty);
                  const u = parseFloat(newItemUnitPrice);
                  if (!isNaN(q) && !isNaN(u)) setNewItemPrice((q * u).toFixed(2));
                }
              }}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                itemMode === 'qty'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span>📦 Quantity × Unit Price</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(e.g. 16 x 4375.00)</span>
            </button>
            <button
              type="button"
              onClick={() => setItemMode('flat')}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                itemMode === 'flat'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span>⚡ Flat Price Only</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(Single line)</span>
            </button>
          </div>

          {/* Inputs Grid */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Item Name / Description</label>
              <input
                type="text"
                placeholder={itemMode === 'qty' ? 'e.g. GRAVEL or SAND' : 'e.g. payment one'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {itemMode === 'qty' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity (Qty)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 16"
                    value={newItemQty}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Price (ETB)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 4375.00"
                    value={newItemUnitPrice}
                    onChange={(e) => handleUnitPriceChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Total Amount (ETB)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={newItemPrice}
                    onChange={(e) => handleTotalPriceChange(e.target.value)}
                    className="w-full p-2 bg-blue-50/60 border border-blue-200 font-semibold text-blue-900 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Price / Amount (ETB)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveItem}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {editingItemId ? '✓ Update Item' : '+ Add Item to Receipt'}
              </button>
              {editingItemId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-lg text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* List of items */}
          <ul className="space-y-2 mt-2 max-h-52 overflow-y-auto pr-1">
            {items.map((item) => {
              const hasQty = item.quantity && Number(item.quantity) > 0 && item.unitPrice && Number(item.unitPrice) > 0;
              const isSelected = editingItemId === item.id;
              return (
                <li
                  key={item.id}
                  className={`flex justify-between items-center p-3 border rounded-xl text-sm transition ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-300'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    {hasQty ? (
                      <span className="text-xs text-slate-500 font-mono mt-0.5">
                        {item.quantity} × {Number(item.unitPrice).toFixed(2)} = <strong className="text-blue-600">*{formatCurrency(item.price)}</strong>
                      </span>
                    ) : (
                      <span className="text-xs text-blue-600 font-bold font-mono mt-0.5">
                        *{formatCurrency(item.price)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="text-xs text-blue-600 font-semibold px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-xs text-red-500 font-semibold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Tax & Totals Setup */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tax & Totals Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tax Rate (%)</label>
              <input type="number" name="taxRate" value={formData.taxRate} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-600">Cash Paid (ETB)</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cashBirr: totalAmount }))}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                >
                  = Match Total
                </button>
              </div>
              <input type="number" name="cashBirr" value={formData.cashBirr} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">MFE Number</label>
              <input type="text" name="mfeNumber" value={formData.mfeNumber} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleNativePrint}
            disabled={isDirectPrinting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-extrabold transition shadow-md text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isDirectPrinting ? '⏳ Printing to BluePOS...' : '⚡ 1-Click Native Print (Exact Printer Font)'}
          </button>

          <button
            onClick={handleDirectPrint}
            disabled={isDirectPrinting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition shadow-sm text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            🖼️ Graphic Raster Print (384-dot Bitmap)
          </button>

          {directPrintStatus === 'success-native' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg text-center animate-fade-in">
              ✅ Printed with BluePOS native hardware Font A (matches info slip)!
            </div>
          )}
          {directPrintStatus === 'success-raster' && (
            <div className="p-3 bg-blue-50 border border-blue-300 text-blue-800 text-xs font-bold rounded-lg text-center animate-fade-in">
              ✅ Receipt graphic raster successfully printed on BluePOS!
            </div>
          )}
          {directPrintStatus === 'error' && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-bold rounded-lg text-center animate-fade-in">
              ❌ Failed to send to BluePOS. Please check USB cable connection and power.
            </div>
          )}

          <button
            onClick={handlePrint}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 py-2 rounded-xl font-bold transition text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            🖨️ Browser Print Dialog (50mm / BluePOS)
          </button>
        </div>
      </div>


      {/* RECEIPT PREVIEW */}
      <div className="w-full lg:w-1/2 flex justify-center items-start sticky top-6">
        <div className="pos-receipt receipt-body">
          
          {/* Top Trademark */}
          <div id="receipt-top-logo" className="text-left pl-5 mb-2 pt-0.5 bg-white inline-block">
            <div className="eltrade-container">
              <span className="eltrade-brand">ELTRADE</span>
              <span className="eltrade-tm">®</span>
            </div>
          </div>

          <div className="text-center space-y-0.5">
            <div className="receipt-row nowrap">TIN:{formData.tin}</div>
            <div className="receipt-row nowrap">{formData.sellerName}</div>
            <div className="receipt-row nowrap">{formData.companyName}</div>
            <div className="receipt-row whitespace-pre-line">{formData.location}</div>
            <div className="receipt-row nowrap">{formData.landmark}</div>
            <div className="receipt-row nowrap">E-MOBILE:-{formData.eMobile}</div>
            <div className="receipt-row nowrap">TEL:-{formData.tel}</div>
          </div>

          <div className="mt-1">
            <div className="receipt-row nowrap">FS No. {formData.fsNo}</div>
            <div className="flex-row">
              <span className="nowrap">{formData.date}</span>
              <span className="nowrap">{formData.time}</span>
            </div>
          </div>

          <div className="space-y-0.5 mt-1">
            <div className="receipt-row nowrap">Buyer's TIN: {formData.buyerTin}</div>
            <div className="receipt-row nowrap">Buyer's name: {formData.buyerName}</div>
            {formData.buyerSuffix && <div className="receipt-row nowrap">{formData.buyerSuffix}</div>}
            <div className="receipt-row nowrap">Buyer's phone:</div>
            <div className="receipt-row nowrap">{formData.buyerPhone || '.....................'}</div>
          </div>

          <div className="mt-1 space-y-0.5">
            {items.map((item) => {
              const hasQty = item.quantity && Number(item.quantity) > 0 && item.unitPrice && Number(item.unitPrice) > 0;
              const qtyStr = Number(item.quantity) % 1 === 0 ? Number(item.quantity).toString() : Number(item.quantity).toFixed(2);
              const unitPriceStr = Number(item.unitPrice).toFixed(2);

              return (
                <div key={item.id} className="my-0.5">
                  {hasQty && (
                    <div className="receipt-row nowrap" style={{ paddingLeft: '14px' }}>
                      {qtyStr} x {unitPriceStr} =
                    </div>
                  )}
                  <div className="flex-row">
                    <span>{item.name}</span>
                    <span className="nowrap">*{formatCurrency(item.price)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="receipt-divider"></div>

          <div className="flex-row">
            <span className="nowrap">TAXBL1</span>
            <span className="nowrap">*{formatCurrency(taxableAmount)}</span>
          </div>
          <div className="flex-row">
            <span className="nowrap">TAX1 {Number(formData.taxRate).toFixed(2)}%</span>
            <span className="nowrap">*{formatCurrency(taxAmount)}</span>
          </div>

          <div className="receipt-divider"></div>

          <div className="my-1">
            {Math.floor(Math.abs(Number(totalAmount) || 0)).toString().length >= 6 ? (
              <>
                <div className="total-label">TOTAL :</div>
                <div className="total-amount-row">
                  <span className="cash-star">*</span>{formatCurrency(totalAmount)}
                </div>
              </>
            ) : (
              <div className="flex justify-between items-baseline">
                <span className="total-label-inline">TOTAL :</span>
                <span className="total-amount-inline">
                  <span className="cash-star">*</span>{formatCurrency(totalAmount)}
                </span>
              </div>
            )}
          </div>

          <div className="cash-block my-0.5">
            <span className="nowrap">CASH BIRR</span>
            <span className="nowrap">*{formatCurrency(formData.cashBirr)}</span>
          </div>
          <div className="flex-row">
            <span className="nowrap">ITEM#</span>
            <span className="nowrap">{items.length}</span>
          </div>

          {/* Bottom Trademark */}
          <div className="text-center mt-1">
            <div className="receipt-row">ERCA</div>
            <div className="flex justify-center mt-1">
              <div id="receipt-bottom-emblem" className="flex items-center justify-center bg-white px-2 py-0.5">
                <svg
                  className="eltrade-emblem-svg"
                  width="34"
                  height="16"
                  viewBox="0 0 34 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                >
                  <line x1="11" y1="2" x2="31" y2="2" />
                  <line x1="11" y1="2" x2="2" y2="14" />
                  <line x1="2" y1="14" x2="14" y2="14" />
                  <line x1="23" y1="2" x2="14" y2="14" />
                  <line x1="6.5" y1="8" x2="15" y2="8" />
                </svg>
                <span className="mfe-number">{formData.mfeNumber}</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-1">
            <div className="receipt-row">THANK YOU COME AGAIN!</div>
          </div>

        </div>
      </div>

    </div>

  );
}