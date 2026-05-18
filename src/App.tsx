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
  X,
  Utensils,
  Leaf,
  Trash2,
  MessageSquare,
  Moon,
  Sun
} from 'lucide-react';

import gcashQr from './assets/gcash.png';
import bpiQr from './assets/bpi.png';
import mariQr from './assets/mari.png';
import mayaQr from './assets/maya.png';
import gotymeQr from './assets/gotyme.png';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// --- Types ---
interface Product {
  name: string;
  pack: string;
  price: number;
  image?: string;
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
        { name: 'SK Chicken w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 325, image: 'sk-chicken-siomai-chili-garlic.png' },
        { name: 'SK Chicken w/ Corn & Malunggay', pack: '40 pcs/pack (Frozen)', price: 331, image: 'sk-chicken-corn-malunggay-siomai.png' },
        { name: 'SK Shanghai w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 335, image: 'sk-shanghai-siomai-chili-garlic.png' },
        { name: 'SK Hongkong w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 345, image: 'sk-hongkong-siomai-chili-garlic.png' },
        { name: 'SK Beef w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 351, image: 'sk-beef-siomai-chili-garlic.png' },
        { name: 'SK Japanese w/ Chili Garlic', pack: '40 pcs/pack (Frozen)', price: 386, image: 'sk-japanese-siomai-chili-garlic.png' }
      ],
      'Sulit Pack Siomai': [
        { name: 'SK Sulit Pack Spicy Chicken Siomai', pack: '40 pcs/pack', price: 145, image: 'sk-sulit-pack-spicy-siomai.png' },
        { name: 'SK Sulit Pack Chicken Siomai', pack: '40 pcs/pack', price: 145, image: 'sk-sulit-pack-chicken-siomai.png' },
        { name: 'SK Sulit Pack Pork Siomai', pack: '40 pcs/pack', price: 147, image: 'sk-sulit-pack-pork-siomai.png' },
        { name: 'SK Sulit Pack Longganisa Siomai', pack: '40 pcs/pack', price: 153, image: 'sk-sulit-pack-longganisa-siomai.png' },
        { name: 'SK Sulit Pack Beef Siomai', pack: '40 pcs/pack', price: 184, image: 'sk-sulit-pack-beef-siomai.png' },
        { name: 'SK Sulit Pack Japanese Siomai', pack: '40 pcs/pack', price: 220, image: 'sk-sulit-pack-japanese-siomai.png' }
      ],
      'SK Extras': [
        { name: 'Chili Garlic Sauce Pack', pack: '20g/pack', price: 16.50, image: 'sk-chili-garlic-sauce-20g.png' },
        { name: 'SK Gulaman Powder Juice', pack: '1 pack', price: 175, image: 'sk-black-gulaman-powder-juice.png' }
      ],
      'Sulit Pack Siopao': [
        { name: 'SK Sulit Pack Bola-Bola Siopao w/ Sauce', pack: '10 pcs/pack (Frozen)', price: 180, image: 'sk-sulit-pack-bola-bola-siopao.png' },
        { name: 'SK Sulit Pack Asado Siopao w/ Sauce', pack: '10 pcs/pack (Frozen)', price: 180, image: 'siomai-king-adobo-siopao-sulit-pack.png' },
        { name: 'SK Sulit Pack Spicy Bola Bola Siopao', pack: '10 pcs/pack (Frozen)', price: 185, image: 'sk-sulit-pack-spicy-bola-bola-siopao.png' },
        { name: 'SK Sulit Pack Spicy Asado Siopao', pack: '10 pcs/pack (Frozen)', price: 185, image: 'sk-sulit-pack-spicy-asado-siopao.png' },
        { name: 'SK Sulit Pack Adobo Siopao w/ Sauce', pack: '10 pcs/pack (Frozen)', price: 225, image: 'sk-sulit-pack-adobo-siopao.png' }
      ],
      'Mini Buns': [
        { name: 'SK Sulit Pack Mini Buns Coffee', pack: '30 pcs/pack', price: 95, image: 'sk-sulit-pack-mini-buns-coffee.png' },
        { name: 'SK Sulit Pack Mini Buns Choco', pack: '30 pcs/pack', price: 95, image: 'sk-sulit-pack-mini-buns-choco.png' },
        { name: 'SK Sulit Pack Mini Buns Ube', pack: '30 pcs/pack', price: 95, image: 'sk-sulit-pack-mini-buns-ube.png' }
      ],
      'Noodle House': [
        { name: 'NH Pork Tray 20\'s w/ Chili Garlic', pack: '20 pcs/Tray (Frozen)', price: 195, image: 'nh-pork-siomai-tray.png' },
        { name: 'NH Beef Tray 20\'s w/ Chili Garlic', pack: '1 Tray (Frozen)', price: 195, image: 'nh-beef-siomai-tray.png' },
        { name: 'NH Pork Wonton Tray 20\'s', pack: '1 Tray (Frozen)', price: 220, image: 'nh-wanton-siomai-tray.png' },
        { name: 'NH Dumpling Tray 20\'s', pack: '20 pcs/Tray (Frozen)', price: 220, image: 'nh-dumplings-chili-garlic-tray.png' },
        { name: 'NH Beef Siomai w/ Chili Garlic', pack: '35 pcs/pack (Frozen)', price: 378, image: 'nh-beef-siomai-tray.png' },
        { name: 'NH Egg Noodles Pack', pack: '1 Pack', price: 316, image: 'nh-egg-noodles-cup.png' },
        { name: 'NH Dumpling w/ Chili Garlic', pack: '25 pcs/pack (Frozen)', price: 320, image: 'nh-dumpling-noodle-cup.png' },
        { name: 'NH Pork Wonton w/ Chili Garlic', pack: '30 pcs/pack (Frozen)', price: 335, image: 'nh-wanton-noodle-cup.png' },
        { name: 'NH Pork Siomai w/ Chili Garlic', pack: '35 pcs/pack (Frozen)', price: 340, image: 'nh-pork-siomai-noodle-cup.png' },
        { name: 'NH Beef Teriyaki', pack: '1 pack (Frozen)', price: 398, image: 'nh-beef-noodle-cup.png' }
      ],
      'Noodle House Sauce': [
        { name: 'NH Oyster Sauce Pack', pack: '100g/pack', price: 65, image: 'nh-oyster-sauce-100g.png' },
        { name: 'NH Peanut Sauce Pack', pack: '100g/pack', price: 74, image: 'nh-peanut-sauce.png' },
        { name: 'NH Teriyaki Sauce Pack', pack: '100g/pack', price: 77, image: 'nh-teriyaki-sauce-100g.png' }
      ],
      'Siopao Da King': [
        { name: 'SPK Chicken Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 180, image: 'spk-chicken-siopao.png' },
        { name: 'SPK Combi Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 190, image: 'spk-combi-siopao.png' },
        { name: 'SPK Asado Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 190, image: 'spk-asado-siopao.png' },
        { name: 'SPK Bola Bola Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 190, image: 'spk-bola-bola-siopao.png' },
        { name: 'SPK Chili Asado Siopao w/ Sauce', pack: '6pcs/pack (Frozen)', price: 190, image: 'spk-chili-asado-siopao.png' }
      ],
      'Boy Bondat': [
        { name: 'Boy Bondat Regular Sisig', pack: '100g/pack (Frozen)', price: 160, image: 'boy-bondat-pork-sisig-sizzling.png' },
        { name: 'Boy Bondat Spicy Sisig', pack: '100g/pack (Frozen)', price: 160, image: 'boy-bondat-spicy-sisig-sizzling.png' },
        { name: 'Boy Bondat Pares w/ Chili Sauce', pack: '140g/pack (Frozen)', price: 182, image: 'boy-bondat-beef-pares-garlic-rice.png' },
        { name: 'Boy Bondat Goto Tray', pack: '1 Tray (Frozen)', price: 298, image: 'boy-bondat-goto-tray.png' },
        { name: 'Boy Bondat Chicken Afritada Tray', pack: '400g/Tray', price: 308, image: 'boy-bondat-chicken-afritada-tray.png' },
        { name: 'Boy Bondat Pork Binagoongan Tray', pack: '300g/Tray', price: 348, image: 'boy-bondat-pork-binagoongan-tray.png' },
        { name: 'Boy Bondat Regular Sisig Family Tray', pack: '1 Tray (Frozen)', price: 358, image: 'boy-bondat-special-sisig-tray.png' },
        { name: 'Boy Bondat Spicy Sisig Family Tray', pack: '1 Tray (Frozen)', price: 358, image: 'boy-bondat-spicy-sisig-tray.png' },
        { name: 'Boy Bondat Beef Pares Family Tray', pack: '1 Tray (Frozen)', price: 362, image: 'boy-bondat-beef-pares-tray.png' },
        { name: 'Boy Bondat Kare Kare Tray', pack: '1 Tray (Frozen)', price: 366, image: 'boy-bondat-kare-kare-tray.png' },
        { name: 'Boy Bondat Beef Kaldereta', pack: '450g/Tray (Frozen)', price: 399, image: 'boy-bondat-beef-kaldereta-450g-tray.png' }
        // { name: 'Boy Bondat Pares Sauce', pack: '100g/pack (Frozen)', price: 45 }
      ],
      'Burger Factory': [
        { name: 'Burger Patty Pack', pack: '10pcs (Frozen)', price: 135, image: 'burger-factory-mini-sliders.png' }
      ],
      'Potato King': [
        { name: 'PK Cheese Powder Pack', pack: '60g/pack', price: 175, image: 'potato-king-cheese-fries-bag.png' },
        { name: 'PK BBQ Powder Pack', pack: '60g/pack', price: 175, image: 'potato-king-seasoned-fries-bag.png' },
        { name: 'PK Sour Cream Powder Pack', pack: '60g/pack', price: 175, image: 'potato-king-seasoned-fries-pack.png' },
        { name: 'Potato King Classic Fries Pack', pack: '1kg/pack (Frozen)', price: 275, image: 'potato-king-classic-fries-1kg.png' }
      ]
    }
  },
  health: {
    label: 'Health & Wellness',
    franchises: {
      'JC Barley Coffee': [
        { name: 'JC Classic Coffee Tub', pack: 'Tub', price: 2180, image: 'jc-barley-classic-coffee-tub.png' },
        { name: 'JC Barley Coffee Classic Box', pack: 'Box', price: 950, image: 'jc-barley-coffee-classic-box.png' },
        { name: 'JC Barley Coffee Classic Stick', pack: 'Stick', price: 95, image: 'jc-barley-coffee-classic-box.png' },
        { name: 'JC Mocha Coffee Tub', pack: 'Tub', price: 2550, image: 'jc-mocha-coffee-tub.png' },
        { name: 'JC Barley Coffee Mocha Box', pack: 'Box', price: 1050, image: 'jc-barley-coffee-mocha-box.png' },
        { name: 'JC Barley Coffee Mocha Stick', pack: 'Stick', price: 95, image: 'jc-barley-coffee-mocha-box.png' },
        { name: 'JC Black Coffee Tub', pack: 'Tub', price: 1050, image: 'jc-black-coffee-tub.png' },
        { name: 'JC Barley Coffee Black Box', pack: 'Box', price: 628, image: 'jc-barley-coffee-black-box.png' },
        { name: 'JC Barley Coffee Black Stick', pack: 'Stick', price: 62.8, image: 'jc-barley-coffee-black-box.png' }
      ],
      'JC Organic Matcha': [
        { name: 'JC Organic Matcha Tub', pack: 'Tub', price: 6990, image: 'jc-organic-barley-tub.png' },
        { name: 'JC Organic Matcha Box', pack: 'Box', price: 1200, image: 'jc-organic-barley-matcha-box.png' },
        { name: 'JC Organic Matcha Stick', pack: 'Stick', price: 120, image: 'jc-organic-barley-matcha-box.png' }
      ],
      'Health Products': [
        { name: 'JC Choco Barley Drink Mix Box', pack: 'Box', price: 989, image: 'jc-choco-barley-box.png' },
        { name: 'JC Choco Barley Drink Mix Stick', pack: 'Stick', price: 98.9, image: 'jc-choco-barley-box.png' },
        { name: 'JC Barley Milk Tea Box', pack: 'Box', price: 1050, image: 'jc-barley-milktea-box.png' },
        { name: 'JC Barley Milk Tea Stick', pack: 'Stick', price: 105, image: 'jc-barley-milktea-box.png' },
        { name: 'JC Organic Barley Gold Box', pack: 'Box', price: 1200, image: 'jc-organic-barley-gold-box.png' },
        { name: 'JC Organic Barley Gold Stick', pack: 'Stick', price: 120, image: 'jc-organic-barley-gold-box.png' },
        { name: 'JC Coffee Brew Up Box', pack: 'Box', price: 1200, image: 'jc-brew-up-barley-coffee-box.png' },
        { name: 'JC Coffee Brew Up Stick', pack: 'Stick', price: 120, image: 'jc-brew-up-barley-coffee-box.png' },
        { name: 'JC Ginger Barley Box', pack: 'Box', price: 1600, image: 'jc-ginger-barley-box.png' },
        { name: 'JC Ginger Barley Stick', pack: 'Stick', price: 160, image: 'jc-ginger-barley-box.png' },
        { name: 'JC Coco Barley Box', pack: 'Box', price: 1680, image: 'jc-coco-barley-box.png' },
        { name: 'JC Coco Barley Stick', pack: 'Stick', price: 168, image: 'jc-coco-barley-box.png' },
        { name: 'JC Collagen Barley Box', pack: 'Box', price: 1680, image: 'jc-collagen-barley-box.png' },
        { name: 'JC Collagen Barley Stick', pack: 'Stick', price: 168, image: 'jc-collagen-barley-box.png' },
        { name: 'JC Organic Barley Capsule', pack: 'Bottle', price: 948, image: 'jc-organic-barley-capsules.png' },
        { name: 'JC OmniFit Capsules', pack: 'Bottle', price: 948, image: 'jc-omnifit-capsules.png' },
        { name: 'JC 4Green Capsules', pack: 'Bottle', price: 948, image: 'jc-4green-capsules.png' },
        { name: 'JC Calvit-C Capsules 500mg', pack: 'Bottle', price: 948, image: 'jc-calvit-c-capsules-500mg.png' }
      ],
      'Health Sets': [
        { name: 'Breakthrough Blue (6 Sachets)', pack: 'Set', price: 850 },
        { name: 'Miracle Purple (6 Sachets)', pack: 'Set', price: 951 },
        { name: 'Hello Yellow (6 Sachets)', pack: 'Set', price: 622 },
        { name: 'JC Organic Barley Limited Edition Set', pack: 'Set', price: 1500, image: 'jc-organic-barley-limited-edition-set.png' }
      ],
      'Health Programs': [
        { name: '60-Day Cell Detox Program', pack: '60-Day', price: 25876, image: 'jc-60-day-cell-detox-program.png' },
        { name: '60-Day Immunity Booster Program', pack: '60-Day', price: 23584, image: 'jc-60-day-immunity-booster-program.png' },
        { name: '60-Day Weight Loss Program', pack: '60-Day', price: 25848, image: 'jc-60-day-weight-loss-program.png' }
      ],
      'Nature\'s Own': [
        { name: 'JC Nature\'s Own Shampoo (240ML)', pack: 'Bottle', price: 890, image: 'jc-natures-own-shampoo-240ml.png' },
        { name: 'JC Nature\'s Own Conditioner (240ML)', pack: 'Bottle', price: 990, image: 'jc-natures-own-conditioner-240ml.png' },
        { name: 'JC Nature\'s Own Body Wash (240ML)', pack: 'Bottle', price: 1090, image: 'jc-natures-own-bodywash-240ml.png' }
      ],
      'Kind / White': [
        { name: 'OmniWhite Soap', pack: 'Soap', price: 180, image: 'jc-omni-white-soap.png' },
        { name: 'OmniWhite Kojic Soap', pack: 'Soap', price: 180, image: 'jc-omni-white-kojic-soap.png' },
        { name: 'K-Pads Day (10 Pads)', pack: 'Pack', price: 235, image: 'jc-kpads-day-10pcs.png' },
        { name: 'K-Pads Night (8 Pads)', pack: 'Pack', price: 225, image: 'jc-kpads-night-8pcs.png' },
        { name: 'K-Pads Pantyliner (30 Pads)', pack: 'Pack', price: 255, image: 'jc-kpads-panty-liner-30pcs.png' }
      ],
      'Kind Skincare': [
        { name: 'JC Kind Hydrating Matte Sunstick', pack: 'Sunstick', price: 1150, image: 'jc-kind-hydrating-matte-sunstick.png' },
        { name: 'JC Kind Deep Hydrating Moisturizer', pack: '100ml', price: 1140, image: 'jc-kind-deep-hydrating-moisturizer.png' },
        { name: 'JC Kind Hydrating Cleansing Foam', pack: '120ml', price: 880, image: 'jc-kind-hydrating-cleansing-foam.png' },
        { name: 'JC Kind Intensive Whitening Facial Cream', pack: '50ml', price: 1025, image: 'jc-kind-intensive-whitening-facial-cream.png' },
        { name: 'JC Kind Intensive Whitening Facial Serum', pack: '30ml', price: 1035, image: 'jc-kind-intensive-whitening-facial-serum.png' },
        { name: 'JC Kind Revitalizing Eye Cream', pack: '30ml', price: 885, image: 'jc-kind-revitalizing-eye-cream.png' },
        { name: 'JC Kind Revitalizing Anti-Wrinkle Facial Cream', pack: '50ml', price: 1035, image: 'jc-kind-anti-wrinkle-facial-cream-50ml.png' },
        { name: 'JC Kind Revitalizing Anti-Wrinkle Facial Serum', pack: '30ml', price: 1035, image: 'jc-kind-anti-wrinkle-facial-serum.png' },
        { name: 'JC Kind Revitalizing Toner', pack: '120ml', price: 1080, image: 'jc-kind-revitalizing-toner.png' }
      ],
      'Kind Cosmetic': [
        { name: 'JC Kind Browcara Black', pack: '3g', price: 1480, image: 'jc-kind-browcara-black.png' },
        { name: 'JC Kind Browcara Brown', pack: '3g', price: 1480, image: 'jc-kind-browcara-brown.png' },
        { name: 'JC Kind Browcara Clear', pack: '3g', price: 1480, image: 'jc-kind-browcara-clear.png' },
        { name: 'JC Kind Paint - Blossom', pack: '10ml', price: 995, image: 'jc-kind-paint-blossom.png' },
        { name: 'JC Kind Paint - Haven', pack: '10ml', price: 995, image: 'jc-kind-paint-haven.png' },
        { name: 'JC Kind Paint - Savvy', pack: '10ml', price: 995, image: 'jc-kind-paint-savvy.png' },
        { name: 'JC Kind Paint - Sweet', pack: '10ml', price: 995, image: 'jc-kind-paint-sweet.png' },
        { name: 'JC Kind Paint - Shy', pack: '10ml', price: 995, image: 'jc-kind-paint-shy.png' }
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
  GCash: { name: 'Yam Venturina', details: '0961 507 8790', color: '#007DFE', qr: gcashQr },
  BPI: { name: 'Yam Venturina', details: '0616889632', color: '#B30000', qr: bpiQr },
  MariBank: { name: 'Yam Inri Venturina', details: '1726-5006-997', color: '#FF5722', qr: mariQr },
  Maya: { name: 'Yam Venturina', details: '0961 507 8790', color: '#000000', qr: mayaQr },
  GoTyme: { name: 'Yam Inri Venturina', details: '018862697599', color: '#005AC6', qr: gotymeQr }
};

// --- Helper Functions ---
const getKebabCaseName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('food');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSelectedFranchise(null);
  }, [activeTab]);

  const [cart, setCart] = useState<{ [key: string]: CartItem }>(() => {
    const saved = localStorage.getItem('yam_cart_v3');
    return saved ? JSON.parse(saved) : {};
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedQR, setSelectedQR] = useState<{ method: string, qr: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [allProvinces, setAllProvinces] = useState<{code: string, name: string, islandGroupCode: string}[]>([]);
  const [provinces, setProvinces] = useState<{code: string, name: string}[]>([]);
  const [cities, setCities] = useState<{code: string, name: string}[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    fbName: '',
    email: '',
    address: {
      region: 'Luzon', // 'Luzon' | 'Visayas' | 'Mindanao'
      provinceCode: '',
      province: '',
      cityCode: '',
      city: '',
      street: '',
      zip: ''
    },
    notes: '',
    deliveryOption: 'Luzon', // 'Luzon' / 'Visayas' / 'Mindanao' or 'Pickup'
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
  
  useEffect(() => {
    if (!canPickup && formData.deliveryOption === 'Pickup') {
      setFormData(prev => ({ ...prev, deliveryOption: prev.address.region }));
    }
  }, [canPickup, formData.deliveryOption]);

  const deliveryFee = useMemo(() => {
    if (formData.deliveryOption === 'Pickup') {
      return 0;
    }
    return (DELIVERY_FEES as any)[formData.deliveryOption] || 150;
  }, [formData.deliveryOption]);

  const total = subtotal + deliveryFee;

  const filteredCatalog = useMemo(() => {
    const data = CATALOG[activeTab];
    const result: { [key: string]: Product[] } = {};
    
    Object.entries(data.franchises).forEach(([franchise, items]) => {
      if (selectedFranchise && selectedFranchise !== franchise) return;
      const matchedItems = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchedItems.length > 0) {
        result[franchise] = matchedItems;
      }
    });
    
    return result;
  }, [activeTab, searchQuery, selectedFranchise]);

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
    if (formData.fbName) text += `Messenger: ${formData.fbName}\n`;
    if (formData.email) text += `Email: ${formData.email}\n`;
    
    if (formData.deliveryOption === 'Pickup') {
      text += `Method: Pickup\n`;
      text += `Location: Paragon Plaza Condominium (Lobby Area)\n`;
    } else {
      text += `Method: Delivery (${formData.address.region})\n`;
      text += `Address: ${formData.address.street}, ${formData.address.city}, ${formData.address.province} ${formData.address.zip}\n`;
    }

    text += `Payment: ${formData.paymentMethod}\n`;
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
    <div className={`min-h-screen font-sans relative overflow-hidden transition-colors ${isDarkMode ? 'dark bg-[#121212] text-white' : 'bg-[#f2f2f7] text-neutral-900'}`}>
      {/* Background Blobs for Glass Effect */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-200/50 blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-red-200/40 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-blue-100/40 blur-[80px] pointer-events-none -z-10" />

      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-3xl border-b px-6 py-5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-colors ${isDarkMode ? 'bg-[#1C1C1E]/80 border-white/10' : 'bg-white/50 border-white/40'}`}>
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${theme.brand} shadow-lg shadow-black/5`}>
                {activeTab === 'food' ? (
                  <Utensils className="w-6 h-6 text-white" />
                ) : (
                  <Leaf className="w-6 h-6 text-white" />
                )}
              </div>
              <h1 className={`text-xl font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Yam Venturina</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/60 text-neutral-600 hover:bg-white shadow-sm'}`}
              >
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <div className={`flex p-1 rounded-xl transition-colors ${isDarkMode ? 'bg-white/10 border border-white/5' : 'glass-pill'}`}>
                <button 
                  onClick={() => setActiveTab('food')}
                  className={`px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'food' ? (isDarkMode ? 'bg-[#2C2C2E] text-red-500 shadow-sm' : 'bg-white text-red-600 shadow-sm') : (isDarkMode ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-400 hover:bg-black/5')}`}
                >
                  Food
                </button>
                <button 
                  onClick={() => setActiveTab('health')}
                  className={`px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'health' ? (isDarkMode ? 'bg-[#2C2C2E] text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : (isDarkMode ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-400 hover:bg-black/5')}`}
                >
                  Health & Wellness
                </button>
              </div>
            </div>
          </div>
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDarkMode ? 'text-neutral-500 group-focus-within:text-white' : 'text-neutral-400 group-focus-within:text-neutral-900'}`} />
            <input 
              type="text" 
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full backdrop-blur-md shadow-sm rounded-full py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none transition-all ${isDarkMode ? 'bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:bg-white/10' : 'bg-white/40 border border-white/60 focus:bg-white/70 placeholder:text-neutral-400'}`}
            />
          </div>
          
          {/* Franchise Filters */}
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-6 px-6 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setSelectedFranchise(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                !selectedFranchise 
                  ? `${theme.brand} text-white shadow-md` 
                  : isDarkMode ? 'bg-white/5 text-neutral-400 hover:bg-white/10 border border-white/10' : 'bg-white/40 text-neutral-500 hover:bg-white/60 border border-white/60'
              }`}
            >
              All
            </button>
            {Object.keys(CATALOG[activeTab].franchises).map(franchise => (
              <button
                key={franchise}
                onClick={() => setSelectedFranchise(franchise)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedFranchise === franchise 
                    ? `${theme.brand} text-white shadow-md` 
                    : isDarkMode ? 'bg-white/5 text-neutral-400 hover:bg-white/10 border border-white/10' : 'bg-white/40 text-neutral-500 hover:bg-white/60 border border-white/60'
                }`}
              >
                {franchise}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-36 font-sans">
        {Object.entries(filteredCatalog).length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <Search className="w-12 h-12 mx-auto mb-4" />
            <p className="font-bold">No results found</p>
          </div>
        ) : (
          Object.entries(filteredCatalog).map(([franchise, items]: [string, Product[]]) => (
            <section key={franchise} className="mb-12">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-5 ml-1">{franchise}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map((item) => (
                  <motion.div 
                    layout
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="glass-card p-3 sm:p-5 flex flex-row sm:flex-col gap-4 sm:gap-0 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image Placeholder */}
                    <div className="w-24 h-24 sm:w-full sm:h-auto sm:aspect-square shrink-0 bg-black/5 dark:bg-white/5 rounded-[14px] sm:rounded-2xl sm:mb-4 flex flex-col items-center justify-center overflow-hidden relative group-hover:shadow-inner transition-all">
                      <img 
                        src={`/${item.image || getKebabCaseName(item.name) + '.png'}`} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5" style={{ display: 'none' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent dark:from-white/5" />
                        <span className="text-neutral-400/50 dark:text-neutral-500/50 font-bold text-[8px] sm:text-xs uppercase tracking-widest mt-1 sm:mt-2 relative z-10">Image</span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col min-w-0 justify-between">
                      <div>
                        <div className="mb-1 sm:mb-2">
                          <span className={`text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border whitespace-nowrap ${theme.tag}`}>
                            {franchise.split(' ')[0]}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm leading-tight text-neutral-800 dark:text-neutral-100 line-clamp-2">{item.name}</h3>
                        <p className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5 uppercase tracking-tighter opacity-60 dark:opacity-80">{item.pack}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3 sm:mt-4 sm:pt-4 sm:border-t border-black/5 dark:border-white/5">
                        <div className={`font-mono font-black text-sm sm:text-lg tabular-nums whitespace-nowrap flex items-center gap-0.5 sm:gap-1 ${theme.text}`}>
                          <span className="text-[10px] sm:text-[12px] opacity-40 font-sans font-semibold">₱</span>
                          {item.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </div>

                        <div className="flex-shrink-0">
                          {cart[item.name] ? (
                            <div className="flex items-center gap-1 sm:gap-2 bg-neutral-100/50 dark:bg-white/5 p-1 rounded-[14px] sm:rounded-2xl border border-white dark:border-white/10">
                              <button onClick={() => updateQuantity(item.name, -1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] sm:rounded-xl flex items-center justify-center bg-white dark:bg-[#2C2C2E] shadow-sm active:scale-90 transition-transform"><Minus className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${theme.text}`} /></button>
                              <span className="w-5 sm:w-6 flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs text-neutral-800 dark:text-neutral-200">{cart[item.name].quantity}</span>
                              <button onClick={() => updateQuantity(item.name, 1)} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] sm:rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-transform ${theme.brand}`}><Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" /></button>
                            </div>
                          ) : (
                            <motion.button 
                              whileTap={{ scale: 0.94 }}
                              onClick={() => addToCart(item)}
                              className={`px-3 sm:px-4 h-8 sm:h-10 rounded-[12px] sm:rounded-[16px] flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold transition-all shadow-lg shadow-black/5 ${theme.brand} text-white hover:brightness-110 border border-white/20`}
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add
                            </motion.button>
                          )}
                        </div>
                      </div>
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
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 sm:px-6 z-50"
          >
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-[#111111]/80 backdrop-blur-3xl text-white rounded-[32px] sm:rounded-[40px] p-3 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center justify-between transition-all border border-white/20 group"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-[14px] sm:rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-left leading-tight min-w-0 pr-2">
                  <p className="text-[9px] sm:text-[11px] font-bold opacity-50 uppercase tracking-[0.2em] font-inter">Summary</p>
                  <p className="text-lg sm:text-2xl font-mono font-black mt-0.5 truncate">₱{total.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-[10px] sm:rounded-xl border border-white/5 whitespace-nowrap">
                  {totalItems} <span className="hidden sm:inline">Products</span>
                  <span className="inline sm:hidden">Items</span>
                </span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-40" /></div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Sidebar/Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className={`fixed inset-0 z-50 flex font-sans ${isDesktop ? 'justify-end' : 'flex-col items-center justify-end'}`}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md px-4"
            />
            <motion.div 
              initial={isDesktop ? { x: '100%' } : { y: '100%' }} 
              animate={isDesktop ? { x: 0 } : { y: 0 }} 
              exit={isDesktop ? { x: '100%' } : { y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 250 }}
              className={`relative w-full overflow-hidden flex flex-col bg-[#1C1C1E]/80 backdrop-blur-3xl border-white/20 text-white ${
                isDesktop 
                  ? 'max-w-[480px] h-full shadow-[-10px_0_40px_rgba(0,0,0,0.5)] border-l' 
                  : 'max-w-md h-[92vh] rounded-t-[56px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t'
              }`}
            >
              {!isDesktop && <div className="w-16 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-4 shrink-0" />}
              
              <div className={`px-10 pb-4 flex items-center justify-between shrink-0 ${isDesktop ? 'pt-8' : ''}`}>
                <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-95 shadow-sm border border-white/10 hover:bg-white/20 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-xl font-bold tracking-tight">Checkout</h2>
                <div className="w-10" />
              </div>

              <div className="flex-1 overflow-y-auto px-10 py-6 pb-40 scroll-smooth">
                {cartValues.length === 0 ? (
                  <div className="text-center py-24">
                    <Package className="w-16 h-16 mx-auto text-white/20 mb-6" />
                    <p className="font-bold text-white/40 uppercase tracking-widest text-xs mb-8">Cart is currently empty</p>
                    <button onClick={() => setIsCheckoutOpen(false)} className="bg-white text-black px-10 py-5 rounded-[24px] font-bold text-sm shadow-xl active:scale-95 transition-all">Go Back to Menu</button>
                  </div>
                ) : (
                  <>
                    <section className="mb-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-xl">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-bold uppercase text-white/40 tracking-[0.2em]">Order Summary</h3>
                        <ShoppingCart className="w-4 h-4 text-white/30" />
                      </div>
                      <div className="space-y-6">
                        {cartValues.map(item => (
                          <div key={item.name} className="flex justify-between items-center group">
                            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/5 mr-4 overflow-hidden shrink-0 hidden sm:flex items-center justify-center relative">
                              <img src={`/${item.image || getKebabCaseName(item.name) + '.png'}`} alt={item.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                            </div>
                            <div className="flex-1 pr-6">
                              <p className="font-extrabold text-sm text-white leading-tight mb-1">{item.name}</p>
                              <div className="flex items-center gap-2 font-mono tabular-nums">
                                <span className={`text-[12px] font-black text-emerald-400 tracking-tight`}>₱{item.price.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="font-mono font-black text-lg tabular-nums text-right min-w-[80px] leading-tight text-white">₱{(item.price * item.quantity).toLocaleString()}</span>
                              <div className="flex items-center gap-1.5 mt-1 border border-white/10 rounded-lg p-0.5 shadow-sm bg-white/5">
                                <button type="button" onClick={() => updateQuantity(item.name, -1)} className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 active:scale-95 transition-all">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-mono font-black text-xs w-4 text-center text-white">{item.quantity}</span>
                                <button type="button" onClick={() => updateQuantity(item.name, 1)} className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 active:scale-95 transition-all">
                                  <Plus className="w-3 h-3" />
                                </button>
                                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                                <button type="button" onClick={() => updateQuantity(item.name, -item.quantity)} className="w-6 h-6 rounded text-red-400/80 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                        <div className="flex justify-between text-xs font-bold text-white/40 uppercase tracking-widest font-mono tabular-nums">
                          <span className="font-sans">Subtotal</span>
                          <span className="text-white">₱{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-white/40 uppercase tracking-widest font-mono tabular-nums">
                          <span className="font-sans">Delivery</span>
                          <span className="text-white">₱{deliveryFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-white pt-4 font-mono tabular-nums border-t border-dashed border-white/20 mt-2">
                          <span className="font-sans font-bold">Total</span>
                          <span>₱{total.toLocaleString()}</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl flex gap-3 mt-6 border border-white/5">
                          <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <p className="text-[10px] text-white/60 italic font-bold leading-relaxed">Yam Venturina will contact you to verify final delivery costs.</p>
                        </div>
                      </div>
                    </section>

                    <form onSubmit={handleSubmit} className="space-y-12">
                      <section>
                        <h3 className="text-[10px] font-bold uppercase mb-6 text-white/40 tracking-[0.2em]">Personal Information</h3>
                        <div className="space-y-4">
                          {[
                            { id: 'fullName', type: 'text', placeholder: 'Full Name', icon: User, required: true },
                            { id: 'mobile', type: 'text', placeholder: '09XX XXX XXXX', icon: Phone, onChange: handleMobileChange, required: true },
                            { id: 'fbName', type: 'text', placeholder: 'Messenger Name (Optional)', icon: Facebook, required: false },
                            { id: 'email', type: 'email', placeholder: 'Email Address (Optional)', icon: Mail, required: false }
                          ].map((field) => (
                            <div key={field.id} className="relative group">
                              <field.icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
                              <input 
                                required={field.required}
                                type={field.type} 
                                placeholder={field.placeholder} 
                                className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[24px] py-4.5 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none text-white placeholder:text-white/30 transition-all shadow-inner"
                                value={(formData as any)[field.id]} 
                                onChange={field.onChange || (e => setFormData({ ...formData, [field.id]: e.target.value }))}
                              />
                            </div>
                          ))}
                          
                          <div className="space-y-4 pt-4">
                            <h4 className="text-[10px] font-bold uppercase text-white/40 tracking-[0.1em] ml-2">Delivery</h4>
                            
                            {!canPickup && (
                              <div className="flex items-center gap-4 p-4 bg-black/20 backdrop-blur-md rounded-2xl mb-2 border border-white/5">
                                <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Free Pickup at Paragon Lobby Minimum Order Php 800</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => setFormData({...formData, deliveryOption: formData.address.region})} 
                                className={`flex-1 py-4 rounded-[20px] font-bold text-sm border transition-all ${formData.deliveryOption !== 'Pickup' ? 'bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                              >
                                Delivery
                              </button>
                              {canPickup && (
                                <button 
                                  type="button" 
                                  onClick={() => setFormData({...formData, deliveryOption: 'Pickup'})} 
                                  className={`flex-1 py-4 rounded-[20px] font-bold text-sm border transition-all ${formData.deliveryOption === 'Pickup' ? 'bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                                >
                                  Pickup
                                </button>
                              )}
                            </div>

                            {formData.deliveryOption === 'Pickup' ? (
                              <div className="mt-4 p-5 bg-black/20 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-between shadow-inner">
                                <div className="flex items-center gap-4">
                                  <MapPin className="w-5 h-5 text-emerald-500" />
                                  <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-relaxed">Paragon Plaza<br/><span className="text-white/40">Condominium Lobby</span></p>
                                </div>
                                <span className="font-mono font-black text-emerald-400">FREE</span>
                              </div>
                            ) : (
                              <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="relative group">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors z-10" />
                                    <select 
                                      className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[24px] py-4.5 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none text-white appearance-none"
                                      value={formData.address.region}
                                      onChange={e => setFormData({ ...formData, address: { ...formData.address, region: e.target.value }, deliveryOption: e.target.value })}
                                    >
                                      <option value="Luzon">Luzon</option>
                                      <option value="Visayas">Visayas</option>
                                      <option value="Mindanao">Mindanao</option>
                                    </select>
                                  </div>
                                  <div className="relative group">
                                    <input 
                                      required
                                      type="text"
                                      placeholder="Province"
                                      className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[24px] py-4.5 px-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none text-white placeholder:text-white/30 transition-all shadow-inner"
                                      value={formData.address.province}
                                      onChange={e => setFormData({ ...formData, address: { ...formData.address, province: e.target.value } })}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                  <input 
                                    required
                                    type="text"
                                    placeholder="City / Municipality"
                                    className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[24px] py-4.5 px-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none text-white placeholder:text-white/30 transition-all shadow-inner"
                                    value={formData.address.city}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                  />
                                </div>
                                <div className="grid grid-cols-[1fr_120px] gap-4">
                                  <input 
                                    required
                                    type="text"
                                    placeholder="Barangay / Street / House No."
                                    className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[24px] py-4.5 px-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none text-white placeholder:text-white/30 transition-all shadow-inner"
                                    value={formData.address.street} 
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                  />
                                  <input 
                                    type="text"
                                    placeholder="ZIP (Optional)"
                                    className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[24px] py-4.5 px-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none text-white placeholder:text-white/30 transition-all shadow-inner"
                                    value={formData.address.zip} 
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, zip: e.target.value } })}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="relative group pt-4">
                            <StickyNote className="absolute left-5 top-5 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
                            <textarea 
                              placeholder="Notes for shipping (Optional)..." 
                              className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[28px] py-5 pl-14 pr-6 text-sm font-bold min-h-[100px] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none resize-none transition-all shadow-inner text-white placeholder:text-white/30"
                              value={formData.notes} 
                              onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                          </div>
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <h3 className="text-[10px] font-bold uppercase text-white/40 tracking-[0.2em] mb-0">Payment Method</h3>
                          <div className="group relative z-20 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-emerald-400 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-[#2C2C2E] border border-white/10 text-white text-[10px] font-bold p-5 rounded-3xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 origin-bottom leading-relaxed z-50">
                              <span className="block text-emerald-400 mb-2 text-xs">💡 Quick Tip</span>
                              Select a payment method to view and scan our QR Codes for faster transactions. Don't forget to take a screenshot of your transfer!
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-[#2C2C2E]" />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {Object.entries(PAYMENT_METHODS).map(([method, data]) => (
                            <div key={method} className="flex flex-col gap-4">
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                className={`flex flex-col p-6 rounded-[32px] border transition-all text-sm text-left ${formData.paymentMethod === method ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]' : 'bg-black/20 backdrop-blur-md border-white/10 text-white shadow-inner hover:bg-white/5'}`}
                              >
                                <div className="flex items-center gap-4 mb-3">
                                  <CreditCard className={`w-5 h-5 ${formData.paymentMethod === method ? 'text-black/60' : 'text-white/40'}`} />
                                  <span className="font-bold uppercase tracking-[0.2em]">{method}</span>
                                </div>
                                <div className={`flex flex-col items-start pl-9 text-[10px] gap-1 ${formData.paymentMethod === method ? 'text-black/80' : 'text-white/60'}`}>
                                  <p className="font-bold italic">{data.name}</p>
                                  <p className="font-mono font-bold underline underline-offset-4 decoration-current">{data.details}</p>
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
                                    <div className="bg-black/20 backdrop-blur-md p-8 rounded-[40px] border border-white/5 flex flex-col items-center justify-center gap-6 shadow-inner mb-4">
                                      <div className="relative group">
                                        <div className="absolute -inset-4 bg-white/5 rounded-[48px] -z-10 group-hover:bg-white/10 transition-colors" />
                                          <div 
                                            className="w-full aspect-square max-w-[200px] mx-auto bg-white rounded-3xl flex items-center justify-center border-4 border-white shadow-xl overflow-hidden relative cursor-zoom-in group/qr-image"
                                            onClick={() => setSelectedQR({ method, qr: (data as any).qr })}
                                          >
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr-image:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-[2px]">
                                              <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-full border border-white/20">🔍 Enlarge</span>
                                            </div>
                                             <img 
                                               src={(data as any).qr} 
                                               alt={`${method} QR Code`}
                                               className="w-full h-full object-contain p-0"
                                               referrerPolicy="no-referrer"
                                             />
                                          </div>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Scan with {method} app</p>
                                        <div className="flex flex-col items-center gap-4">
                                          <p className="font-mono font-bold text-xs text-white">{data.details}</p>
                                          <div className="flex gap-2">
                                            <button 
                                              type="button"
                                              onClick={() => setSelectedQR({ method, qr: (data as any).qr })}
                                              className="text-[9px] font-bold uppercase tracking-wider px-4 py-2 bg-white/5 text-white rounded-full border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                                            >
                                              <Search className="w-3 h-3" /> View Large
                                            </button>
                                            <a 
                                              href={(data as any).qr} 
                                              download={`${method}-QR.png`}
                                              onClick={(e) => {}}
                                              className="text-[9px] font-bold uppercase tracking-wider px-4 py-2 bg-emerald-500 text-black rounded-full hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
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

                      <div className="bg-white/5 backdrop-blur-xl text-white p-8 rounded-[48px] shadow-xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />
                        <h4 className="text-xs font-bold uppercase tracking-[0.3em] mb-6 text-red-500">Procedure</h4>
                        <ol className="space-y-6">
                          {[
                            "Transfer payment & take a Screenshot.",
                            "Click the 'Submit Order' button below.",
                            "Copy the generated Order Summary text.",
                            "Send the text & screenshot to Yam via Messenger or WhatsApp."
                          ].map((step, i) => (
                            <li key={i} className="flex gap-5 text-xs font-bold leading-relaxed group-hover:translate-x-1 transition-transform">
                              <span className="w-6 h-6 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-emerald-400">{i+1}</span>
                              <span className="opacity-80 group-hover:opacity-100 transition-opacity">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <button type="submit" className="w-full bg-emerald-500 text-black rounded-[32px] py-7 font-bold text-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 transition-all mb-16 border border-emerald-400 ring-4 ring-emerald-500/20 hover:bg-emerald-400">Submit Order</button>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#1C1C1E]/80 backdrop-blur-3xl rounded-[56px] w-full max-w-md p-8 md:p-12 flex flex-col items-center text-center shadow-2xl relative border border-white/10 my-10"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border-4 border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white tracking-tight">Order Saved</h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-8 leading-relaxed">Summary copied to clipboard. Send it to Yam with your payment screenshot.</p>
              
              <div className="w-full bg-black/20 backdrop-blur-md rounded-[32px] p-6 mb-8 border border-white/5 text-left shadow-inner">
                <h3 className="text-[10px] font-bold uppercase text-white/40 mb-4 tracking-[0.2em] flex items-center gap-2"><ShoppingCart className="w-3 h-3" /> Order Summary</h3>
                <div className="space-y-3 mb-6">
                  {cartValues.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm font-bold gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 overflow-hidden shrink-0 flex items-center justify-center relative">
                        <img src={`/${item.image || getKebabCaseName(item.name) + '.png'}`} alt={item.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                      </div>
                      <span className="text-white/80 flex-1 min-w-0 truncate">{item.quantity}x {item.name}</span>
                      <span className="font-mono text-emerald-400 shrink-0">₱{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-white/40 font-mono">
                    <span className="font-sans uppercase tracking-[0.1em]">Subtotal</span>
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-white/40 font-mono">
                    <span className="font-sans uppercase tracking-[0.1em]">Delivery</span>
                    <span>₱{deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-black text-white pt-2 font-mono">
                    <span className="font-sans uppercase tracking-[0.1em] text-sm">Total</span>
                    <span>₱{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generateOrderText());
                    showToast('Summary Re-copied');
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 text-xs active:scale-[0.98] transition-all shadow-sm"
                >
                  <Copy className="w-4 h-4" /> Copy Order Text
                </button>
                <div className="grid grid-cols-1 gap-3">
                  <a 
                    href="https://m.me/61582492107190" 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={() => {
                      navigator.clipboard.writeText(generateOrderText());
                      showToast('Order copied! Paste it in Messenger.');
                    }}
                    className="w-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 text-[#1877F2] py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-xs"
                  >
                    <Facebook className="w-5 h-5" /> Message on Facebook
                  </a>
                  <a 
                    href={`https://wa.me/639615078790?text=${encodeURIComponent(generateOrderText())}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-xs"
                  >
                    <MessageCircle className="w-5 h-5" /> Send via WhatsApp
                  </a>
                </div>
              </div>

              <button 
                onClick={() => {
                  setCart({});
                  setIsSuccess(false);
                  setFormData({ fullName: '', mobile: '', fbName: '', email: '', address: { region: 'Luzon', provinceCode: '', province: '', cityCode: '', city: '', street: '', zip: '' }, notes: '', deliveryOption: 'Luzon', paymentMethod: 'GCash' });
                }}
                className="mt-10 bg-emerald-500 text-black px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                Place Another Order
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

              <div className="w-full max-w-sm mx-auto aspect-square bg-white rounded-3xl border-4 border-neutral-100 shadow-xl flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedQR.qr} 
                  alt="Full Size QR"
                  className="w-full h-full object-contain p-0"
                  referrerPolicy="no-referrer"
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
