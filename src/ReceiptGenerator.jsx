import React, { useState } from 'react';
import './Receipt.css';

export default function ReceiptGenerator() {
  const [formData, setFormData] = useState({
    tin: '0056846618',
    sellerName: 'TADESSE HUMNESA ITAHA',
    companyName: 'SIDA CONSTRUCTION & ENGINEERING',
    location: 'DANDI S/C GINCHI K.01 HN.NEW',
    landmark: 'AROUND ABBA GADA',
    eMobile: '0983461460',
    tel: '0910629988',
    fsNo: '00000023',
    date: '19/08/2026',
    time: '11:16:10',
    buyerTin: '0091392494',
    buyerName: 'SMT CONSTRUCTION',
    buyerPhone: '',
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
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
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
                <span className="font-medium text-slate-800 uppercase">{item.name} — <strong className="text-blue-600">*{item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
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
          🖨️ Print POS Receipt (80mm)
        </button>
      </div>


      {/* RECEIPT PREVIEW */}
      <div className="w-full lg:w-1/2 flex justify-center items-start sticky top-6">
        <div className="pos-receipt receipt-body">
          
          {/* Top Trademark */}
          <div className="text-center mb-3 pt-1">
            <div className="eltrade-container">
              <span className="eltrade-brand">ELTRADE</span>
              <span className="eltrade-tm">®</span>
            </div>
          </div>

          <div className="text-center space-y-0.5">
            <div className="receipt-row">TIN:{formData.tin}</div>
            <div className="receipt-row">{formData.sellerName}</div>
            <div className="receipt-row">{formData.companyName}</div>
            <div className="receipt-row">{formData.location}</div>
            <div className="receipt-row">{formData.landmark}</div>
            <div className="receipt-row">E-MOBILE:-{formData.eMobile}</div>
            <div className="receipt-row">TEL:-{formData.tel}</div>
          </div>

          <div className="flex-row mt-3">
            <span>FS No. {formData.fsNo}</span>
            <span>{formData.time}</span>
          </div>
          <div className="receipt-row">
            <span>{formData.date}</span>
          </div>

          <div className="space-y-0.5 mt-3">
            <div className="receipt-row">Buyer's TIN: {formData.buyerTin}</div>
            <div className="receipt-row">Buyer's name: {formData.buyerName} PLC</div>
            <div className="receipt-row">Buyer's phone: {formData.buyerPhone || '........................'}</div>
          </div>

          <div className="mt-2 space-y-0.5">
            {items.map((item) => (
              <div key={item.id} className="flex-row my-0.5">
                <span className="uppercase">{item.name}</span>
                <span>*{item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>

          <div className="receipt-divider"></div>

          <div className="flex-row">
            <span>TAXBL1</span>
            <span>*{taxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex-row">
            <span>TAX1 {Number(formData.taxRate).toFixed(2)}%</span>
            <span>*{taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="receipt-divider"></div>

          <div className="flex-row total-block my-1.5">
            <span>TOTAL:</span>
            <span className="align-right">*{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex-row">
            <span>CASH BIRR</span>
            <span>*{Number(formData.cashBirr).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex-row">
            <span>ITEM#</span>
            <span>{items.length}</span>
          </div>

          {/* Bottom Trademark */}
          <div className="text-center mt-4">
            <div className="receipt-row">ERCA</div>
            <div className="flex justify-center items-center mt-1">
              <div className="eltrade-emblem"></div>
              <span className="text-[21px]">{formData.mfeNumber}</span>
            </div>
          </div>

          <div className="text-center mt-3">
            <div className="receipt-row">THANK YOU COME AGAIN!</div>
          </div>

        </div>
      </div>

    </div>
  );
}