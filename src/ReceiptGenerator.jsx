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
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-gray-100 min-h-screen">
      
      {/* FORM BUILDER PANEL (Hidden on Print) */}
      <div className="w-full lg:w-1/2 bg-white p-6 rounded-xl shadow-md overflow-y-auto max-h-[90vh] no-print">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">POS Receipt Generator</h2>
        
        {/* Seller Info */}
        <div className="mb-4 space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm uppercase">Seller Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="tin" placeholder="TIN" value={formData.tin} onChange={handleChange} className="p-2 border rounded text-sm" />
            <input type="text" name="eMobile" placeholder="E-Mobile" value={formData.eMobile} onChange={handleChange} className="p-2 border rounded text-sm" />
            <input type="text" name="sellerName" placeholder="Owner Name" value={formData.sellerName} onChange={handleChange} className="p-2 border rounded text-sm col-span-2" />
            <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} className="p-2 border rounded text-sm col-span-2" />
            <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="p-2 border rounded text-sm col-span-2" />
            <input type="text" name="landmark" placeholder="Landmark" value={formData.landmark} onChange={handleChange} className="p-2 border rounded text-sm" />
            <input type="text" name="tel" placeholder="TEL" value={formData.tel} onChange={handleChange} className="p-2 border rounded text-sm" />
          </div>
        </div>

        {/* Transaction Info */}
        <div className="mb-4 space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm uppercase">Transaction Info</h3>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" name="fsNo" placeholder="FS No" value={formData.fsNo} onChange={handleChange} className="p-2 border rounded text-sm" />
            <input type="text" name="date" placeholder="Date" value={formData.date} onChange={handleChange} className="p-2 border rounded text-sm" />
            <input type="text" name="time" placeholder="Time" value={formData.time} onChange={handleChange} className="p-2 border rounded text-sm" />
          </div>
        </div>

        {/* Buyer Info */}
        <div className="mb-4 space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm uppercase">Buyer Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="buyerTin" placeholder="Buyer TIN" value={formData.buyerTin} onChange={handleChange} className="p-2 border rounded text-sm" />
            <input type="text" name="buyerPhone" placeholder="Buyer Phone" value={formData.buyerPhone} onChange={handleChange} className="p-2 border rounded text-sm" />
            <input type="text" name="buyerName" placeholder="Buyer Name" value={formData.buyerName} onChange={handleChange} className="p-2 border rounded text-sm col-span-2" />
          </div>
        </div>

        {/* Line Items Manager */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-gray-700 text-sm uppercase mb-3">Line Items</h3>
          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="Item Name (e.g. payment one)" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="p-2 border rounded text-sm flex-2" />
            <input type="number" placeholder="Price (ETB)" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="p-2 border rounded text-sm flex-1" />
            <button onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700">Add</button>
          </div>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                <span>{item.name} - *{item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 font-bold hover:text-red-700 px-2">✕</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tax & Totals Setup */}
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm uppercase">Tax & Totals Setup</h3>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" name="taxRate" placeholder="Tax %" value={formData.taxRate} onChange={handleChange} className="p-2 border rounded text-sm" />
            <input type="number" name="cashBirr" placeholder="Cash Paid" value={formData.cashBirr} onChange={handleChange} className="p-2 border rounded text-sm" />
            <input type="text" name="mfeNumber" placeholder="MFE Number" value={formData.mfeNumber} onChange={handleChange} className="p-2 border rounded text-sm" />
          </div>
        </div>

        <button onClick={handlePrint} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
          🖨️ Print POS Receipt (58mm)
        </button>
      </div>


      {/* RECEIPT PREVIEW (Exact 58mm Thermal POS Roll Simulator) */}
      <div className="w-full lg:w-1/2 flex justify-center items-start">
        <div className="pos-receipt">
          
          {/* Top Trademark */}
          <div className="text-center mb-2">
            <h1 className="text-[20px] font-black tracking-tighter">ELTRADE ®</h1>
          </div>

          <div className="text-center space-y-0.5">
            <p>TIN:{formData.tin}</p>
            <p className="font-bold">{formData.sellerName}</p>
            <p className="font-bold">{formData.companyName}</p>
            <p>{formData.location}</p>
            <p>{formData.landmark}</p>
            <p>E-MOBILE:-{formData.eMobile}</p>
            <p>TEL:-{formData.tel}</p>
          </div>

          <div className="flex justify-between mt-2">
            <span>FS No. {formData.fsNo}</span>
            <span>{formData.time}</span>
          </div>
          <div>
            <span>{formData.date}</span>
          </div>

          <div className="text-center my-1">--------------------------------</div>

          <div className="space-y-0.5">
            <p>Buyer's TIN: {formData.buyerTin}</p>
            <p>Buyer's name: {formData.buyerName} PLC</p>
            <p>Buyer's phone: {formData.buyerPhone || '........................'}</p>
          </div>

          <div className="text-center my-1">--------------------------------</div>

          {items.map((item) => (
            <div key={item.id} className="flex justify-between my-0.5">
              <span className="uppercase">{item.name}</span>
              <span>*{item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          ))}

          <div className="text-center my-1">--------------------------------</div>

          <div className="flex justify-between">
            <span>TAXBL1</span>
            <span>*{taxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>TAX1 {Number(formData.taxRate).toFixed(2)}%</span>
            <span>*{taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="text-center my-1">--------------------------------</div>

          <div className="flex justify-between font-bold text-[12px] mt-1">
            <span>TOTAL:</span>
            <span>*{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>CASH BIRR</span>
            <span>*{Number(formData.cashBirr).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>ITEM#</span>
            <span>{items.length}</span>
          </div>

          <div className="text-center mt-3">
            <p>ERCA</p>
            <div className="flex justify-center items-center gap-2 text-[14px] font-bold mt-0.5">
              <span>ET</span>
              <span>{formData.mfeNumber}</span>
            </div>
          </div>

          <div className="text-center font-bold mt-3">
            <p>THANK YOU COME AGAIN!</p>
          </div>

        </div>
      </div>

    </div>
  );
}