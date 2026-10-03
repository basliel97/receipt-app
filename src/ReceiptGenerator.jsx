import React, { useState } from 'react';
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
    fsNo: '00000023',
    date: '19/08/2026',
    time: '11:16:10',
    buyerTin: '0091392494',
    buyerName: 'SMT CONSTRUCTION',
    buyerPhone: '',
    buyerSuffix: 'PLC',
    taxRate: 15.0,
    cashBirr: 400000.00,
    mfeNumber: 'MFE0066951',
  });

  const [items, setItems] = useState([
    { id: 1, name: 'payment one', price: 347826.09 }
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    setItems([...items, { id: Date.now(), name: newItemName.toLowerCase(), price: parseFloat(newItemPrice) }]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
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
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Line Items (Payment/Goods)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1.5">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Item Name</label>
              <input type="text" placeholder="e.g. payment one" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Price (ETB)</label>
              <input type="number" placeholder="0.00" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="flex items-end">
              <button onClick={handleAddItem} className="w-full bg-blue-600 text-white font-bold p-2.5 rounded-lg text-sm hover:bg-blue-700 transition shadow-sm">+ Add Item</button>
            </div>
          </div>
          
          <ul className="space-y-2 mt-3 max-h-44 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-lg text-sm shadow-xs">
                <span className="font-medium text-slate-800 uppercase">{item.name} — <strong className="text-blue-600">*{formatCurrency(item.price)}</strong></span>
                <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 font-bold hover:text-red-700 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition">Remove</button>
              </li>
            ))}
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cash Paid (ETB)</label>
              <input type="number" name="cashBirr" value={formData.cashBirr} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">MFE Number</label>
              <input type="text" name="mfeNumber" value={formData.mfeNumber} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <button onClick={handlePrint} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-extrabold hover:bg-emerald-700 transition shadow-lg text-base tracking-wide flex items-center justify-center gap-2">
          🖨️ Print POS Receipt (50mm)
        </button>
      </div>


      {/* RECEIPT PREVIEW */}
      <div className="w-full lg:w-1/2 flex justify-center items-start sticky top-6">
        <div className="pos-receipt receipt-body">
          
          {/* Top Trademark */}
          <div className="text-left pl-5 mb-2 pt-0.5">
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

          <div className="mt-2">
            <div className="receipt-row nowrap">FS No. {formData.fsNo}</div>
            <div className="flex-row">
              <span className="nowrap">{formData.date}</span>
              <span className="nowrap">{formData.time}</span>
            </div>
          </div>

          <div className="space-y-0.5 mt-2">
            <div className="receipt-row nowrap">Buyer's TIN: {formData.buyerTin}</div>
            <div className="receipt-row nowrap">Buyer's name: {formData.buyerName}</div>
            {formData.buyerSuffix && <div className="receipt-row nowrap">{formData.buyerSuffix}</div>}
            <div className="receipt-row nowrap">Buyer's phone:</div>
            <div className="receipt-row nowrap">{formData.buyerPhone || '.....................'}</div>
          </div>

          <div className="mt-2 space-y-0.5">
            {items.map((item) => (
              <div key={item.id} className="flex-row my-0.5">
                <span>{item.name}</span>
                <span className="nowrap">*{formatCurrency(item.price)}</span>
              </div>
            ))}
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

          <div className="mt-1">
            <div className="total-label">TOTAL :</div>
            <div className="total-amount-row">*{formatCurrency(totalAmount)}</div>
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
          <div className="text-center mt-2.5">
            <div className="receipt-row">ERCA</div>
            <div className="flex justify-center items-center mt-1">
              <svg
                className="eltrade-emblem-svg"
                width="24"
                height="13"
                viewBox="0 0 34 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
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

          <div className="text-center mt-2">
            <div className="receipt-row">THANK YOU COME AGAIN!</div>
          </div>

        </div>
      </div>

    </div>

  );
}