import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  Search, 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Copy, 
  MessageCircle, 
  Facebook, 
  Send,
  Plus,
  Minus,
  Package,
  Truck,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  StickyNote,
  AlertCircle,
  Menu,
  Download,
  X
} from 'lucide-react';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// --- Types ---
interface Product {
  name: string;
  pack: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CatalogCategory {
  label: string;
  franchises: {
    [key: string]: Product[];
  };
}

// --- Data ---
const CATALOG: { [key: string]: CatalogCategory } = {
  food: {
    label: 'Food',
    franchises: {
      'Siomai King': [
        { name: 'SK Chicken w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 325 },
        { name: 'SK Chicken w/ Corn & Malunggay', pack: '40 pcs/pack (Frozen)', price: 331 },
        { name: 'SK Shanghai w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 335 },
        { name: 'SK Hongkong w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 345 },
        { name: 'SK Beef w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 351 },
        { name: 'SK Japanese w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 386 }
      ],
      'Sulit Pack Siomai': [
        { name: 'SK Sulit Pack Spicy Chicken Siomai', pack: '40 pcs/pack', price: 145 },
        { name: 'SK Sulit Pack Chicken Siomai', pack: '40 pcs/pack', price: 145 },
        { name: 'SK Sulit Pack Pork Siomai', pack: '40 pcs/pack', price: 147 },
        { name: 'SK Sulit Pack Longganisa Siomai', pack: '40 pcs/pack', price: 153 },
        { name: 'SK Sulit Pack Beef Siomai', pack: '40 pcs/pack', price: 184 },
        { name: 'SK Sulit Pack Japanese Siomai', pack: '40 pcs/pack', price: 220 }
      ],
      'SK Extras': [
        { name: 'Chili Garlic Sauce Pack', pack: '20g/pack', price: 16.50 },
        { name: 'SK Gulaman Powder Juice', pack: '1 pack', price: 175 }
      ],
      'Sulit Pack Siopao': [
        { name: 'SK Sulit Pack Bola-Bola Siopao w/ Sauce', pack: '10 pcs/pack (Frozen)', price: 180 },
        { name: 'SK Sulit Pack Asado Siopao w/ Sauce', pack: '10 pcs/pack (Frozen)', price: 180 },
        { name: 'SK Sulit Pack Spicy Bola Bola Siopao', pack: '10 pcs/pack (Frozen)', price: 185 },
        { name: 'SK Sulit Pack Spicy Asado Siopao', pack: '10 pcs/pack (Frozen)', price: 185 },
        { name: 'SK Sulit Pack Adobo Siopao w/ Sauce', pack: '10 pcs/pack (Frozen)', price: 225 }
      ],
      'Mini Buns': [
        { name: 'SK Sulit Pack Mini Buns Coffee', pack: '30 pcs/pack', price: 95 },
        { name: 'SK Sulit Pack Mini Buns Choco', pack: '30 pcs/pack', price: 95 },
        { name: 'SK Sulit Pack Mini Buns Ube', pack: '30 pcs/pack', price: 95 }
      ],
      'Noodle House': [
        { name: 'NH Pork Tray 20\'s w/ Chili Garlic', pack: '20 pcs/Tray (Frozen)', price: 195 },
        { name: 'NH Beef Tray 20\'s w/ Chili Garlic', pack: '1 Tray (Frozen)', price: 195 },
        { name: 'NH Pork Wonton Tray 20\'s', pack: '1 Tray (Frozen)', price: 220 },
        { name: 'NH Dumpling Tray 20\'s', pack: '20 pcs/Tray (Frozen)', price: 220 },
        { name: 'NH Egg Noodles Pack', pack: '1 Pack', price: 316 },
        { name: 'NH Dumpling w/ Chili Garlic', pack: '25 pcs/pack (Frozen)', price: 320 },
        { name: 'NH Pork Wonton w/ Chili Garlic', pack: '30 pcs/pack (Frozen)', price: 335 },
        { name: 'NH Pork Siomai w/ Chili Garlic', pack: '35 pcs/pack (Frozen)', price: 340 },
        { name: 'NH Beef Siomai w/ Chili Garlic', pack: '35 pcs/pack (Frozen)', price: 378 },
        { name: 'NH Beef Teriyaki', pack: '1 pack (Frozen)', price: 398 }
      ],
      'Noodle House Sauce': [
        { name: 'NH Oyster Sauce Pack', pack: '100g/pack', price: 65 },
        { name: 'NH Peanut Sauce Pack', pack: '100g/pack', price: 74 },
        { name: 'NH Teriyaki Sauce Pack', pack: '100g/pack', price: 77 }
      ],
      'Siopao Da King': [
        { name: 'SPK Chicken Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 180 },
        { name: 'SPK Combi Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 190 },
        { name: 'SPK Asado Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 190 },
        { name: 'SPK Bola Bola Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 190 },
        { name: 'SPK Chili Asado Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 190 }
      ],
      'Boy Bondat': [
        { name: 'Boy Bondat Regular Sisig', pack: '100g/pack (Frozen)', price: 160 },
        { name: 'Boy Bondat Spicy Sisig', pack: '100g/pack (Frozen)', price: 160 },
        { name: 'Boy Bondat Pares w/ Chili Sauce', pack: '140g/pack (Frozen)', price: 182 },
        { name: 'Boy Bondat Goto Tray', pack: '1 Tray (Frozen)', price: 298 },
        { name: 'Boy Bondat Chicken Afritada Tray', pack: '400g/Tray', price: 308 },
        { name: 'Boy Bondat Pork Binagoongan Tray', pack: '300g/Tray', price: 348 },
        { name: 'Boy Bondat Regular Sisig Family Tray', pack: '1 Tray (Frozen)', price: 358 },
        { name: 'Boy Bondat Spicy Sisig Family Tray', pack: '1 Tray (Frozen)', price: 358 },
        { name: 'Boy Bondat Beef Pares Family Tray', pack: '1 Tray (Frozen)', price: 362 },
        { name: 'Boy Bondat Kare Kare Tray', pack: '1 Tray (Frozen)', price: 366 },
        { name: 'Boy Bondat Beef Kaldereta', pack: '450g/Tray (Frozen)', price: 399 },
        { name: 'Boy Bondat Pares Sauce', pack: '100g/pack (Frozen)', price: 45 }
      ],
      'Burger Factory': [
        { name: 'Burger Patty Pack', pack: '10pcs (Frozen)', price: 135 }
      ],
      'Potato King': [
        { name: 'PK Cheese Powder Pack', pack: '60g/pack', price: 175 },
        { name: 'PK BBQ Powder Pack', pack: '60g/pack', price: 175 },
        { name: 'PK Sour Cream Powder Pack', pack: '60g/pack', price: 175 },
        { name: 'Potato King Classic Fries Pack', pack: '1kg/pack (Frozen)', price: 275 }
      ]
    }
  },
  health: {
    label: 'Health & Wellness',
    franchises: {
      'JC Barley Coffee': [
        { name: 'JC Barley Classic Coffee Tub', pack: 'Tub', price: 2180 },
        { name: 'JC Barley Classic Coffee Box', pack: 'Box', price: 950 },
        { name: 'JC Barley Classic Coffee Stick', pack: 'Stick', price: 95 },
        { name: 'JC Barley Mocha Coffee Tub', pack: 'Tub', price: 2550 },
        { name: 'JC Barley Mocha Coffee Box', pack: 'Box', price: 1050 },
        { name: 'JC Barley Mocha Coffee Stick', pack: 'Stick', price: 95 },
        { name: 'JC Barley Black Coffee Box', pack: 'Box', price: 628 },
        { name: 'JC Barley Black Coffee Stick', pack: 'Stick', price: 62.8 }
      ],
      'JC Organic Matcha': [
        { name: 'JC Organic Matcha Tub', pack: 'Tub', price: 6990 },
        { name: 'JC Organic Matcha Box', pack: 'Box', price: 1200 },
        { name: 'JC Organic Matcha Stick', pack: 'Stick', price: 120 }
      ],
      'Health Products': [
        { name: 'JC Choco Barley Box', pack: 'Box', price: 989 },
        { name: 'JC Choco Barley Stick', pack: 'Stick', price: 98.9 },
        { name: 'JC Barley Milk Tea Box', pack: 'Box', price: 1050 },
        { name: 'JC Barley Milk Tea Stick', pack: 'Stick', price: 105 },
        { name: 'JC Barley Gold Box', pack: 'Box', price: 1200 },
        { name: 'JC Barley Gold Stick', pack: 'Stick', price: 120 },
        { name: 'JC Barley Brew Up Box', pack: 'Box', price: 1200 },
        { name: 'JC Barley Brew Up Stick', pack: 'Stick', price: 120 },
        { name: 'JC Barley Ginger Box', pack: 'Box', price: 1600 },
        { name: 'JC Barley Ginger Stick', pack: 'Stick', price: 160 },
        { name: 'JC Barley Coco Box', pack: 'Box', price: 1680 },
        { name: 'JC Barley Coco Stick', pack: 'Stick', price: 168 },
        { name: 'JC Barley Collagen Box', pack: 'Box', price: 1680 },
        { name: 'JC Barley Collagen Stick', pack: 'Stick', price: 168 },
        { name: 'JC Barley Capsule', pack: 'Bottle', price: 948 }
      ],
      'Health Sets': [
        { name: 'Breakthrough Blue (6 Sachets)', pack: 'Set', price: 850 },
        { name: 'Miracle Purple (6 Sachets)', pack: 'Set', price: 951 },
        { name: 'Hello Yellow (6 Sachets)', pack: 'Set', price: 622 }
      ],
      'Health Programs': [
        { name: 'Cell Detox Program', pack: '60-Day', price: 25876 },
        { name: 'Immunity Booster Program', pack: '60-Day', price: 23584 },
        { name: 'Weight Loss Program', pack: '60-Day', price: 25848 }
      ],
      'Nature\'s Own': [
        { name: 'Shampoo (240ML)', pack: 'Bottle', price: 890 },
        { name: 'Conditioner (240ML)', pack: 'Bottle', price: 990 },
        { name: 'Body Wash (240ML)', pack: 'Bottle', price: 1090 }
      ],
      'Kind / White': [
        { name: 'Omni White Soap', pack: 'Soap', price: 180 },
        { name: 'Omni White Kojic Soap', pack: 'Soap', price: 180 },
        { name: 'K-Pads Day (10pcs)', pack: 'Pack', price: 235 },
        { name: 'K-Pads Night (8pcs)', pack: 'Pack', price: 225 },
        { name: 'K-Pads Panty Liner (30pcs)', pack: 'Pack', price: 255 }
      ],
      'Kind Skincare': [
        { name: 'JC Kind Hydrating Matte Sunstick', pack: 'Sunstick', price: 1150 },
        { name: 'JC Kind Deep Hydrating Moisturizer', pack: '100ml', price: 1140 },
        { name: 'JC Kind Hydrating Cleansing Foam', pack: '120ml', price: 880 },
        { name: 'JC Kind Intensive Whitening Facial Cream', pack: '50ml', price: 1025 },
        { name: 'JC Kind Intensive Whitening Facial Serum', pack: '30ml', price: 1035 },
        { name: 'JC Kind Revitalizing Eye Cream', pack: '30ml', price: 885 },
        { name: 'JC Kind Revitalizing Anti-Wrinkle Facial Cream', pack: '50ml', price: 1035 },
        { name: 'JC Kind Revitalizing Toner', pack: '120ml', price: 1080 }
      ],
      'Kind Cosmetic': [
        { name: 'JC Kind Browcara Black/Brown/Clear', pack: '3g', price: 1480 },
        { name: 'JC Kind Paint - Blossom/Haven/Savvy/Sweet/Shy', pack: '10ml', price: 995 }
      ]
    }
  }
};

const DELIVERY_FEES = {
  Luzon: 150,
  Visayas: 180,
  Mindanao: 200,
  Pickup: 0
};

const PAYMENT_METHODS = {
  GCash: { name: 'Yam Venturina', details: '0961 507 8790', color: '#007DFE', qr: '/assets/gcash.png' },
  BPI: { name: 'Yam Venturina', details: 'xxxxxxxxxxxx632', color: '#B30000', qr: '/assets/bpi.png' },
  MariBank: { name: 'Yam Inri Venturina', details: '****6997', color: '#FF5722', qr: '/assets/mari.png' },
  Maya: { name: 'Yam Inri Venturina', details: '@yaminri03', color: '#000000', qr: '/assets/maya.png' },
  GoTyme: { name: 'Yam Inri Venturina', details: '7599', color: '#005AC6', qr: '/assets/gotyme.png' }
};

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('food');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ [key: string]: CartItem }>(() => {
    const saved = localStorage.getItem('yam_cart_v3');
    return saved ? JSON.parse(saved) : {};
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedQR, setSelectedQR] = useState<{ method: string, qr: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    fbName: '',
    email: '',
    address: {
      street: '',
      city: '',
      province: '',
      zip: ''
    },
    notes: '',
    deliveryOption: 'Luzon',
    paymentMethod: 'GCash'
  });

  // Theme Config
  const theme = useMemo(() => {
    if (activeTab === 'food') {
      return {
        brand: 'bg-red-600',
        text: 'text-red-600',
        border: 'border-red-100',
        tag: 'bg-red-50 text-red-600 border-red-100',
        accentLight: 'bg-red-50'
      };
    }
    return {
      brand: 'bg-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      tag: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accentLight: 'bg-emerald-50'
    };
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('yam_cart_v3', JSON.stringify(cart));
  }, [cart]);

  const cartValues = Object.values(cart) as CartItem[];
  const totalItems = cartValues.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartValues.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Conditional Pickup Logic
  const canPickup = subtotal >= 800;
  
  const deliveryFee = useMemo(() => {
    if (formData.deliveryOption === 'Pickup') {
      return canPickup ? 0 : 150;
    }
    return (DELIVERY_FEES as any)[formData.deliveryOption] || 150;
  }, [subtotal, canPickup, formData.deliveryOption]);

  const total = subtotal + deliveryFee;

  const filteredCatalog = useMemo(() => {
    const data = CATALOG[activeTab];
    const result: { [key: string]: Product[] } = {};
    
    Object.entries(data.franchises).forEach(([franchise, items]) => {
      const matchedItems = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchedItems.length > 0) {
        result[franchise] = matchedItems;
      }
    });
    
    return result;
  }, [activeTab, searchQuery]);

  const addToCart = (item: Product) => {
    setCart(prev => {
      const existing = prev[item.name];
      if (existing) {
        return { ...prev, [item.name]: { ...existing, quantity: existing.quantity + 1 } };
      }
      return { ...prev, [item.name]: { ...item, quantity: 1 } };
    });
    showToast('Added to Cart');
  };

  const updateQuantity = (name: string, delta: number) => {
    setCart(prev => {
      const item = prev[name];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: { ...item, quantity: newQty } };
    });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length > 4) formatted = val.slice(0, 4) + ' ' + val.slice(4);
    if (val.length > 7) formatted = formatted.slice(0, 8) + ' ' + formatted.slice(8);
    if (val.length <= 11) setFormData({ ...formData, mobile: formatted });
  };

  const generateOrderText = () => {
    let text = `*YAM VENTURINA ORDER SUMMARY*\n`;
    text += `--------------------------\n`;
    cartValues.forEach(item => {
      text += `• ${item.name} (${item.quantity}x) - ₱${(item.price * item.quantity).toLocaleString()}\n`;
    });
    text += `--------------------------\n`;
    text += `Subtotal: ₱${subtotal.toLocaleString()}\n`;
    text += `Delivery: ₱${deliveryFee.toLocaleString()}\n`;
    text += `*TOTAL: ₱${total.toLocaleString()}*\n\n`;
    text += `*CUSTOMER DETAILS*\n`;
    text += `Name: ${formData.fullName}\n`;
    text += `Mobile: ${formData.mobile}\n`;
    text += `Messenger: ${formData.fbName}\n`;
    text += `Address: ${formData.address.street}, ${formData.address.city}, ${formData.address.province} ${formData.address.zip}\n`;
    text += `Method: ${formData.paymentMethod}\n`;
    text += `Option: ${formData.deliveryOption === 'Pickup' ? 'Pickup (Paragon Plaza)' : formData.deliveryOption}\n`;
    if (formData.notes) text += `Notes: ${formData.notes}\n`;
    return text;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'orders'), {
        ...formData,
        items: cartValues.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        subtotal,
        deliveryFee,
        total,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      navigator.clipboard.writeText(generateOrderText());
      setIsSuccess(true);
      setIsCheckoutOpen(false);
      showToast('Order Logged & Copied');
    } catch (error) {
      console.error("Error saving order:", error);
      showToast('Error saving order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-neutral-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-3xl border-b border-white/10 px-6 py-5">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${theme.brand} shadow-lg shadow-black/5`}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">Yam Venturina</h1>
            </div>
            <div className="flex glass-pill p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('food')}
                className={`px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'food' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-400'}`}
              >
                Food
              </button>
              <button 
                onClick={() => setActiveTab('health')}
                className={`px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'health' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-400'}`}
              >
                Health & Wellness
              </button>
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-pill py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none transition-all placeholder:text-neutral-300"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 pt-10 pb-36 font-sans">
        {Object.entries(filteredCatalog).length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <Search className="w-12 h-12 mx-auto mb-4" />
            <p className="font-bold">No results found</p>
          </div>
        ) : (
          Object.entries(filteredCatalog).map(([franchise, items]: [string, Product[]]) => (
            <section key={franchise} className="mb-12">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-5 ml-1">{franchise}</h2>
              <div className="grid grid-cols-1 gap-5">
                {items.map((item) => (
                  <motion.div 
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 flex items-center gap-5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border whitespace-nowrap ${theme.tag}`}>
                          {franchise.split(' ')[0]}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm leading-tight text-neutral-800">{item.name}</h3>
                      <p className="text-[11px] text-neutral-400 font-semibold mt-1 uppercase tracking-tighter opacity-60">{item.pack}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center px-4 border-x border-white/20 min-w-[90px]">
                      <div className="bg-white/30 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20">
                        <div className={`font-mono font-extrabold text-base tabular-nums whitespace-nowrap flex items-center gap-0.5 ${theme.text}`}>
                          <span className="text-[11px] opacity-40 font-sans">₱</span>
                          {item.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {cart[item.name] ? (
                        <div className="flex flex-col items-center gap-1.5 bg-neutral-100/50 p-1.5 rounded-2xl border border-white">
                          <button onClick={() => updateQuantity(item.name, 1)} className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform ${theme.brand}`}><Plus className="w-3.5 h-3.5 text-white" /></button>
                          <span className="h-5 flex items-center font-mono font-bold text-xs text-neutral-800">{cart[item.name].quantity}</span>
                          <button onClick={() => updateQuantity(item.name, -1)} className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm active:scale-90 transition-transform"><Minus className={`w-3.5 h-3.5 ${theme.text}`} /></button>
                        </div>
                      ) : (
                        <motion.button 
                          whileTap={{ scale: 0.94 }}
                          onClick={() => addToCart(item)}
                          className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all shadow-xl shadow-black/5 ${theme.brand} hover:brightness-110 border border-white/20`}
                        >
                          <Plus className="w-6 h-6 text-white" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Floating Action Button */}
      <AnimatePresence>
        {totalItems > 0 && !isCheckoutOpen && !isSuccess && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50"
          >
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-black/80 backdrop-blur-3xl text-white rounded-[40px] p-6 shadow-2xl flex items-center justify-between active:scale-[0.97] transition-all border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Summary</p>
                  <p className="text-lg font-mono font-extrabold">₱{total.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-xl border border-white/5">{totalItems} Products</span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform"><ChevronRight className="w-5 h-5 opacity-40" /></div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Sidebar/Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-end font-sans">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm px-4"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 250 }}
              className="relative w-full max-w-md bg-white/70 backdrop-blur-3xl h-[92vh] rounded-t-[56px] overflow-hidden flex flex-col shadow-2xl border-t border-white"
            >
              <div className="w-16 h-1.5 bg-neutral-200/50 rounded-full mx-auto mt-4 mb-4" />
              
              <div className="px-10 pb-4 flex items-center justify-between">
                <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center active:scale-95 shadow-sm border border-neutral-100">
                  <ChevronLeft className="w-5 h-5 text-neutral-900" />
                </button>
                <h2 className="text-xl font-bold tracking-tight">Checkout</h2>
                <div className="w-10" />
              </div>

              <div className="flex-1 overflow-y-auto px-10 py-6 pb-40 scroll-smooth">
                {cartValues.length === 0 ? (
                  <div className="text-center py-24">
                    <Package className="w-16 h-16 mx-auto text-neutral-200 mb-6" />
                    <p className="font-bold text-neutral-300 uppercase tracking-widest text-xs mb-8">Cart is currently empty</p>
                    <button onClick={() => setIsCheckoutOpen(false)} className="bg-black text-white px-10 py-5 rounded-[24px] font-bold text-sm shadow-xl active:scale-95 transition-all">Go Back to Menu</button>
                  </div>
                ) : (
                  <>
                    <section className="mb-12 glass-card p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-bold uppercase text-neutral-300 tracking-[0.2em]">Order Summary</h3>
                        <ShoppingCart className="w-4 h-4 text-neutral-200" />
                      </div>
                      <div className="space-y-6">
                        {cartValues.map(item => (
                          <div key={item.name} className="flex justify-between items-center group">
                            <div className="flex-1 pr-6">
                              <p className="font-extrabold text-sm text-neutral-900 leading-tight mb-1">{item.name}</p>
                              <div className="flex items-center gap-2 font-mono tabular-nums">
                                <span className={`text-[10px] font-extrabold ${theme.text}`}>₱{item.price.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-neutral-300">×</span>
                                <span className="text-[10px] font-bold text-neutral-400">{item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-mono font-extrabold text-base tabular-nums text-right min-w-[80px]">₱{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-8 border-t border-neutral-50 space-y-4">
                        <div className="flex justify-between text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono tabular-nums">
                          <span className="font-sans">Subtotal</span>
                          <span className="text-neutral-900">₱{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono tabular-nums">
                          <span className="font-sans">Delivery</span>
                          <span className="text-neutral-900">₱{deliveryFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-extrabold text-neutral-900 pt-4 font-mono tabular-nums">
                          <span className="font-sans">Total</span>
                          <span>₱{total.toLocaleString()}</span>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-2xl flex gap-3 mt-6">
                          <AlertCircle className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                          <p className="text-[10px] text-neutral-400 italic font-bold leading-relaxed">Yam Venturina will contact you to verify final delivery costs.</p>
                        </div>
                      </div>
                    </section>

                    <form onSubmit={handleSubmit} className="space-y-12">
                      <section>
                        <h3 className="text-[10px] font-bold uppercase mb-6 text-neutral-300 tracking-[0.2em]">Personal Information</h3>
                        <div className="space-y-4">
                          {[
                            { id: 'fullName', type: 'text', placeholder: 'Full Name', icon: User },
                            { id: 'mobile', type: 'text', placeholder: '09XX XXX XXXX', icon: Phone, onChange: handleMobileChange },
                            { id: 'fbName', type: 'text', placeholder: 'Messenger Name', icon: Facebook },
                            { id: 'email', type: 'email', placeholder: 'Email Address', icon: Mail }
                          ].map((field) => (
                            <div key={field.id} className="relative group">
                              <field.icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-black transition-colors" />
                              <input 
                                required 
                                type={field.type} 
                                placeholder={field.placeholder} 
                                className="w-full bg-white border border-neutral-100 rounded-[28px] py-4.5 pl-14 pr-6 text-sm font-bold focus:ring-8 focus:ring-neutral-200/10 focus:outline-none focus:bg-white transition-all shadow-sm"
                                value={(formData as any)[field.id]} 
                                onChange={field.onChange || (e => setFormData({ ...formData, [field.id]: e.target.value }))}
                              />
                            </div>
                          ))}
                          
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase text-neutral-300 tracking-[0.1em] ml-2">Delivery Address</h4>
                            <div className="relative group">
                              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-black transition-colors" />
                              <input 
                                required
                                type="text"
                                placeholder="Street Address / Residence"
                                className="w-full bg-white border border-neutral-100 rounded-[28px] py-4.5 pl-14 pr-6 text-sm font-bold focus:ring-8 focus:ring-neutral-200/10 focus:outline-none transition-all shadow-sm"
                                value={formData.address.street} 
                                onChange={e => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              <input 
                                required
                                type="text"
                                placeholder="City"
                                className="w-full bg-white border border-neutral-100 rounded-[28px] py-4.5 px-6 text-sm font-bold focus:ring-8 focus:ring-neutral-200/10 focus:outline-none transition-all shadow-sm"
                                value={formData.address.city} 
                                onChange={e => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <input 
                                  required
                                  type="text"
                                  placeholder="PROVINCE"
                                  className="w-full bg-white border border-neutral-100 rounded-[28px] py-4.5 px-6 text-sm font-bold focus:ring-8 focus:ring-neutral-200/10 focus:outline-none transition-all shadow-sm uppercase placeholder:normal-case"
                                  value={formData.address.province} 
                                  onChange={e => setFormData({ ...formData, address: { ...formData.address, province: e.target.value.toUpperCase() } })}
                                />
                                <input 
                                  required
                                  type="text"
                                  placeholder="ZIP Code"
                                  className="w-full bg-white border border-neutral-100 rounded-[28px] py-4.5 px-6 text-sm font-bold focus:ring-8 focus:ring-neutral-200/10 focus:outline-none transition-all shadow-sm"
                                  value={formData.address.zip} 
                                  onChange={e => setFormData({ ...formData, address: { ...formData.address, zip: e.target.value } })}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="relative group">
                            <StickyNote className="absolute left-5 top-5 w-4 h-4 text-neutral-300 group-focus-within:text-black transition-colors" />
                            <textarea 
                              placeholder="Notes for shipping..." 
                              className="w-full bg-white border border-neutral-100 rounded-[28px] py-5 pl-14 pr-6 text-sm font-bold min-h-[100px] focus:ring-8 focus:ring-neutral-200/10 focus:outline-none resize-none transition-all shadow-sm"
                              value={formData.notes} 
                              onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-[10px] font-bold uppercase mb-6 text-neutral-300 tracking-[0.2em]">Shipping Policy</h3>
                        {!canPickup && (
                          <div className="flex items-center gap-4 p-5 bg-black text-white rounded-3xl mb-5 shadow-xl shadow-black/10">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" />
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Free Pickup at Paragon Lobby unlocks at ₱800</p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-3">
                          {Object.keys(DELIVERY_FEES).filter(opt => opt !== 'Pickup' || canPickup).map(opt => (
                            <button
                              key={opt} type="button"
                              onClick={() => setFormData({ ...formData, deliveryOption: opt })}
                              className={`flex items-center justify-between p-5 rounded-[28px] border transition-all text-sm font-bold ${formData.deliveryOption === opt ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-white border-neutral-100 text-neutral-900 shadow-sm hover:translate-x-1'}`}
                            >
                              <div className="flex items-center gap-4">
                                {opt === 'Pickup' ? <MapPin className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                                <span className="uppercase tracking-tight">{opt}</span>
                              </div>
                              <span className={`text-[10px] font-mono tabular-nums uppercase ${formData.deliveryOption === opt ? 'opacity-60' : 'text-neutral-400'}`}>₱{(DELIVERY_FEES as any)[opt]}</span>
                            </button>
                          ))}
                        </div>
                        {formData.deliveryOption === 'Pickup' && (
                          <div className="mt-5 p-5 bg-white rounded-3xl border border-neutral-100 flex items-center gap-4 shadow-inner">
                            <MapPin className="w-5 h-5 text-emerald-500" />
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed italic">Paragon Plaza Condominium (Lobby)</p>
                          </div>
                        )}
                      </section>

                      <section>
                        <h3 className="text-[10px] font-bold uppercase mb-6 text-neutral-300 tracking-[0.2em]">Payment Collection</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {Object.entries(PAYMENT_METHODS).map(([method, data]) => (
                            <div key={method} className="flex flex-col gap-4">
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                className={`flex flex-col p-6 rounded-[32px] border transition-all text-sm text-left ${formData.paymentMethod === method ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-white border-neutral-100 text-neutral-900 shadow-sm'}`}
                              >
                                <div className="flex items-center gap-4 mb-3">
                                  <CreditCard className={`w-5 h-5 ${formData.paymentMethod === method ? 'text-white' : 'text-neutral-200'}`} />
                                  <span className="font-bold uppercase tracking-[0.2em]">{method}</span>
                                </div>
                                <div className="flex flex-col items-start pl-9 text-[10px] gap-1 opacity-60">
                                  <p className="font-bold italic">{data.name}</p>
                                  <p className="font-mono font-bold underline underline-offset-4 decoration-neutral-500">{data.details}</p>
                                </div>
                              </button>
                              
                              <AnimatePresence>
                                {formData.paymentMethod === method && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }} 
                                    animate={{ height: 'auto', opacity: 1 }} 
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-white p-8 rounded-[40px] border border-neutral-100 flex flex-col items-center justify-center gap-6 shadow-xl mb-4">
                                      <div className="relative group">
                                        <div className="absolute -inset-4 bg-neutral-50 rounded-[48px] -z-10 group-hover:bg-neutral-100 transition-colors" />
                                          <div 
                                            className="w-56 h-56 bg-neutral-50 rounded-3xl flex items-center justify-center border-4 border-white shadow-inner overflow-hidden relative cursor-zoom-in"
                                            onClick={() => setSelectedQR({ method, qr: (data as any).qr })}
                                          >
                                             <img 
                                               src={(data as any).qr} 
                                               alt={`${method} QR Code`}
                                               className="w-full h-full object-contain p-2"
                                               onError={(e) => {
                                                 // Fallback to QR API if local image fails
                                                 (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.details)}`;
                                               }}
                                               referrerPolicy="no-referrer"
                                             />
                                          </div>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 mb-2">Scan with {method} app</p>
                                        <div className="flex flex-col items-center gap-4">
                                          <p className="font-mono font-bold text-xs">{data.details}</p>
                                          <div className="flex gap-2">
                                            <button 
                                              type="button"
                                              onClick={() => setSelectedQR({ method, qr: (data as any).qr })}
                                              className="text-[9px] font-bold uppercase tracking-wider px-4 py-2 bg-neutral-50 rounded-full border border-neutral-100 hover:bg-neutral-100 transition-colors flex items-center gap-2"
                                            >
                                              <Search className="w-3 h-3" /> View Large
                                            </button>
                                            <a 
                                              href={(data as any).qr} 
                                              download={`${method}-QR.png`}
                                              onClick={(e) => {
                                                // If it's a relative path, we might need to handle the download differently
                                                // but for public assets, standard download attribute usually works
                                              }}
                                              className="text-[9px] font-bold uppercase tracking-wider px-4 py-2 bg-neutral-800 text-white rounded-full hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
                                            >
                                              <Download className="w-3 h-3" /> Save QR
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </section>

                      <div className="bg-neutral-900 text-white p-8 rounded-[48px] shadow-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-all duration-700" />
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 opacity-30">Procedure</h4>
                        <ol className="space-y-6">
                          {[
                            "Transfer payment & Send Screenshot via Messenger/WhatsApp.",
                            "Click the 'Submit Order' button below.",
                            "Copy the generated Order Summary text.",
                            "Send the text & screenshot to Yam via Messenger or WhatsApp."
                          ].map((step, i) => (
                            <li key={i} className="flex gap-5 text-xs font-bold leading-relaxed group-hover:translate-x-1 transition-transform">
                              <span className="w-6 h-6 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{i+1}</span>
                              <span className="opacity-80 group-hover:opacity-100 transition-opacity">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <button type="submit" className="w-full bg-black text-white rounded-[32px] py-7 font-bold text-xl shadow-2xl shadow-black/30 active:scale-95 transition-all mb-16 border border-white/10 ring-4 ring-black/5">Submit Order</button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[56px] w-full max-w-sm p-12 flex flex-col items-center text-center shadow-3xl relative border border-white"
            >
              <div className="w-28 h-28 rounded-full bg-emerald-50 flex items-center justify-center mb-8 border-8 border-emerald-500/5 shadow-inner">
                <CheckCircle2 className="w-14 h-14 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-neutral-900 tracking-tight">Order Saved</h2>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-12 leading-relaxed max-w-[220px]">Summary copied to clipboard. Send it to Yam with your payment screenshot.</p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generateOrderText());
                    showToast('Summary Re-copied');
                  }}
                  className="w-full bg-neutral-100 text-neutral-900 border border-neutral-200 py-5 rounded-[28px] font-bold flex items-center justify-center gap-4 text-xs active:scale-95 transition-all shadow-sm"
                >
                  <Copy className="w-5 h-5" /> Copy Order Summary
                </button>
                <div className="grid grid-cols-1 gap-4">
                  <a 
                    href={`https://wa.me/639615078790?text=${encodeURIComponent(generateOrderText())}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full bg-[#25D366] text-white py-6 rounded-[28px] font-bold flex items-center justify-center gap-4 active:scale-95 transition-all text-xs uppercase shadow-lg shadow-[#25D366]/20"
                  >
                    <MessageCircle className="w-6 h-6" /> Send via WhatsApp
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61582492107190" target="_blank" rel="noreferrer" className="w-full bg-[#1877F2] text-white py-6 rounded-[28px] font-bold flex items-center justify-center gap-4 active:scale-95 transition-all text-xs uppercase shadow-lg shadow-[#1877F2]/20">
                    <Facebook className="w-6 h-6" /> Message on Facebook
                  </a>
                </div>
              </div>

              <button 
                onClick={() => {
                  setCart({});
                  setIsSuccess(false);
                  setFormData({ fullName: '', mobile: '', fbName: '', email: '', address: { street: '', city: '', province: '', zip: '' }, notes: '', deliveryOption: 'Luzon', paymentMethod: 'GCash' });
                }}
                className="mt-12 text-neutral-300 font-bold text-[10px] uppercase tracking-[0.4em] hover:text-black transition-all"
              >
                Reset Session
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Full View Modal */}
      <AnimatePresence>
        {selectedQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-[40px]"
            onClick={() => setSelectedQR(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[48px] p-8 w-full max-w-sm flex flex-col items-center gap-8 shadow-3xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-6 right-6">
                <button 
                  onClick={() => setSelectedQR(null)}
                  className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center active:scale-95 transition-all text-neutral-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mt-4">
                <h3 className="text-lg font-bold tracking-tight text-neutral-900">{selectedQR.method} Payment QR</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1">Scan or Download to Pay</p>
              </div>

              <div className="w-full aspect-square bg-neutral-50 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedQR.qr} 
                  alt="Full Size QR"
                  className="w-full h-full object-contain p-4"
                />
              </div>

              <div className="w-full space-y-3">
                <a 
                  href={selectedQR.qr} 
                  download={`${selectedQR.method}-QR.png`}
                  className="w-full bg-black text-white py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <Download className="w-5 h-5" /> Download QR Code
                </a>
                <button 
                  onClick={() => setSelectedQR(null)}
                  className="w-full py-5 rounded-[24px] font-bold text-neutral-400 text-xs uppercase tracking-widest hover:text-black transition-colors"
                >
                  Back to Checkout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-neutral-900/90 text-white px-8 py-4 rounded-full text-[11px] font-bold shadow-2xl flex items-center gap-4 whitespace-nowrap backdrop-blur-3xl border border-white/10">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="uppercase tracking-widest">{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
