import React, { useState, useMemo, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Package, TruckIcon, Warehouse, ChefHat, AlertTriangle, TrendingUp,
  Wallet, Mail, LayoutDashboard, Plus, Trash2, Pencil, X, Check,
  ChevronDown, Settings as SettingsIcon, GlassWater, Martini, UtensilsCrossed, ClipboardList, Menu, Repeat, Printer
} from "lucide-react";

/* ---------------------------------------------------------
   DESIGN TOKENS
   paper cream #FAF6EF | ink #262220 | paprika #9C3B2E (primary)
   sage #5C7A5C (positive/stock) | amber #C08A28 (warning)
   slate #2B2622 (sidebar) | line #DDD3C4 (hairline)
   Display: Oswald (kitchen signage) | Body: IBM Plex Sans | Data: IBM Plex Mono
--------------------------------------------------------- */

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const COLORS = {
  paper: "#FAF6EF",
  paperDim: "#F1EAE0",
  ink: "#262220",
  inkSoft: "#5C554E",
  paprika: "#9C3B2E",
  paprikaDeep: "#7A2E24",
  sage: "#5C7A5C",
  amber: "#C08A28",
  slate: "#2B2622",
  slateSoft: "#3A342E",
  line: "#DDD3C4",
};

const CHART_COLORS = ["#9C3B2E", "#C08A28", "#5C7A5C", "#7C8CA8", "#B5654F"];

/* ---------------------------------------------------------
   SAMPLE DATA
--------------------------------------------------------- */

let BRANCHES = ["All Branches", "Gachibowli"];

const VENDORS = [];

const ITEMS = [
  { name: "Basmati Rice", unit: "kg" },
  { name: "Chicken", unit: "kg" },
  { name: "Refined Oil", unit: "ltr" },
  { name: "Paneer", unit: "kg" },
  { name: "Onions", unit: "kg" },
  { name: "Tomatoes", unit: "kg" },
  { name: "Garam Masala", unit: "kg" },
  { name: "Milk", unit: "ltr" },
  { name: "Mutton", unit: "kg" },
  { name: "Ghee", unit: "kg" },
];

const PAY_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque"];

function seedPurchases() {
  return [];
}

function seedStock() {
  return [];
}

let DISHES = [];

const ITEM_COST = { "Basmati Rice": 85, "Chicken": 220, "Refined Oil": 140, "Paneer": 340, "Onions": 35, "Tomatoes": 40, "Garam Masala": 900, "Milk": 58, "Mutton": 620, "Ghee": 620 };

// Real catalog imported from Tanah Kitchen & Bar Item_Master sheet (274 items)
const REAL_ITEM_MASTER = [
  { name: "Basmati Rice Bag 30kg", department: "Kitchen", category: "Grains & Pulses", unit: "Bags", cost: 122.0, supplier: "" },
  { name: "Staff Rice bags 26kg", department: "Kitchen", category: "Grains & Pulses", unit: "Bags", cost: 58.0, supplier: "" },
  { name: "Tata salt iodine bags", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Packets", cost: 31.0, supplier: "" },
  { name: "Shalimar Maida", department: "Kitchen", category: "Grains & Pulses", unit: "Kg", cost: 45.0, supplier: "" },
  { name: "Shalimar Atta", department: "Kitchen", category: "Grains & Pulses", unit: "Kg", cost: 41.0, supplier: "" },
  { name: "Corn Starch", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 0, supplier: "" },
  { name: "Nacho Chips", department: "Kitchen", category: "Snacks & Misc", unit: "Packets", cost: 81.0, supplier: "" },
  { name: "Gold Drop Refined oil", department: "Kitchen", category: "Oils & Fats", unit: "Packets", cost: 0, supplier: "" },
  { name: "White Crystal Sugar", department: "Kitchen", category: "Sweeteners & Baking", unit: "Packets", cost: 0, supplier: "" },
  { name: "Chaokoh Coconut milk", department: "Kitchen", category: "Coconut & Related", unit: "Cans", cost: 349.0, supplier: "" },
  { name: "Madras Curry Powder", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Cans", cost: 395.0, supplier: "" },
  { name: "Tom Yum Soup Paste", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 774.0, supplier: "" },
  { name: "Red Curry Paste", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Green Curry Paste", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 594.0, supplier: "" },
  { name: "Premium Dark Soy Sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 299.0, supplier: "" },
  { name: "Premium Light Soy Sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Golden Sweet Corn", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Cans", cost: 67.0, supplier: "" },
  { name: "Agar china grass powder", department: "Kitchen", category: "Powders & Spices", unit: "Cans", cost: 0, supplier: "" },
  { name: "U. S Mustard", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 240.0, supplier: "" },
  { name: "Virago Paprika Powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 1000.0, supplier: "" },
  { name: "Bellam (jaggery)", department: "Kitchen", category: "Sweeteners & Baking", unit: "Packets", cost: 0, supplier: "" },
  { name: "Golden Tomato Puree", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Tins", cost: 126.0, supplier: "" },
  { name: "Mustard sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 187.0, supplier: "" },
  { name: "Morde(milk Compound)", department: "Kitchen", category: "Sweeteners & Baking", unit: "Packets", cost: 180.0, supplier: "" },
  { name: "Morde(White Compound)", department: "Kitchen", category: "Sweeteners & Baking", unit: "Packets", cost: 197.0, supplier: "" },
  { name: "Morde(Dark Compound)", department: "Kitchen", category: "Sweeteners & Baking", unit: "Packets", cost: 199.0, supplier: "" },
  { name: "Tomato Ketchup", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Packets", cost: 150.0, supplier: "" },
  { name: "Dry Coconut", department: "Kitchen", category: "Coconut & Related", unit: "Bags", cost: 0, supplier: "" },
  { name: "Imili (tamarind pulp)", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bags", cost: 0, supplier: "" },
  { name: "Papad (fryums)", department: "Kitchen", category: "Snacks & Misc", unit: "Bags", cost: 500.0, supplier: "" },
  { name: "Roasted chenna", department: "Kitchen", category: "Grains & Pulses", unit: "Packets", cost: 70.0, supplier: "" },
  { name: "Papads", department: "Kitchen", category: "Snacks & Misc", unit: "Packets", cost: 0, supplier: "" },
  { name: "Gelatin Powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 1500.0, supplier: "" },
  { name: "Baking soda", department: "Kitchen", category: "Powders & Spices", unit: "Bottles", cost: 36.0, supplier: "" },
  { name: "Mango Pulp", department: "Kitchen", category: "Sweeteners & Baking", unit: "Tins", cost: 0, supplier: "" },
  { name: "Angel Instant Dry Yeast", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 210.0, supplier: "" },
  { name: "Chilli Powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 210.0, supplier: "" },
  { name: "Coriander Powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 155.0, supplier: "" },
  { name: "Turmeric Powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 140.0, supplier: "" },
  { name: "Breakfast Sugar", department: "Kitchen", category: "Sweeteners & Baking", unit: "Packets", cost: 100.0, supplier: "" },
  { name: "Kaju 1/2", department: "Kitchen", category: "Grains & Pulses", unit: "Packets", cost: 0, supplier: "" },
  { name: "Special Chilli powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 0, supplier: "" },
  { name: "Kasuri Methi", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 450.0, supplier: "" },
  { name: "Black Elachi", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 2000.0, supplier: "" },
  { name: "Biryani Leaves", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 270.0, supplier: "" },
  { name: "Lavanga (cloves)", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 0, supplier: "" },
  { name: "Marati Muga", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 800.0, supplier: "" },
  { name: "Dalchini (cinnamon)", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 0, supplier: "" },
  { name: "Japatri (mace)", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 2500.0, supplier: "" },
  { name: "Star (star anise)", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 0, supplier: "" },
  { name: "Jaipal (nutmeg)", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 995.0, supplier: "" },
  { name: "Jeera (cumin)", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 675.0, supplier: "" },
  { name: "Tea powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 0, supplier: "" },
  { name: "Nescafe Coffee Powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 1800.0, supplier: "" },
  { name: "Menthulu (fenugreek seeds)", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 175.0, supplier: "" },
  { name: "Green Elachi", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 0, supplier: "" },
  { name: "Dry Ginger(sonti)", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 930.0, supplier: "" },
  { name: "MDH Deggi Mirch 200gm", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 198.05, supplier: "" },
  { name: "MDH Kashmiri Mirch 200gm", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 198.05, supplier: "" },
  { name: "Amchur Powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 89.0, supplier: "" },
  { name: "R- Pure mirchi powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 120.0, supplier: "" },
  { name: "Chumki Chat Masala", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 94.0, supplier: "" },
  { name: "Minapappu", department: "Kitchen", category: "Grains & Pulses", unit: "Packets", cost: 0, supplier: "" },
  { name: "Dry dates", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Packets", cost: 0, supplier: "" },
  { name: "Coconut powder", department: "Kitchen", category: "Coconut & Related", unit: "Packets", cost: 450.0, supplier: "" },
  { name: "Javitri", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 850.0, supplier: "" },
  { name: "Kalapasi leaves", department: "Kitchen", category: "Powders & Spices", unit: "Box", cost: 0, supplier: "" },
  { name: "DosaPappu", department: "Kitchen", category: "Grains & Pulses", unit: "Packets", cost: 999.0, supplier: "" },
  { name: "Black Salt", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Packets", cost: 90.0, supplier: "" },
  { name: "Gram Flour Beasn", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 130.0, supplier: "" },
  { name: "Ragi Flour", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 50.0, supplier: "" },
  { name: "Potato Strach", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 300.0, supplier: "" },
  { name: "Rice Stick (How How) 5mm", department: "Kitchen", category: "Noodles & Pasta", unit: "Packets", cost: 0, supplier: "" },
  { name: "Walnuts", department: "Kitchen", category: "Grains & Pulses", unit: "Packets", cost: 699.0, supplier: "" },
  { name: "Yoka Wheat Strach", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 200.0, supplier: "" },
  { name: "Tempura Batter Mix", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 925.0, supplier: "" },
  { name: "Pomace Olive oil", department: "Kitchen", category: "Oils & Fats", unit: "Bottles", cost: 1000.0, supplier: "" },
  { name: "extra Virgin Olive oil", department: "Kitchen", category: "Oils & Fats", unit: "Bottles", cost: 1799.0, supplier: "" },
  { name: "Toasted Sesame Seed oil", department: "Kitchen", category: "Oils & Fats", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Salad Avon Oil", department: "Kitchen", category: "Oils & Fats", unit: "Bottles", cost: 70.0, supplier: "" },
  { name: "Sriraja Panich Chili Sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Spaghetti Food Craft", department: "Kitchen", category: "Noodles & Pasta", unit: "Packets", cost: 178.0, supplier: "" },
  { name: "Chifferi Rigati", department: "Kitchen", category: "Noodles & Pasta", unit: "Packets", cost: 196.0, supplier: "" },
  { name: "Hakka Noodles dry noodles", department: "Kitchen", category: "Noodles & Pasta", unit: "Packets", cost: 140.0, supplier: "" },
  { name: "Penne rigate", department: "Kitchen", category: "Noodles & Pasta", unit: "Packets", cost: 196.0, supplier: "" },
  { name: "Oyster Sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Tins", cost: 1010.0, supplier: "" },
  { name: "Sriracha Sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Green chilli sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 84.0, supplier: "" },
  { name: "Chilli sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 84.0, supplier: "" },
  { name: "sYNTHetic vinegar", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 80.0, supplier: "" },
  { name: "Baking powder", department: "Kitchen", category: "Powders & Spices", unit: "Bottles", cost: 38.0, supplier: "" },
  { name: "Piri Piri marinade", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Packets", cost: 550.0, supplier: "" },
  { name: "Oregano Spice sprinkler", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 420.0, supplier: "" },
  { name: "herbs & Spices", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 370.0, supplier: "" },
  { name: "Zatar powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 0, supplier: "" },
  { name: "Piri Piri sprinkler", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 317.0, supplier: "" },
  { name: "Chicken Seasoning Powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 325.0, supplier: "" },
  { name: "Demi Glace Sauce Powder", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Packets", cost: 300.0, supplier: "" },
  { name: "Knorr Veg Aromat Seasoning Powder", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 220.0, supplier: "" },
  { name: "White Chinese Pepper Masala", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 250.0, supplier: "" },
  { name: "Black Chinese Pepper Masala", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 250.0, supplier: "" },
  { name: "Milk maid (condensed milk)", department: "Kitchen", category: "Sweeteners & Baking", unit: "Tins", cost: 347.0, supplier: "" },
  { name: "Sliced Jalapeno", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Tins", cost: 450.0, supplier: "" },
  { name: "Black Olives Slices", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Green Olives Slices", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Tins", cost: 1300.0, supplier: "" },
  { name: "Pickled Green Jalapeno", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Tins", cost: 0, supplier: "" },
  { name: "Peeled Tomatoes", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Tins", cost: 600.0, supplier: "" },
  { name: "Lime Seasoning (lemon salt)", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Packets", cost: 245.0, supplier: "" },
  { name: "pepper sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 269.0, supplier: "" },
  { name: "Pancake syrup", department: "Kitchen", category: "Sweeteners & Baking", unit: "Bottles", cost: 799.0, supplier: "" },
  { name: "Water chestnuts", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Tins", cost: 250.0, supplier: "" },
  { name: "Lady finger biscuits", department: "Kitchen", category: "Snacks & Misc", unit: "Packets", cost: 250.0, supplier: "" },
  { name: "Dabuer Honey", department: "Kitchen", category: "Sweeteners & Baking", unit: "Bottles", cost: 399.0, supplier: "" },
  { name: "Black Olives Slices ib brine", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Bottles", cost: 249.0, supplier: "" },
  { name: "Green Olives Sliced in brain", department: "Kitchen", category: "Preserved Vegetables & Fruits", unit: "Bottles", cost: 249.0, supplier: "" },
  { name: "Agave Syrup", department: "Kitchen", category: "Sweeteners & Baking", unit: "Bottles", cost: 612.0, supplier: "" },
  { name: "panko(Bread crumbs )", department: "Kitchen", category: "Snacks & Misc", unit: "Packets", cost: 250.0, supplier: "" },
  { name: "Custard Vanilla Powder", department: "Kitchen", category: "Sweeteners & Baking", unit: "Packets", cost: 263.0, supplier: "" },
  { name: "BBQ sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 304.0, supplier: "" },
  { name: "Artificial Vanilla Flavour", department: "Kitchen", category: "Sweeteners & Baking", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Vinegar Apple Cider", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Synthetic vinegar (white)", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 72.0, supplier: "" },
  { name: "Sweet Chilli Sauce", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 396.0, supplier: "" },
  { name: "Like mochi", department: "Kitchen", category: "Snacks & Misc", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Andrea Milano white wine vinegar", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 350.0, supplier: "" },
  { name: "Andrea Milano red wine vinegar", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 350.0, supplier: "" },
  { name: "Andrea Milano Balsamic vinegar", department: "Kitchen", category: "Sauces, Pastes & Condiments", unit: "Bottles", cost: 400.0, supplier: "" },
  { name: "Kandipappu", department: "Kitchen", category: "Grains & Pulses", unit: "Bags", cost: 122.0, supplier: "" },
  { name: "Moongdal", department: "Kitchen", category: "Grains & Pulses", unit: "Bags", cost: 0, supplier: "" },
  { name: "Rose Water", department: "Kitchen", category: "Oils & Fats", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Kero Water", department: "Kitchen", category: "Oils & Fats", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Monin Triple sec 700ml", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 614.25, supplier: "" },
  { name: "Monin Bleu Curacao 700ml", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 614.25, supplier: "" },
  { name: "Monin Cinnamon", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 1055.0, supplier: "" },
  { name: "Monin Caramel", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 1055.0, supplier: "" },
  { name: "Monin Raspberry Puree", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 1495.0, supplier: "" },
  { name: "Monin Rose", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 939.0, supplier: "" },
  { name: "Monin Banana Puree", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 1595.0, supplier: "" },
  { name: "Monin FruitMix Raspberry Puree 1ltr", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 1232.7, supplier: "" },
  { name: "Monin Passion Fruit Puree", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 1595.0, supplier: "" },
  { name: "Monin Watermelon 1ltr", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 703.5, supplier: "" },
  { name: "Monin Elder flower 1ltr", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 703.5, supplier: "" },
  { name: "Morton Lemon squash", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 139.0, supplier: "" },
  { name: "Monin Mojito Mint 1ltr", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 703.5, supplier: "" },
  { name: "Monin Coconut", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 939.0, supplier: "" },
  { name: "Monin Passion fruit syrup", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 939.0, supplier: "" },
  { name: "Monin Almond", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 0, supplier: "" },
  { name: "Monin Peach", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 939.0, supplier: "" },
  { name: "Monin Basil", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 585.0, supplier: "" },
  { name: "Monin Coffee", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 955.0, supplier: "" },
  { name: "Monin Grenadine 1ltr", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 703.5, supplier: "" },
  { name: "Monin Vanilla 1ltr", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 703.5, supplier: "" },
  { name: "Monin Lavender 1ltr", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 703.5, supplier: "" },
  { name: "Monin Agave", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 2039.0, supplier: "" },
  { name: "Monin Hazelnut 1ltr", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 703.5, supplier: "" },
  { name: "Monin Pink Grape fruit", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 939.0, supplier: "" },
  { name: "Mala's Blueberry Crush", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 430.0, supplier: "" },
  { name: "Mala's Kiwi Crush", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 325.0, supplier: "" },
  { name: "Mala's Mango Crush", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 240.0, supplier: "" },
  { name: "Mala's Strawberry Crush", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 240.0, supplier: "" },
  { name: "Mala's Pineapple Crush", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 240.0, supplier: "" },
  { name: "Mala's Orange Crush", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 240.0, supplier: "" },
  { name: "Dabur Real Active Coconut Water 200ml", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 23.1, supplier: "" },
  { name: "Real Litchi Juice", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 120.0, supplier: "" },
  { name: "Dabur Real Apple Juice 1Ltr", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 83.81, supplier: "" },
  { name: "Dabur Real Guava Juice", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 91.99, supplier: "" },
  { name: "Dabur Real Cranberry Juice", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 112.0, supplier: "" },
  { name: "Real Pineapple Juice", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 135.0, supplier: "" },
  { name: "Real Mango Juice", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 110.0, supplier: "" },
  { name: "Dabur Real orange juice", department: "Bar", category: "Beverages & Syrups", unit: "Bottles", cost: 102.44, supplier: "" },
  { name: "RedBull", department: "Bar", category: "Beverages & Syrups", unit: "Tins", cost: 125.0, supplier: "" },
  { name: "Scheweppes Tonic water", department: "Bar", category: "Beverages & Syrups", unit: "Tins", cost: 60.0, supplier: "" },
  { name: "Britannia Marie Gold Family Pack Biscuits", department: "Bar", category: "Snacks & Misc", unit: "Packets", cost: 0, supplier: "" },
  { name: "KitKat", department: "Bar", category: "Snacks & Misc", unit: "Packets", cost: 0, supplier: "" },
  { name: "Gold wraps Foils", department: "Kitchen", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Paper straws", department: "Bar", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Sipper Glass for beverages", department: "Bar", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Containers 250ml", department: "Kitchen", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Billing Rolls", department: "Office Items", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Steel Scrubbers", department: "Stationery Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Spong Scrubbers", department: "Stationery Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Indent Big Books", department: "Office Items", category: "Utility Items", unit: "Book's", cost: 0, supplier: "" },
  { name: "Tooth Picks", department: "Kitchen", category: "Utility Items", unit: "Boxes", cost: 0, supplier: "" },
  { name: "Ice sticks", department: "Kitchen", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Wooden Ezee Bamboo big Skewers", department: "Bar", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Wooden Purely Natural Bamboo small Skewers", department: "Bar", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Wooden Sticks", department: "Bar", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Key tag Names", department: "Office Items", category: "Utility Items", unit: "Items", cost: 0, supplier: "" },
  { name: "Pens", department: "Office Items", category: "Utility Items", unit: "Boxes", cost: 0, supplier: "" },
  { name: "Kot Books", department: "Office Items", category: "Utility Items", unit: "Books", cost: 0, supplier: "" },
  { name: "Permanent Markers Black colour", department: "Office Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Binder Clip 32mm", department: "Office Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Staplers Pins 1M", department: "Office Items", category: "Utility Items", unit: "Boxes", cost: 0, supplier: "" },
  { name: "Staplers Pins No.10 1M", department: "Office Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Kangaro Punch", department: "Office Items", category: "Utility Items", unit: "Pcs", cost: 0, supplier: "" },
  { name: "Sharpner", department: "Office Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Eraser", department: "Office Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Multi colour sticky notes", department: "Office Items", category: "Utility Items", unit: "Packet", cost: 0, supplier: "" },
  { name: "Plaster", department: "Stationery Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Reservation Books", department: "Office Items", category: "Utility Items", unit: "Books", cost: 0, supplier: "" },
  { name: "Sheet Protectors", department: "Office Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Name Labels", department: "Office Items", category: "Utility Items", unit: "Strickers", cost: 0, supplier: "" },
  { name: "Office attendance", department: "Office Items", category: "Utility Items", unit: "Books", cost: 0, supplier: "" },
  { name: "Carbon Papers", department: "Office Items", category: "Utility Items", unit: "Papers", cost: 0, supplier: "" },
  { name: "Ball pens", department: "Office Items", category: "Utility Items", unit: "Pens", cost: 20.0, supplier: "" },
  { name: "Jk Bond Papers", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "Long Note books", department: "Office Items", category: "Utility Items", unit: "Books", cost: 0, supplier: "" },
  { name: "A4 size", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "Big files", department: "Office Items", category: "Utility Items", unit: "Files", cost: 0, supplier: "" },
  { name: "Lemon Grass Sticks", department: "Office Items", category: "Utility Items", unit: "boxes", cost: 0, supplier: "" },
  { name: "Odonil Room Spray", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Urnial Screen", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Odofree Sanitary Cubes", department: "House Keeping", category: "Utility Items", unit: "Box", cost: 0, supplier: "" },
  { name: "Hand Gloves", department: "House Keeping", category: "Utility Items", unit: "Box", cost: 0, supplier: "" },
  { name: "Rat pads", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Approns", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Kitchen Clothes", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Hand Clothes", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Handle Brush", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Floor Scrubber", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Floor Brushes", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Hand Wash", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Floor Cleaner", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Furniture Maintainer", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Air Fresher", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Hard Surface Cleaner", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Acid", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Machine Washing Liquid", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Dish Wash Liquid", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Bathroom Cleaner", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Toilet Bowl Cleaner", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Phenyl", department: "House Keeping", category: "Utility Items", unit: "Cans", cost: 0, supplier: "" },
  { name: "Pithambari", department: "House Keeping", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Wheel Surf's", department: "House Keeping", category: "Utility Items", unit: "Packets", cost: 0, supplier: "" },
  { name: "Floor Clening Wipers Cloth", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Floor Wiper", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Floor Mop", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Chipiri", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Coconut Chipiri", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Casting Soda", department: "House Keeping", category: "Utility Items", unit: "Kg", cost: 0, supplier: "" },
  { name: "Kitchen Wipers Small", department: "House Keeping", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Staff Signature Registers", department: "Office Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Mask", department: "Office Items", category: "Utility Items", unit: "Pieces", cost: 0, supplier: "" },
  { name: "Parcel Covers 16*20", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "Parcel Covers 13*16", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "Silver Parcel Covers 8*10", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "Silver Parcel Covers 5*7", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "Silver Parcel Covers 6*8", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "Raw Material Bags 13*19", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "Raw Material Bags 7*11", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "1000ml Containers", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "500ml Containers", department: "Office Items", category: "Utility Items", unit: "Bundles", cost: 0, supplier: "" },
  { name: "Tissues", department: "Office Items", category: "Utility Items", unit: "Corton", cost: 0, supplier: "" },
  { name: "M fold Tissue", department: "Office Items", category: "Utility Items", unit: "Box", cost: 0, supplier: "" },
  { name: "Pizza Flour", department: "Kitchen", category: "Powders & Spices", unit: "Packets", cost: 0, supplier: "" },
  { name: "Jasmine Rice", department: "Kitchen", category: "Grains & Pulses", unit: "Packets", cost: 1000.0, supplier: "" },
  { name: "Fillo Pastry", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 475.0, supplier: "" },
  { name: "Kunafa Dough Switz", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 500.0, supplier: "" },
  { name: "Cheddar Cheese yellow", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 1075.0, supplier: "" },
  { name: "Butter Scotch Ice Cream", department: "Kitchen", category: "Frozen Items", unit: "Boxes", cost: 210.0, supplier: "" },
  { name: "Mascarpone Rich & Creamy", department: "Kitchen", category: "Frozen Items", unit: "Boxes", cost: 883.0, supplier: "" },
  { name: "Cream Cheese Dlecta", department: "Kitchen", category: "Frozen Items", unit: "Boxes", cost: 850.0, supplier: "" },
  { name: "Amul Cheese 50 Slices", department: "Kitchen", category: "Frozen Items", unit: "Packet", cost: 440.0, supplier: "" },
  { name: "Amul Butter Salted", department: "Kitchen", category: "Frozen Items", unit: "Packet", cost: 310.0, supplier: "" },
  { name: "Amul Butter UnSalted", department: "Kitchen", category: "Frozen Items", unit: "Packet", cost: 300.0, supplier: "" },
  { name: "Amul Cheese 1kg Block", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 565.0, supplier: "" },
  { name: "BlueBerries", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 1150.0, supplier: "" },
  { name: "Sweet Corn", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 265.0, supplier: "" },
  { name: "Star Whip Cream", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 240.0, supplier: "" },
  { name: "Amul Pizza Cheese", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 550.0, supplier: "" },
  { name: "Jhon Pizza Cheese", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 586.0, supplier: "" },
  { name: "President Unsalted Butter", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 326.0, supplier: "" },
  { name: "Tortilla Wrap", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 199.0, supplier: "" },
  { name: "Tyj Spring Roll Pastry", department: "Kitchen", category: "Frozen Items", unit: "Packets", cost: 425.0, supplier: "" },
];


function foodCosting(costMap) {
  const cm = costMap || {};
  return DISHES.map((d) => {
    const cost = d.recipe.reduce((s, [itemName, qty]) => s + qty * (cm[itemName] ?? ITEM_COST[itemName] ?? 0), 0);
    const margin = ((d.price - cost) / d.price) * 100;
    return { dish: d.name, cost: Math.round(cost), price: d.price, margin: Math.round(margin) };
  });
}

function seedWastage() {
  return [];
}

/* ---------------------------------------------------------
   BAR DATA
--------------------------------------------------------- */
const BAR_ITEMS = [
  { name: "Old Monk Rum", unit: "ml", costPerMl: 1.1 },
  { name: "Bacardi White Rum", unit: "ml", costPerMl: 1.3 },
  { name: "Absolut Vodka", unit: "ml", costPerMl: 1.5 },
  { name: "Johnnie Walker Black", unit: "ml", costPerMl: 3.2 },
  { name: "Bombay Sapphire Gin", unit: "ml", costPerMl: 2.1 },
  { name: "Red Wine (House)", unit: "ml", costPerMl: 0.9 },
  { name: "Kingfisher Beer", unit: "ml", costPerMl: 0.25 },
  { name: "Soda Water", unit: "ml", costPerMl: 0.03 },
  { name: "Fresh Lime", unit: "pcs", costPerMl: 8 },
  { name: "Mint Leaves", unit: "g", costPerMl: 0.6 },
  { name: "Sugar Syrup", unit: "ml", costPerMl: 0.15 },
  { name: "Tonic Water", unit: "ml", costPerMl: 0.12 },
];

let COCKTAILS = [];

function seedBarStock() {
  return [];
}

function barCosting() {
  const map = Object.fromEntries(BAR_ITEMS.map((i) => [i.name, i.costPerMl]));
  return COCKTAILS.map((d) => {
    const cost = d.recipe.reduce((s, [n, qty]) => s + qty * (map[n] || 0), 0);
    const margin = ((d.price - cost) / d.price) * 100;
    return { dish: d.name, type: d.type, cost: Math.round(cost), price: d.price, margin: Math.round(margin) };
  });
}

function seedBarWastage() {
  return [];
}

const CUTLERY_ITEMS = [
  { name: "Dinner Plate", unit: "pcs", par: 200, area: "Restaurant" },
  { name: "Water Glass", unit: "pcs", par: 250, area: "Restaurant" },
  { name: "Fork", unit: "pcs", par: 200, area: "Restaurant" },
  { name: "Spoon", unit: "pcs", par: 200, area: "Restaurant" },
  { name: "Cocktail Glass", unit: "pcs", par: 80, area: "Bar" },
  { name: "Whisky Tumbler", unit: "pcs", par: 80, area: "Bar" },
  { name: "Wine Glass", unit: "pcs", par: 60, area: "Bar" },
  { name: "Cocktail Shaker", unit: "pcs", par: 10, area: "Bar" },
  { name: "Jigger", unit: "pcs", par: 10, area: "Bar" },
];

function seedCutlery() {
  const rows = [];
  let id = 1;
  BRANCHES.slice(1).forEach((branch) => {
    CUTLERY_ITEMS.forEach((item) => {
      const onHand = Math.round(item.par * (0.5 + Math.random() * 0.7));
      rows.push({ id: id++, branch, item: item.name, area: item.area, unit: item.unit, onHand, par: item.par, status: onHand < item.par ? "Below Par" : "OK" });
    });
  });
  return rows;
}

function seedSales() {
  const rows = [];
  let id = 1;
  const today = new Date(2026, 6, 24);
  for (let d = 0; d < 7; d++) {
    BRANCHES.slice(1).forEach((branch) => {
      DISHES.forEach((dish) => {
        const qty = Math.round(5 + Math.random() * 30);
        rows.push({
          id: id++, branch, dish: dish.name, qty,
          revenue: qty * dish.price,
          date: new Date(today.getFullYear(), today.getMonth(), 24 - d).toISOString().slice(0, 10),
        });
      });
    });
  }
  return rows;
}

/* ---------------------------------------------------------
   EXPORT UTILITIES — CSV / XLSX / PDF (works on any flat array of objects)
--------------------------------------------------------- */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cells[i]; });
    return obj;
  });
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]).filter((h) => h !== "id");
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))];
  return lines.join("\n");
}

function exportCSV(filename, rows) {
  if (!rows.length) return;
  downloadBlob(filename + ".csv", toCSV(rows), "text/csv;charset=utf-8;");
}

function exportXLSX(filename, rows) {
  if (!rows.length) return;
  const cleaned = rows.map(({ id, ...rest }) => rest);
  const ws = XLSX.utils.json_to_sheet(cleaned);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filename + ".xlsx");
}

function exportPDF(title, rows) {
  if (!rows.length) return;
  const doc = new jsPDF();
  doc.setFontSize(13);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("en-IN"), 14, 21);
  const headers = Object.keys(rows[0]).filter((h) => h !== "id");
  const body = rows.map((r) => headers.map((h) => String(r[h] ?? "")));
  autoTable(doc, { head: [headers], body, startY: 26, styles: { fontSize: 8.5 }, headStyles: { fillColor: [156, 59, 46] } });
  doc.save(title.replace(/\s+/g, "_") + ".pdf");
}

function ExportBar({ filename, rows, title }) {
  if (!rows || !rows.length) return null;
  const btn = { border: `1px solid ${COLORS.line}`, background: "#fff", borderRadius: 4, padding: "5px 11px", fontSize: 12.5, cursor: "pointer", color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 };
  return (
    <div className="flex gap-2 justify-end flex-wrap">
      <span style={{ fontSize: 11.5, color: COLORS.inkSoft, alignSelf: "center", fontFamily: "'IBM Plex Mono', monospace" }}>EXPORT:</span>
      <button style={btn} onClick={() => exportCSV(filename, rows)}>CSV</button>
      <button style={btn} onClick={() => exportXLSX(filename, rows)}>XLS</button>
      <button style={btn} onClick={() => exportPDF(title || filename, rows)}>PDF</button>
    </div>
  );
}

/**
 * A fully custom searchable dropdown — NOT the browser's native <datalist>,
 * because datalist filtering behavior (substring vs prefix) varies by browser
 * and can't be controlled. This always matches on "starts with", case-insensitive.
 */
function SearchableSelect({ options, value, onSelect, placeholder, getLabel }) {
  const label = getLabel || ((o) => (typeof o === "string" ? o : o.name));
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);
  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q ? options : options.filter((o) => label(o).toLowerCase().startsWith(q));
    return list.slice(0, 60);
  }, [options, query]);

  return (
    <div ref={ref} className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Type to search…"}
        style={selStyle}
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 mt-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, maxHeight: 220, overflowY: "auto", zIndex: 30, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
          {filtered.map((o) => (
            <button key={label(o)} type="button" onClick={() => { onSelect(o); setQuery(label(o)); setOpen(false); }}
              className="w-full text-left" style={{ padding: "7px 10px", fontSize: 13.5, border: "none", cursor: "pointer", background: "#fff", color: COLORS.ink }}>
              {label(o)}
            </button>
          ))}
        </div>
      )}
      {open && query && filtered.length === 0 && (
        <div className="absolute left-0 right-0 mt-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "8px 10px", fontSize: 13, color: COLORS.inkSoft, zIndex: 30 }}>
          No match starting with "{query}"
        </div>
      )}
    </div>
  );
}

// kept for backward compatibility with existing call sites — now backed by SearchableSelect
function ItemPicker({ items, value, onSelect }) {
  return <SearchableSelect options={items} value={value} onSelect={onSelect} placeholder="Type to search item… (starts with)" getLabel={(i) => i.name} />;
}

/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */

function Ticket({ label, children, code }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4 }} className="relative">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1, color: COLORS.inkSoft }}>{code}</span>
      </div>
      {label && (
        <div className="px-4 pb-1" style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 500, color: COLORS.ink }}>
          {label}
        </div>
      )}
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

function StatCard({ code, label, value, sub, tone = "ink" }) {
  const toneColor = { ink: COLORS.ink, paprika: COLORS.paprika, sage: COLORS.sage, amber: COLORS.amber }[tone];
  return (
    <div style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4 }} className="px-4 py-3">
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 1, color: COLORS.inkSoft }}>{code}</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: COLORS.inkSoft, marginTop: 2 }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 27, fontWeight: 600, color: toneColor, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Th({ children, right }) {
  return (
    <th style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, letterSpacing: 0.5,
      color: COLORS.inkSoft, textTransform: "uppercase", fontWeight: 500,
      padding: "8px 12px", textAlign: right ? "right" : "left", borderBottom: `1px solid ${COLORS.line}`,
      whiteSpace: "nowrap"
    }}>{children}</th>
  );
}
function Td({ children, right, mono, bold, color }) {
  return (
    <td style={{
      padding: "9px 12px", fontSize: 14, textAlign: right ? "right" : "left",
      borderBottom: `1px solid ${COLORS.line}`, color: color || COLORS.ink,
      fontFamily: mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif",
      fontWeight: bold ? 600 : 400, whiteSpace: "nowrap"
    }}>{children}</td>
  );
}

function Badge({ children, tone = "ink" }) {
  const map = {
    sage: { bg: "#EAF0EA", fg: COLORS.sage },
    amber: { bg: "#FBF1DF", fg: "#8A611C" },
    paprika: { bg: "#F5E6E2", fg: COLORS.paprikaDeep },
    ink: { bg: COLORS.paperDim, fg: COLORS.inkSoft },
  }[tone];
  return (
    <span style={{
      background: map.bg, color: map.fg, fontSize: 12, fontWeight: 600,
      padding: "3px 8px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace"
    }}>{children}</span>
  );
}

function IconBtn({ onClick, children, title }) {
  return (
    <button onClick={onClick} title={title}
      style={{ border: `1px solid ${COLORS.line}`, background: "#fff", borderRadius: 4, padding: 6, cursor: "pointer", color: COLORS.inkSoft }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.paprika)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.line)}
    >{children}</button>
  );
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */

const MODULES = [
  { key: "dashboard", code: "TKT-00", label: "Dashboard", icon: LayoutDashboard },
  { key: "purchase", code: "TKT-01", label: "Purchase & Vendor Payments", icon: TruckIcon },
  { key: "itemmaster", code: "TKT-14", label: "Item Master & Price Tracking", icon: ClipboardList },
  { key: "stock", code: "TKT-02", label: "Stock Inventory", icon: Package },
  { key: "indent", code: "TKT-13", label: "Daily Indent (Store → Kitchen/Bar)", icon: ClipboardList },
  { key: "store", code: "TKT-03", label: "Branch Inventory", icon: Warehouse },
  { key: "costing", code: "TKT-04", label: "Food Costing", icon: ChefHat },
  { key: "wastage", code: "TKT-05", label: "Breakage / Wastage", icon: AlertTriangle },
  { key: "sales", code: "TKT-06", label: "Sales Report", icon: TrendingUp },
  { key: "payables", code: "TKT-07", label: "Vendor Payables", icon: Wallet },
  { key: "recurring", code: "TKT-15", label: "Recurring Payments", icon: Repeat },
  { key: "barpurchase", code: "TKT-16", label: "Bar Purchases", icon: TruckIcon },
  { key: "barstock", code: "TKT-09", label: "Bar Inventory", icon: GlassWater },
  { key: "barcosting", code: "TKT-10", label: "Cocktail/Mocktail Costing", icon: Martini },
  { key: "barwastage", code: "TKT-11", label: "Bar Wastage", icon: AlertTriangle },
  { key: "cutlery", code: "TKT-12", label: "Cutlery & Crockery", icon: UtensilsCrossed },
  { key: "settings", code: "TKT-08", label: "Owner Mail Settings", icon: SettingsIcon },
];

function PinGate({ restaurantName, onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!onUnlock(pin)) {
      setError(true);
      setPin("");
    }
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: COLORS.paper, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={submit} style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 6, padding: 28, width: 300, textAlign: "center" }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 19, color: COLORS.ink, marginBottom: 4 }}>{restaurantName}</div>
        <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 18 }}>Enter the team PIN to continue</div>
        <input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          autoFocus
          style={{ width: "100%", textAlign: "center", fontSize: 18, letterSpacing: 4, border: `1px solid ${error ? COLORS.paprika : COLORS.line}`, borderRadius: 4, padding: "10px 8px", fontFamily: "'IBM Plex Mono', monospace" }}
        />
        {error && <div style={{ fontSize: 12, color: COLORS.paprika, marginTop: 8 }}>Wrong PIN, try again</div>}
        <button type="submit" style={{ marginTop: 14, width: "100%", background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "9px 0", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Unlock</button>
      </form>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_LINK;
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const [branch, setBranch] = useState("All Branches");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [branchTick, setBranchTick] = useState(0); // bumped to force re-render after BRANCHES array mutates
  const [recipeTick, setRecipeTick] = useState(0); // bumped after DISHES/COCKTAILS mutate
  const [restaurantName, setRestaurantNameState] = useState("Tanah Kitchen & Bar");
  const [currentUser, setCurrentUserState] = useState(() => {
    try { return window.localStorage.getItem("invotelstitch:currentUser") || ""; } catch (e) { return ""; }
  });
  function setCurrentUser(name) {
    setCurrentUserState(name);
    try { window.localStorage.setItem("invotelstitch:currentUser", name); } catch (e) {}
  }
  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [appPin, setAppPinState] = useState("");
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem("invotelstitch:unlocked") === "true"; } catch (e) { return false; }
  });
  function setAppPin(pin) {
    setAppPinState(pin);
    saveKey("appPin", pin);
  }
  function tryUnlock(pin) {
    if (pin === appPin) {
      setUnlocked(true);
      try { sessionStorage.setItem("invotelstitch:unlocked", "true"); } catch (e) {}
      return true;
    }
    return false;
  }
  const [storageError, setStorageError] = useState(false);

  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }
  const [stock, setStock] = useState([]);
  const [wastage, setWastage] = useState([]);
  const [indents, setIndents] = useState([]);
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [salesProcessed, setSalesProcessed] = useState(false);
  const itemCostMap = useMemo(() => Object.fromEntries(items.map((i) => [i.name, i.cost])), [items]);
  const costing = useMemo(() => foodCosting(itemCostMap), [itemCostMap, recipeTick]);

  const [barStock, setBarStock] = useState([]);
  const [barPurchases, setBarPurchases] = useState([]);
  const [barWastage, setBarWastage] = useState([]);
  const [cutlery, setCutlery] = useState([]);
  const barCostingRows = useMemo(barCosting, [recipeTick]);

  const [ownerEmail, setOwnerEmailState] = useState("owner@invotelstitch.in");
  const [notifyOn, setNotifyOnState] = useState(true);
  const [activity, setActivity] = useState([]);
  const [backendUrl, setBackendUrlState] = useState(() => {
    try { return window.localStorage.getItem("invotelstitch:backendUrl") || ""; } catch (e) { return ""; }
  });
  const [backendStatus, setBackendStatus] = useState("idle"); // idle | ok | error

  function setBackendUrl(url) {
    setBackendUrlState(url);
    try { window.localStorage.setItem("invotelstitch:backendUrl", url); } catch (e) {}
  }

  // ---- persistent storage: Google Sheets backend when configured, else this browser's localStorage ----
  async function loadKey(key, fallback) {
    try {
      if (backendUrl) {
        const res = await fetch(`${backendUrl}?key=${encodeURIComponent(key)}`);
        const data = await res.json();
        setBackendStatus("ok");
        return data.value != null ? JSON.parse(data.value) : fallback;
      }
      const raw = window.localStorage.getItem("invotelstitch:" + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      if (backendUrl) setBackendStatus("error");
      return fallback;
    }
  }
  async function saveKey(key, value) {
    try {
      if (backendUrl) {
        await fetch(backendUrl, { method: "POST", body: new URLSearchParams({ key, value: JSON.stringify(value) }) });
        setBackendStatus("ok");
        return;
      }
      window.localStorage.setItem("invotelstitch:" + key, JSON.stringify(value));
    } catch (e) {
      if (backendUrl) setBackendStatus("error");
      setStorageError(true);
    }
  }

  useEffect(() => {
    (async () => {
      const [p, sl, v, it, ph, s, w, ind, rp, bp, bs, bw, c, a, settings, sp, savedBranches, savedRestaurantName, savedDishes, savedCocktails, savedPin] = await Promise.all([
        loadKey("purchases", seedPurchases()),
        loadKey("sales", seedSales()),
        loadKey("vendors", VENDORS),
        loadKey("items", REAL_ITEM_MASTER),
        loadKey("priceHistory", []),
        loadKey("stock", seedStock()),
        loadKey("wastage", seedWastage()),
        loadKey("indents", []),
        loadKey("recurringPayments", []),
        loadKey("barPurchases", []),
        loadKey("barStock", seedBarStock()),
        loadKey("barWastage", seedBarWastage()),
        loadKey("cutlery", seedCutlery()),
        loadKey("activity", []),
        loadKey("settings", { ownerEmail: "owner@invotelstitch.in", notifyOn: true }),
        loadKey("salesProcessed", false),
        loadKey("branches", ["Gachibowli"]),
        loadKey("restaurantName", "Tanah Kitchen & Bar"),
        loadKey("dishes", []),
        loadKey("cocktails", []),
        loadKey("appPin", ""),
      ]);
      setPurchases(p); setSales(sl); setVendors(v); setItems(it); setPriceHistory(ph); setStock(s); setWastage(w); setIndents(ind); setRecurringPayments(rp);
      setBarPurchases(bp); setBarStock(bs); setBarWastage(bw); setCutlery(c);
      setActivity(a);
      setOwnerEmailState(settings.ownerEmail);
      setNotifyOnState(settings.notifyOn);
      setSalesProcessed(sp);
      BRANCHES = ["All Branches", ...savedBranches];
      setRestaurantNameState(savedRestaurantName);
      DISHES = savedDishes;
      COCKTAILS = savedCocktails;
      setAppPinState(savedPin);
      setBranchTick((t) => t + 1);
      setRecipeTick((t) => t + 1);
      setLoading(false);
    })();
  }, []);

  function addBranch(name) {
    const trimmed = name.trim();
    if (!trimmed || BRANCHES.includes(trimmed)) return;
    BRANCHES = [...BRANCHES, trimmed];
    saveKey("branches", BRANCHES.slice(1));
    setBranchTick((t) => t + 1);
    logChange(`New branch added — ${trimmed}`);
  }

  function addDish(name, price, recipe) {
    const trimmed = name.trim();
    if (!trimmed || DISHES.some((d) => d.name === trimmed)) return;
    DISHES = [...DISHES, { name: trimmed, price: Number(price) || 0, recipe }];
    saveKey("dishes", DISHES);
    setRecipeTick((t) => t + 1);
    logChange(`New dish added to Food Costing — ${trimmed} (₹${price})`);
  }

  function deleteDish(name) {
    DISHES = DISHES.filter((d) => d.name !== name);
    saveKey("dishes", DISHES);
    setRecipeTick((t) => t + 1);
    logChange(`Dish removed from Food Costing — ${name}`);
  }

  function addCocktail(name, type, price, recipe) {
    const trimmed = name.trim();
    if (!trimmed || COCKTAILS.some((d) => d.name === trimmed)) return;
    COCKTAILS = [...COCKTAILS, { name: trimmed, type, price: Number(price) || 0, recipe }];
    saveKey("cocktails", COCKTAILS);
    setRecipeTick((t) => t + 1);
    logChange(`New drink added to Cocktail/Mocktail Costing — ${trimmed} (₹${price})`);
  }

  function deleteCocktail(name) {
    COCKTAILS = COCKTAILS.filter((d) => d.name !== name);
    saveKey("cocktails", COCKTAILS);
    setRecipeTick((t) => t + 1);
    logChange(`Drink removed from Cocktail/Mocktail Costing — ${name}`);
  }

  function setRestaurantName(name) {
    setRestaurantNameState(name);
    saveKey("restaurantName", name);
  }

  const [purchasePrefill, setPurchasePrefill] = useState(null);

  function reorderFromLastPurchase(stockRow) {
    const lastP = [...purchases].filter((p) => p.item === stockRow.item).sort((a, b) => (a.billDate < b.billDate ? 1 : -1))[0];
    setPurchasePrefill({
      branch: stockRow.branch,
      item: stockRow.item,
      unit: stockRow.unit,
      vendor: lastP?.vendor || vendors[0] || "",
      rate: lastP?.rate || itemCostMap[stockRow.item] || 0,
    });
    setActive("purchase");
  }

  const [emailStatus, setEmailStatus] = useState("idle"); // idle | sending | sent | error | no-backend

  async function sendOwnerEmail(subject, body) {
    if (!backendUrl) {
      setEmailStatus("no-backend");
      return { ok: false, error: "no backend connected" };
    }
    if (!ownerEmail) {
      setEmailStatus("error");
      return { ok: false, error: "no owner email set" };
    }
    setEmailStatus("sending");
    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        body: new URLSearchParams({ action: "sendEmail", to: ownerEmail, subject, body }),
      });
      const data = await res.json();
      setEmailStatus(data.ok ? "sent" : "error");
      if (data.ok) logChange(`Email sent to owner — "${subject}"`);
      return data;
    } catch (e) {
      setEmailStatus("error");
      return { ok: false, error: String(e) };
    }
  }

  function downloadFullBackup() {
    const backup = {
      exportedAt: new Date().toISOString(),
      restaurantName, branches: BRANCHES.slice(1),
      purchases, sales, vendors, items, priceHistory, stock, wastage, indents,
      recurringPayments, barPurchases, barStock, barWastage, cutlery, activity,
      settings: { ownerEmail, notifyOn }, salesProcessed,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${restaurantName.replace(/\s+/g, "_")}_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logChange("Full data backup downloaded");
  }

  function clearDemoData() {
    setPurchases([]); saveKey("purchases", []);
    setSales([]); saveKey("sales", []);
    setWastage([]); saveKey("wastage", []);
    setIndents([]); saveKey("indents", []);
    setRecurringPayments([]); saveKey("recurringPayments", []);
    setBarPurchases([]); saveKey("barPurchases", []);
    setBarWastage([]); saveKey("barWastage", []);
    setCutlery([]); saveKey("cutlery", []);
    setPriceHistory([]); saveKey("priceHistory", []);
    setSalesProcessed(false); saveKey("salesProcessed", false);
    // reset stock on-hand to 0 for every item/branch combo so real purchases start clean
    const freshStock = stock.map((r) => ({ ...r, onHand: 0, openingStock: 0, physicalCount: null, status: "Low" }));
    setStock(freshStock); saveKey("stock", freshStock);
    const freshBarStock = barStock.map((r) => ({ ...r, onHand: 0, status: "Low" }));
    setBarStock(freshBarStock); saveKey("barStock", freshBarStock);
    const clearedActivity = [{ id: Date.now(), ts: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), text: "Demo data cleared — ready for real entries", mailed: false }];
    setActivity(clearedActivity); saveKey("activity", clearedActivity);
  }

  function logChange(text) {
    const entry = {
      id: Date.now(),
      ts: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      text: currentUser ? `${text} — by ${currentUser}` : text,
      user: currentUser || "—",
      mailed: notifyOn,
    };
    setActivity((prev) => {
      const next = [entry, ...prev];
      saveKey("activity", next);
      return next;
    });
  }

  function addVendor(name) {
    const trimmed = name.trim();
    if (!trimmed || vendors.includes(trimmed)) return;
    const next = [...vendors, trimmed];
    setVendors(next);
    saveKey("vendors", next);
    logChange(`New vendor added — ${trimmed}`);
  }

  function addItem(name, unit, cost, department, category, supplier) {
    const trimmed = name.trim();
    if (!trimmed || items.some((i) => i.name === trimmed)) return;
    const next = [...items, { name: trimmed, unit: unit || "Kg", cost: Number(cost) || 0, department: department || "Kitchen", category: category || "Misc", supplier: supplier || "" }];
    setItems(next);
    saveKey("items", next);
    logChange(`New item added to Item Master — ${trimmed} (₹${cost}/${unit})`);
  }

  function updateItem(originalName, updated) {
    const idx = items.findIndex((i) => i.name === originalName);
    if (idx === -1) return;
    const before = items[idx];
    const next = [...items];
    next[idx] = { ...before, ...updated, cost: Number(updated.cost) };
    setItems(next);
    saveKey("items", next);

    if (Number(before.cost) !== Number(updated.cost)) {
      const change = { id: Date.now(), item: before.name, oldCost: before.cost, newCost: Number(updated.cost), changePct: before.cost ? Math.round(((updated.cost - before.cost) / before.cost) * 100) : 0, date: new Date().toISOString().slice(0, 10) };
      const nextHistory = [change, ...priceHistory];
      setPriceHistory(nextHistory);
      saveKey("priceHistory", nextHistory);
    }
    logChange(`Item updated — ${before.name}${before.name !== updated.name ? ` → ${updated.name}` : ""} (₹${before.cost} → ₹${updated.cost})`);
  }

  function deleteItem(name) {
    const next = items.filter((i) => i.name !== name);
    setItems(next);
    saveKey("items", next);
    logChange(`Item removed from Item Master — ${name}`);
  }

  function requestConfirm(message, onConfirm) {
    setConfirmDialog({ message, onConfirm });
  }

  // keeps Stock Inventory as the single source of truth: every purchase (+) and
  // every wastage/sale (-) moves through this so on-hand quantities never drift
  function adjustStock(stockList, branchName, itemName, unit, deltaQty) {
    const idx = stockList.findIndex((r) => r.branch === branchName && r.item === itemName);
    if (idx === -1) {
      if (deltaQty <= 0) return stockList;
      const reorderLevel = 20;
      const onHand = Math.max(0, +deltaQty.toFixed(2));
      return [...stockList, { id: Date.now() + Math.random(), branch: branchName, item: itemName, unit, onHand, openingStock: 0, reorderLevel, status: onHand < reorderLevel ? "Low" : "OK" }];
    }
    const next = [...stockList];
    const row = next[idx];
    const onHand = Math.max(0, +(row.onHand + deltaQty).toFixed(2));
    next[idx] = { ...row, onHand, status: onHand < row.reorderLevel ? "Low" : "OK" };
    return next;
  }

  function addPurchaseEntry(entry) {
    const amount = entry.qty * entry.rate; // excl. GST
    const gstPercent = Number(entry.gstPercent) || 0;
    const gstAmount = Math.round(amount * gstPercent / 100);
    const totalAmount = amount + gstAmount; // incl. GST — this is the actual invoice/payable amount
    const newRow = { ...entry, id: Date.now(), amount, gstAmount, totalAmount, balance: totalAmount - entry.paidAmount };
    const nextPurchases = [newRow, ...purchases];
    setPurchases(nextPurchases);
    saveKey("purchases", nextPurchases);

    const nextStock = adjustStock(stock, entry.branch, entry.item, entry.unit, entry.qty);
    setStock(nextStock);
    saveKey("stock", nextStock);

    logChange(`Purchase added — Inv#${entry.invoiceNo || "—"}, ${entry.vendor}, ${entry.item} +${entry.qty}${entry.unit} (₹${totalAmount.toLocaleString("en-IN")} incl. GST) — stock updated`);
  }

  function deletePurchaseEntry(row) {
    const nextPurchases = purchases.filter((r) => r.id !== row.id);
    setPurchases(nextPurchases);
    saveKey("purchases", nextPurchases);

    const nextStock = adjustStock(stock, row.branch, row.item, row.unit, -row.qty);
    setStock(nextStock);
    saveKey("stock", nextStock);

    logChange(`Purchase entry deleted — ${row.vendor} – ${row.item} — stock reversed`);
  }

  function addWastageEntry(entry) {
    const estLoss = Math.round(entry.qty * (itemCostMap[entry.item] ?? ITEM_COST[entry.item] ?? 0));
    const newRow = { ...entry, id: Date.now(), estLoss };
    const nextWastage = [newRow, ...wastage];
    setWastage(nextWastage);
    saveKey("wastage", nextWastage);

    const nextStock = adjustStock(stock, entry.branch, entry.item, entry.unit, -entry.qty);
    setStock(nextStock);
    saveKey("stock", nextStock);

    logChange(`Wastage logged — ${entry.item}, ${entry.qty}${entry.unit}, ${entry.reason} — stock reduced`);
  }

  function deleteWastageEntry(row) {
    const nextWastage = wastage.filter((r) => r.id !== row.id);
    setWastage(nextWastage);
    saveKey("wastage", nextWastage);

    const nextStock = adjustStock(stock, row.branch, row.item, row.unit, row.qty);
    setStock(nextStock);
    saveKey("stock", nextStock);

    logChange(`Wastage entry deleted — ${row.item} – ${row.reason} — stock reversed`);
  }

  function addBarWastageEntry(entry) {
    const item = BAR_ITEMS.find((i) => i.name === entry.item);
    const estLoss = Math.round(entry.qty * (item?.costPerMl || 1));
    const newRow = { ...entry, id: Date.now(), estLoss };
    const nextWastage = [newRow, ...barWastage];
    setBarWastage(nextWastage);
    saveKey("barWastage", nextWastage);

    const nextBarStock = adjustStock(barStock, entry.branch, entry.item, entry.unit, -entry.qty);
    setBarStock(nextBarStock);
    saveKey("barStock", nextBarStock);

    logChange(`Bar wastage logged — ${entry.item}, ${entry.qty}${entry.unit}, ${entry.reason} — bar stock reduced`);
  }

  function deleteBarWastageEntry(row) {
    const nextWastage = barWastage.filter((r) => r.id !== row.id);
    setBarWastage(nextWastage);
    saveKey("barWastage", nextWastage);

    const nextBarStock = adjustStock(barStock, row.branch, row.item, row.unit, row.qty);
    setBarStock(nextBarStock);
    saveKey("barStock", nextBarStock);

    logChange(`Bar wastage entry deleted — ${row.item} – ${row.reason} — bar stock reversed`);
  }
  function bulkImportSales(rows) {
    const unmatched = new Set();
    const newRows = rows.map((r) => {
      const dish = DISHES.find((d) => d.name.toLowerCase() === (r.dish || "").toLowerCase());
      if (!dish) unmatched.add(r.dish);
      const qty = Number(r.qty) || 0;
      return {
        id: Date.now() + Math.random(),
        branch: r.branch && BRANCHES.includes(r.branch) ? r.branch : BRANCHES[1],
        dish: dish ? dish.name : r.dish,
        qty,
        revenue: qty * (dish?.price || 0),
        date: r.date || todayISO(),
      };
    });
    const next = [...newRows, ...sales];
    setSales(next);
    saveKey("sales", next);
    const msg = unmatched.size > 0
      ? `Sales imported — ${newRows.length} rows, but ${unmatched.size} dish name(s) not found in Food Costing (₹0 revenue for those): ${[...unmatched].join(", ")}`
      : `Sales imported — ${newRows.length} rows from CSV`;
    logChange(msg);
    return { imported: newRows.length, unmatched: [...unmatched] };
  }

  function addSaleEntry(entry) {
    const dish = DISHES.find((d) => d.name === entry.dish);
    const revenue = entry.qty * (dish?.price || 0);
    const newRow = { ...entry, id: Date.now(), revenue };
    const next = [newRow, ...sales];
    setSales(next);
    saveKey("sales", next);
    logChange(`Sale added — ${entry.dish} x${entry.qty} (₹${revenue.toLocaleString("en-IN")})`);
  }

  function deleteSaleEntry(row) {
    const next = sales.filter((r) => r.id !== row.id);
    setSales(next);
    saveKey("sales", next);
    logChange(`Sale entry deleted — ${row.dish} x${row.qty}`);
  }

  function addCutleryItem(entry) {
    const newRow = { ...entry, id: Date.now(), status: entry.onHand < entry.par ? "Below Par" : "OK" };
    const next = [newRow, ...cutlery];
    setCutlery(next);
    saveKey("cutlery", next);
    logChange(`Cutlery/crockery item added — ${entry.item} (${entry.onHand} ${entry.unit})`);
  }

  function updateCutleryCount(id, onHand) {
    const next = cutlery.map((r) => (r.id === id ? { ...r, onHand: Number(onHand) || 0, status: (Number(onHand) || 0) < r.par ? "Below Par" : "OK" } : r));
    setCutlery(next);
    saveKey("cutlery", next);
  }

  function deleteCutleryItem(row) {
    const next = cutlery.filter((r) => r.id !== row.id);
    setCutlery(next);
    saveKey("cutlery", next);
    logChange(`Cutlery/crockery item removed — ${row.item}`);
  }

  function processSalesDeduction() {
    const usage = {}; // key: branch|item -> qty
    sales.forEach((sale) => {
      const dish = DISHES.find((d) => d.name === sale.dish);
      if (!dish) return;
      dish.recipe.forEach(([itemName, qtyPerDish]) => {
        const key = sale.branch + "|" + itemName;
        usage[key] = (usage[key] || 0) + qtyPerDish * sale.qty;
      });
    });
    const next = stock.map((r) => {
      const used = usage[r.branch + "|" + r.item] || 0;
      const onHand = Math.max(0, +(r.onHand - used).toFixed(2));
      return { ...r, onHand, status: onHand < r.reorderLevel ? "Low" : "OK" };
    });
    setStock(next);
    saveKey("stock", next);
    setSalesProcessed(true);
    saveKey("salesProcessed", true);
    logChange(`Sales processed — ingredients auto-deducted from stock for ${sales.length} sale entries (recipe-based)`);
  }
  function resetSalesProcessing() {
    setSalesProcessed(false);
    saveKey("salesProcessed", false);
    logChange("Sales processing reset (demo)");
  }

  function setPhysicalCount(stockId, count) {
    const next = stock.map((r) => (r.id === stockId ? { ...r, physicalCount: count === "" ? null : Number(count) } : r));
    setStock(next);
    saveKey("stock", next);
  }

  function addIndentEntry(entry) {
    const indentNo = 1000 + indents.length + 1;
    const unitCost = itemCostMap[entry.item] ?? ITEM_COST[entry.item] ?? 0;
    const indentValue = Math.round(entry.qty * unitCost);
    const newRow = { ...entry, id: Date.now(), indentNo, unitCost, indentValue };
    const nextIndents = [newRow, ...indents];
    setIndents(nextIndents);
    saveKey("indents", nextIndents);

    const nextStock = adjustStock(stock, entry.branch, entry.item, entry.unit, -entry.qty);
    setStock(nextStock);
    saveKey("stock", nextStock);

    logChange(`Indent #${indentNo} — ${entry.qty}${entry.unit} ${entry.item} (₹${indentValue.toLocaleString("en-IN")}) issued to ${entry.issuedTo} (${entry.branch}) — stock reduced`);
  }

  function deleteIndentEntry(row) {
    const nextIndents = indents.filter((r) => r.id !== row.id);
    setIndents(nextIndents);
    saveKey("indents", nextIndents);

    const nextStock = adjustStock(stock, row.branch, row.item, row.unit, row.qty);
    setStock(nextStock);
    saveKey("stock", nextStock);

    logChange(`Indent #${row.indentNo} deleted — ${row.item} — stock reversed`);
  }

  function addBarPurchaseEntry(entry) {
    const amount = entry.qty * entry.rate;
    const gstPercent = Number(entry.gstPercent) || 0;
    const gstAmount = Math.round(amount * gstPercent / 100);
    const totalAmount = amount + gstAmount;
    const newRow = { ...entry, id: Date.now(), amount, gstAmount, totalAmount, balance: totalAmount - entry.paidAmount };
    const nextBarPurchases = [newRow, ...barPurchases];
    setBarPurchases(nextBarPurchases);
    saveKey("barPurchases", nextBarPurchases);

    const nextBarStock = adjustStock(barStock, entry.branch, entry.item, entry.unit, entry.qty);
    setBarStock(nextBarStock);
    saveKey("barStock", nextBarStock);

    logChange(`Bar purchase added — ${entry.vendor}, ${entry.item} +${entry.qty}${entry.unit} (₹${totalAmount.toLocaleString("en-IN")} incl. GST) — bar stock updated`);
  }

  function deleteBarPurchaseEntry(row) {
    const nextBarPurchases = barPurchases.filter((r) => r.id !== row.id);
    setBarPurchases(nextBarPurchases);
    saveKey("barPurchases", nextBarPurchases);

    const nextBarStock = adjustStock(barStock, row.branch, row.item, row.unit, -row.qty);
    setBarStock(nextBarStock);
    saveKey("barStock", nextBarStock);

    logChange(`Bar purchase deleted — ${row.vendor} – ${row.item} — bar stock reversed`);
  }

  function addRecurringPayment(entry) {
    const balance = entry.amount - entry.paidAmount;
    const newRow = { ...entry, id: Date.now(), balance };
    const next = [newRow, ...recurringPayments];
    setRecurringPayments(next);
    saveKey("recurringPayments", next);
    logChange(`Recurring payment added — ${entry.expenseName} (₹${entry.amount.toLocaleString("en-IN")}/${entry.frequency})`);
  }

  function updateRecurringPayment(id, updated) {
    const next = recurringPayments.map((r) => {
      if (r.id !== id) return r;
      const merged = { ...r, ...updated };
      merged.balance = Number(merged.amount) - Number(merged.paidAmount);
      return merged;
    });
    setRecurringPayments(next);
    saveKey("recurringPayments", next);
    logChange(`Recurring payment updated — ${updated.expenseName || recurringPayments.find((r) => r.id === id)?.expenseName}`);
  }

  function deleteRecurringPayment(row) {
    const next = recurringPayments.filter((r) => r.id !== row.id);
    setRecurringPayments(next);
    saveKey("recurringPayments", next);
    logChange(`Recurring payment deleted — ${row.expenseName}`);
  }

  function setOwnerEmail(v) {
    setOwnerEmailState(v);
    saveKey("settings", { ownerEmail: v, notifyOn });
  }
  function setNotifyOn(fnOrVal) {
    setNotifyOnState((prev) => {
      const next = typeof fnOrVal === "function" ? fnOrVal(prev) : fnOrVal;
      saveKey("settings", { ownerEmail, notifyOn: next });
      return next;
    });
  }

  const filterBranch = (rows) => branch === "All Branches" ? rows : rows.filter((r) => r.branch === branch);

  const fPurchases = filterBranch(purchases);
  const fStock = filterBranch(stock);
  const fWastage = filterBranch(wastage);
  const fSales = filterBranch(sales);
  const fBarStock = filterBranch(barStock);
  const fBarWastage = filterBranch(barWastage);
  const fCutlery = filterBranch(cutlery);

  /* ---- derived metrics ---- */
  const totalPurchase = fPurchases.reduce((s, r) => s + (r.totalAmount ?? r.amount), 0);
  const totalOutstanding = fPurchases.reduce((s, r) => s + r.balance, 0);
  const totalWastageLoss = fWastage.reduce((s, r) => s + r.estLoss, 0);
  const totalSalesRevenue = fSales.reduce((s, r) => s + r.revenue, 0);
  const lowStockCount = fStock.filter((r) => r.status === "Low").length;
  const lowStockItems = fStock.filter((r) => r.status === "Low").sort((a, b) => a.onHand - b.onHand).slice(0, 8);

  const salesByDay = useMemo(() => {
    const map = {};
    fSales.forEach((r) => { map[r.date] = (map[r.date] || 0) + r.revenue; });
    return Object.entries(map).sort().map(([date, revenue]) => ({ date: date.slice(8) + "/" + date.slice(5, 7), revenue }));
  }, [fSales]);

  const wastageByReason = useMemo(() => {
    const map = {};
    fWastage.forEach((r) => { map[r.reason] = (map[r.reason] || 0) + r.estLoss; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [fWastage]);

  const ingredientConsumption = useMemo(() => {
    const map = {};
    fSales.forEach((sale) => {
      const dish = DISHES.find((d) => d.name === sale.dish);
      if (!dish) return;
      dish.recipe.forEach(([itemName, qtyPerDish]) => {
        if (!map[itemName]) map[itemName] = { item: itemName, unit: ITEMS.find((i) => i.name === itemName)?.unit || "", businessQty: 0, wastageQty: 0 };
        map[itemName].businessQty += qtyPerDish * sale.qty;
      });
    });
    fWastage.forEach((w) => {
      if (!map[w.item]) map[w.item] = { item: w.item, unit: w.unit, businessQty: 0, wastageQty: 0 };
      map[w.item].wastageQty += w.qty;
    });
    return Object.values(map)
      .map((r) => {
        const total = r.businessQty + r.wastageQty;
        return { ...r, totalQty: total, wastagePct: total > 0 ? Math.round((r.wastageQty / total) * 100) : 0 };
      })
      .sort((a, b) => b.totalQty - a.totalQty);
  }, [fSales, fWastage]);

  if (loading) {
    return (
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: COLORS.paper, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 19, color: COLORS.ink, marginBottom: 6 }}>INVOTELSTITCH</div>
          <div style={{ fontSize: 14 }}>Loading saved data…</div>
        </div>
      </div>
    );
  }

  if (appPin && !unlocked) {
    return <PinGate restaurantName={restaurantName} onUnlock={tryUnlock} />;
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: COLORS.paper, minHeight: "100vh", color: COLORS.ink }}>
      {storageError && (
        <div style={{ background: "#F5E6E2", color: COLORS.paprikaDeep, fontSize: 13, textAlign: "center", padding: "6px 12px" }}>
          Couldn't save last change to shared storage — check connection and try again.
        </div>
      )}
      {confirmDialog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(38,34,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 6, padding: 20, width: 340, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: COLORS.ink, marginBottom: 8 }}>Confirm</div>
            <div style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 16 }}>{confirmDialog.message}</div>
            <div className="flex gap-2 justify-end flex-wrap">
              <button onClick={() => setConfirmDialog(null)} style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>OK, Confirm</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex" style={{ minHeight: "100vh" }}>
        {/* SIDEBAR */}
        {mobileNavOpen && (
          <div className="md:hidden" onClick={() => setMobileNavOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
        )}
        <aside
          className={`${mobileNavOpen ? "flex" : "hidden"} md:flex flex-col`}
          style={{ width: 248, background: COLORS.slate, flexShrink: 0, position: mobileNavOpen ? "fixed" : undefined, top: 0, bottom: 0, left: 0, zIndex: 50 }}
        >
          <div className="px-5 pt-6 pb-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${COLORS.slateSoft}` }}>
            <div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 21, fontWeight: 600, color: COLORS.paper, letterSpacing: 0.5 }}>INVOTELSTITCH</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#B5AB9D", letterSpacing: 1, marginTop: 2 }}>{restaurantName.toUpperCase()}</div>
            </div>
            <button className="md:hidden" onClick={() => setMobileNavOpen(false)} style={{ background: "none", border: "none", color: "#D8D0C4", cursor: "pointer" }}><X size={18} /></button>
          </div>
          <nav className="flex-1 px-3 py-4" style={{ overflowY: "auto" }}>
            {MODULES.map((m) => {
              const Icon = m.icon;
              const isActive = active === m.key;
              return (
                <button key={m.key} onClick={() => { setActive(m.key); setMobileNavOpen(false); }}
                  className="w-full flex items-center gap-3 text-left mb-1"
                  style={{
                    padding: "9px 12px", borderRadius: 4, border: "none", cursor: "pointer",
                    background: isActive ? COLORS.paprika : "transparent",
                    color: isActive ? "#fff" : "#D8D0C4",
                    borderLeft: isActive ? `3px solid ${COLORS.amber}` : "3px solid transparent",
                  }}>
                  <Icon size={15} strokeWidth={2} />
                  <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, flex: 1 }}>{m.label}</span>
                  {m.key === "stock" && lowStockCount > 0 && (
                    <span style={{ background: COLORS.paprika, color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "1px 6px", fontFamily: "'IBM Plex Mono', monospace" }}>{lowStockCount}</span>
                  )}
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, opacity: 0.65 }}>{m.code}</span>
                </button>
              );
            })}
          </nav>
          <div className="px-4 py-4" style={{ borderTop: `1px solid ${COLORS.slateSoft}` }}>
            <div style={{ fontSize: 11, color: "#8A8177", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.5, marginBottom: 4 }}>LOGGED IN AS</div>
            <input
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              placeholder="Your name"
              style={{ width: "100%", background: COLORS.slateSoft, border: "none", borderRadius: 4, padding: "6px 8px", fontSize: 13.5, color: "#fff", marginBottom: 10 }}
            />
            <div className="flex items-center gap-2" style={{ color: notifyOn ? COLORS.amber : "#8A8177", fontSize: 12.5 }}>
              <Mail size={13} />
              <span>{notifyOn ? "Owner mail sync: ON" : "Owner mail sync: OFF"}</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1" style={{ minWidth: 0 }}>
          {/* HEADER */}
          <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 flex-wrap" style={{ borderBottom: `1px solid ${COLORS.line}`, background: "#fff" }}>
            <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
              <button className="md:hidden" onClick={() => setMobileNavOpen(true)} style={{ background: "none", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 6, cursor: "pointer", color: COLORS.ink, flexShrink: 0 }}>
                <Menu size={16} />
              </button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {MODULES.find((m) => m.key === active)?.label}
                </div>
                <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</div>
              </div>
            </div>
            <BranchPicker branch={branch} setBranch={setBranch} onAddBranch={addBranch} />
          </div>

          <div className="px-4 md:px-6 py-4 md:py-5">
            {active === "dashboard" && (
              <Dashboard
                totalPurchase={totalPurchase} totalOutstanding={totalOutstanding}
                totalWastageLoss={totalWastageLoss} totalSalesRevenue={totalSalesRevenue}
                lowStockCount={lowStockCount} lowStockItems={lowStockItems} salesByDay={salesByDay} wastageByReason={wastageByReason}
                costing={costing} activity={activity} onReorder={reorderFromLastPurchase}
              />
            )}
            {active === "purchase" && (
              <PurchaseModule rows={fPurchases} onAdd={addPurchaseEntry} onDelete={(row) => requestConfirm(`Delete this purchase — ${row.vendor}, ${row.item} (${row.qty}${row.unit})? This will reduce Stock Inventory back by the same qty.`, () => deletePurchaseEntry(row))} vendors={vendors} onAddVendor={addVendor} items={items} onAddItem={addItem} prefill={purchasePrefill} onConsumePrefill={() => setPurchasePrefill(null)} />
            )}
            {active === "itemmaster" && (
              <ItemMasterModule
                items={items}
                priceHistory={priceHistory}
                onUpdate={updateItem}
                onDelete={(name) => requestConfirm(`Remove "${name}" from Item Master? Existing purchase/stock/wastage history for it stays intact, but you won't be able to pick it in new entries.`, () => deleteItem(name))}
              />
            )}
            {active === "stock" && <StockModule rows={fStock} onSetPhysicalCount={setPhysicalCount} items={items} itemCostMap={itemCostMap} purchases={purchases} indents={indents} />}
            {active === "indent" && (
              <IndentModule rows={filterBranch(indents)} onAdd={addIndentEntry} onDelete={(row) => requestConfirm(`Delete Indent #${row.indentNo} — ${row.item} (${row.qty}${row.unit})? This will add the qty back to Stock.`, () => deleteIndentEntry(row))} items={items} itemCostMap={itemCostMap} restaurantName={restaurantName} />
            )}
            {active === "store" && <StoreModule stock={stock} itemCostMap={itemCostMap} onSendEmail={sendOwnerEmail} emailStatus={emailStatus} restaurantName={restaurantName} ownerEmail={ownerEmail} />}
            {active === "costing" && <CostingModule rows={costing} sales={sales} items={items} onAddDish={addDish} onDeleteDish={(name) => requestConfirm(`Remove "${name}" from Food Costing?`, () => deleteDish(name))} />}
            {active === "wastage" && (
              <WastageModule rows={fWastage} onAdd={addWastageEntry} onDelete={(row) => requestConfirm(`Delete this wastage entry — ${row.item}, ${row.qty}${row.unit}, ${row.reason}? This will add the qty back to Stock.`, () => deleteWastageEntry(row))} items={items} />
            )}
            {active === "sales" && (
              <SalesModule
                rows={fSales}
                consumption={ingredientConsumption}
                processed={salesProcessed}
                onProcess={processSalesDeduction}
                onReset={resetSalesProcessing}
                onAdd={addSaleEntry}
                onDelete={(row) => requestConfirm(`Delete this sale — ${row.dish} x${row.qty}?`, () => deleteSaleEntry(row))}
                onImport={bulkImportSales}
              />
            )}
            {active === "payables" && <PayablesModule purchases={purchases} />}
            {active === "recurring" && (
              <RecurringPaymentsModule
                rows={recurringPayments}
                onAdd={addRecurringPayment}
                onUpdate={updateRecurringPayment}
                onDelete={(row) => requestConfirm(`Delete recurring payment — ${row.expenseName}?`, () => deleteRecurringPayment(row))}
              />
            )}
            {active === "barpurchase" && (
              <BarPurchaseModule
                rows={filterBranch(barPurchases)}
                onAdd={addBarPurchaseEntry}
                onDelete={(row) => requestConfirm(`Delete this bar purchase — ${row.vendor}, ${row.item} (${row.qty}${row.unit})? This will reduce Bar Stock back by the same qty.`, () => deleteBarPurchaseEntry(row))}
                vendors={vendors}
              />
            )}
            {active === "barstock" && <BarStockModule rows={fBarStock} />}
            {active === "barcosting" && <BarCostingModule rows={barCostingRows} onAddCocktail={addCocktail} onDeleteCocktail={(name) => requestConfirm(`Remove "${name}" from Cocktail/Mocktail Costing?`, () => deleteCocktail(name))} />}
            {active === "barwastage" && (
              <BarWastageModule rows={fBarWastage} onAdd={addBarWastageEntry} onDelete={(row) => requestConfirm(`Delete this bar wastage entry — ${row.item}, ${row.qty}${row.unit}, ${row.reason}? This will add the qty back to Bar Stock.`, () => deleteBarWastageEntry(row))} />
            )}
            {active === "cutlery" && (
              <CutleryModule
                rows={fCutlery}
                onAdd={addCutleryItem}
                onUpdateCount={updateCutleryCount}
                onDelete={(row) => requestConfirm(`Remove "${row.item}" from Cutlery & Crockery?`, () => deleteCutleryItem(row))}
              />
            )}
            {active === "settings" && (
              <SettingsModule ownerEmail={ownerEmail} setOwnerEmail={setOwnerEmail} notifyOn={notifyOn} setNotifyOn={setNotifyOn} activity={activity} backendUrl={backendUrl} setBackendUrl={setBackendUrl} backendStatus={backendStatus} restaurantName={restaurantName} setRestaurantName={setRestaurantName} branches={BRANCHES.slice(1)} onAddBranch={addBranch} onClearDemoData={() => requestConfirm("Clear all demo purchases, wastage, indents, bar purchases, recurring payments, and reset stock to 0? Item Master, vendors, and branches stay. This can't be undone.", clearDemoData)} onBackup={downloadFullBackup} onSendEmail={sendOwnerEmail} emailStatus={emailStatus} appPin={appPin} setAppPin={setAppPin} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function mergeBranchRows(fullPrev, editedSubset, branchFilter) {
  if (branchFilter === "All Branches") return editedSubset;
  const editedIds = new Set(editedSubset.map((r) => r.id));
  const untouched = fullPrev.filter((r) => r.branch !== branchFilter || !editedIds.has(r.id) && r.branch === branchFilter ? r.branch !== branchFilter : false);
  const kept = fullPrev.filter((r) => r.branch !== branchFilter);
  return [...kept, ...editedSubset];
}

/* ---------------------------------------------------------
   BRANCH PICKER
--------------------------------------------------------- */
function BranchPicker({ branch, setBranch, onAddBranch }) {
  const [open, setOpen] = useState(false);
  const [addingBranch, setAddingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setAddingBranch(false); } }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function saveBranch() {
    if (!newBranchName.trim()) return;
    onAddBranch(newBranchName.trim());
    setBranch(newBranchName.trim());
    setNewBranchName("");
    setAddingBranch(false);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2"
        style={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "8px 12px", background: "#fff", cursor: "pointer" }}>
        <Warehouse size={14} color={COLORS.paprika} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>{branch}</span>
        <ChevronDown size={14} color={COLORS.inkSoft} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, minWidth: 220, zIndex: 20, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
          {BRANCHES.map((b) => (
            <button key={b} onClick={() => { setBranch(b); setOpen(false); }}
              className="w-full text-left"
              style={{ padding: "9px 12px", fontSize: 14, border: "none", cursor: "pointer", background: b === branch ? COLORS.paperDim : "#fff", color: COLORS.ink }}>
              {b}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${COLORS.line}` }}>
            {!addingBranch ? (
              <button onClick={() => setAddingBranch(true)}
                className="w-full flex items-center gap-1 text-left"
                style={{ padding: "9px 12px", fontSize: 14, border: "none", cursor: "pointer", background: "#fff", color: COLORS.paprika, fontWeight: 500 }}>
                <Plus size={13} /> Add New Branch
              </button>
            ) : (
              <div className="p-2 flex gap-1">
                <input autoFocus value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveBranch()} placeholder="Branch name" style={{ ...selStyle, fontSize: 13.5, padding: "5px 7px" }} />
                <IconBtn title="Save" onClick={saveBranch}><Check size={13} /></IconBtn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   DASHBOARD
--------------------------------------------------------- */
function Dashboard({ totalPurchase, totalOutstanding, totalWastageLoss, totalSalesRevenue, lowStockCount, lowStockItems, salesByDay, wastageByReason, costing, activity, onReorder }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard code="TKT-01" label="Purchases (period)" value={`₹${totalPurchase.toLocaleString("en-IN")}`} tone="ink" />
        <StatCard code="TKT-07" label="Vendor Outstanding" value={`₹${totalOutstanding.toLocaleString("en-IN")}`} tone="paprika" />
        <StatCard code="TKT-02" label="Low Stock Items" value={lowStockCount} tone={lowStockCount ? "amber" : "sage"} />
        <StatCard code="TKT-05" label="Wastage Loss (est.)" value={`₹${totalWastageLoss.toLocaleString("en-IN")}`} tone="amber" />
        <StatCard code="TKT-06" label="Sales Revenue" value={`₹${totalSalesRevenue.toLocaleString("en-IN")}`} tone="sage" />
      </div>

      {lowStockItems.length > 0 && (
        <Ticket code="TKT-02 · ALERTS" label="Low Stock Alerts (Reorder Needed)">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Item</Th><Th>Branch</Th><Th right>Closing Stock</Th><Th right>Reorder Level</Th><Th></Th></tr></thead>
              <tbody>
                {lowStockItems.map((r) => (
                  <tr key={r.id}>
                    <Td bold>{r.item}</Td><Td>{r.branch}</Td>
                    <Td right mono color={COLORS.paprika} bold>{r.onHand} {r.unit}</Td>
                    <Td right mono>{r.reorderLevel} {r.unit}</Td>
                    <Td right>
                      <button onClick={() => onReorder(r)} className="flex items-center gap-1" style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "5px 10px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>
                        <TruckIcon size={12} /> Reorder
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Ticket>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          <Ticket code="TKT-06 · SALES TREND" label="Daily sales revenue, last 7 days">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesByDay}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} stroke={COLORS.inkSoft} />
                <YAxis tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} stroke={COLORS.inkSoft} />
                <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: 13, border: `1px solid ${COLORS.line}` }} />
                <Line type="monotone" dataKey="revenue" stroke={COLORS.paprika} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.paprika }} />
              </LineChart>
            </ResponsiveContainer>
          </Ticket>
        </div>
        <Ticket code="TKT-05 · BY REASON" label="Wastage loss breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={wastageByReason} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} label={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}>
                {wastageByReason.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </Ticket>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          <Ticket code="TKT-04 · MARGIN" label="Food costing snapshot">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={costing}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="dish" tick={{ fontSize: 11, fontFamily: "IBM Plex Sans" }} stroke={COLORS.inkSoft} interval={0} angle={-12} textAnchor="end" height={55} />
                <YAxis tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} stroke={COLORS.inkSoft} />
                <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: 13 }} />
                <Bar dataKey="cost" fill={COLORS.amber} name="Cost ₹" radius={[3, 3, 0, 0]} />
                <Bar dataKey="price" fill={COLORS.sage} name="Price ₹" radius={[3, 3, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </Ticket>
        </div>
        <Ticket code="TKT-08 · ACTIVITY" label="Recent changes → owner mail">
          <div style={{ maxHeight: 200, overflowY: "auto" }} className="space-y-2">
            {activity.slice(0, 6).map((a) => (
              <div key={a.id} style={{ borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 6 }}>
                <div style={{ fontSize: 13, color: COLORS.ink }}>{a.text}</div>
                <div className="flex items-center gap-1 mt-0.5" style={{ fontSize: 11.5, color: COLORS.inkSoft, fontFamily: "IBM Plex Mono" }}>
                  <span>{a.ts}</span>
                  {a.mailed && <span style={{ color: COLORS.sage }}>· ✉ mailed</span>}
                </div>
              </div>
            ))}
          </div>
        </Ticket>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PURCHASE + VENDOR PAYMENTS MODULE
--------------------------------------------------------- */
function PurchaseModule({ rows, onAdd, onDelete, vendors, onAddVendor, items, onAddItem, prefill, onConsumePrefill }) {
  const [showForm, setShowForm] = useState(false);
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newItem, setNewItem] = useState({ name: "", unit: "Kg", cost: 0, department: "Kitchen", category: "Misc", supplier: "" });
  const [draft, setDraft] = useState(blankPurchase());

  useEffect(() => {
    if (prefill) {
      setDraft((d) => ({ ...d, ...prefill, qty: 1 }));
      setShowForm(true);
      onConsumePrefill();
    }
  }, [prefill]);

  function blankPurchase() {
    const first = items[0];
    return { branch: BRANCHES[1], vendor: vendors[0] || "", item: first?.name || "", unit: first?.unit || "kg", qty: 1, rate: first?.cost || 0, invoiceNo: "", gstPercent: 5, billDate: todayISO(), paidStatus: "Unpaid", paidAmount: 0, payMode: "—", payDate: "—" };
  }

  function addRow() {
    onAdd(draft);
    setDraft(blankPurchase());
    setShowForm(false);
  }

  function removeRow(row, label) {
    onDelete(row, label);
  }

  const lastPurchaseForItem = useMemo(() => {
    const matches = rows.filter((r) => r.item === draft.item).sort((a, b) => (a.billDate < b.billDate ? 1 : -1));
    return matches[0] || null;
  }, [rows, draft.item]);
  const priceSpikePct = lastPurchaseForItem && lastPurchaseForItem.rate > 0 ? Math.round(((draft.rate - lastPurchaseForItem.rate) / lastPurchaseForItem.rate) * 100) : 0;
  const showPriceSpike = lastPurchaseForItem && priceSpikePct >= 15;

  function saveNewVendor() {
    if (!newVendorName.trim()) return;
    onAddVendor(newVendorName.trim());
    setDraft((d) => ({ ...d, vendor: newVendorName.trim() }));
    setNewVendorName("");
    setShowNewVendor(false);
  }

  function saveNewItem() {
    if (!newItem.name.trim()) return;
    onAddItem(newItem.name.trim(), newItem.unit, newItem.cost, newItem.department, newItem.category, newItem.supplier);
    setDraft((d) => ({ ...d, item: newItem.name.trim(), unit: newItem.unit, rate: Number(newItem.cost) || 0 }));
    setNewItem({ name: "", unit: "kg", cost: 0 });
    setShowNewItem(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button onClick={() => setShowNewItem((s) => !s)}
          className="flex items-center gap-2"
          style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer", color: COLORS.ink }}>
          <Plus size={14} /> Add Item
        </button>
        <button onClick={() => setShowNewVendor((s) => !s)}
          className="flex items-center gap-2"
          style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer", color: COLORS.ink }}>
          <Plus size={14} /> Add Vendor
        </button>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2"
          style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> New Purchase Entry
        </button>
      </div>

      {showNewItem && (
        <Ticket code="ITEM MASTER" label="Add a new purchase item">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ maxWidth: 780 }}>
            <Field label="Item Name"><input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g., Coconut" style={selStyle} /></Field>
            <Field label="Department"><select value={newItem.department} onChange={(e) => setNewItem({ ...newItem, department: e.target.value })} style={selStyle}><option>Kitchen</option><option>Bar</option><option>Office Items</option><option>Stationery Items</option></select></Field>
            <Field label="Category"><input value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} placeholder="e.g., Powders & Spices" style={selStyle} /></Field>
            <Field label="Unit"><select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} style={selStyle}><option>Kg</option><option>g</option><option>Ltr</option><option>ml</option><option>Pcs</option><option>Bags</option><option>Packets</option><option>Bottles</option><option>Tins</option><option>Cans</option><option>Box</option></select></Field>
            <Field label="Standard Cost (₹/unit)"><input type="number" value={newItem.cost} onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })} style={selStyle} /></Field>
            <Field label="Preferred Supplier"><input value={newItem.supplier} onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })} placeholder="optional" style={selStyle} /></Field>
            <div className="flex items-end gap-2">
              <button onClick={saveNewItem} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer", height: 34 }}><Check size={14} /> Save</button>
              <button onClick={() => setShowNewItem(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer", height: 34 }}><X size={14} /> Cancel</button>
            </div>
          </div>
        </Ticket>
      )}

      {showNewVendor && (
        <Ticket code="NEW VENDOR" label="Add a new vendor / supplier">
          <div className="flex gap-2 items-end" style={{ maxWidth: 420 }}>
            <Field label="Vendor Name">
              <input value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} placeholder="e.g., Nizam Poultry Farm" style={selStyle} />
            </Field>
            <button onClick={saveNewVendor} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer", height: 34 }}><Check size={14} /> Save</button>
            <button onClick={() => { setShowNewVendor(false); setNewVendorName(""); }} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer", height: 34 }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}

      {showForm && (
        <Ticket code="NEW ENTRY" label="Add purchase bill">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Branch"><select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} style={selStyle}>{BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Vendor"><SearchableSelect options={vendors} value={draft.vendor} onSelect={(v) => setDraft({ ...draft, vendor: v })} placeholder="Type to search vendor… (starts with)" getLabel={(v) => v} /></Field>
            <Field label="Item"><ItemPicker items={items} value={draft.item} listId="purchase-items" onSelect={(it) => setDraft({ ...draft, item: it.name, unit: it.unit, rate: it.cost || draft.rate })} /></Field>
            <Field label="Invoice No"><input value={draft.invoiceNo} onChange={(e) => setDraft({ ...draft, invoiceNo: e.target.value })} placeholder="e.g., INV-2451" style={selStyle} /></Field>
            <Field label="Bill Date"><input type="date" value={draft.billDate} onChange={(e) => setDraft({ ...draft, billDate: e.target.value })} style={selStyle} /></Field>
            <Field label={`Qty (${draft.unit})`}><input type="number" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: +e.target.value })} style={selStyle} /></Field>
            <Field label="Rate (₹, Excl. GST)"><input type="number" value={draft.rate} onChange={(e) => setDraft({ ...draft, rate: +e.target.value })} style={selStyle} /></Field>
            <Field label="GST %"><select value={draft.gstPercent} onChange={(e) => setDraft({ ...draft, gstPercent: +e.target.value })} style={selStyle}><option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option></select></Field>
            <Field label="Total (Incl. GST)"><input readOnly value={`₹${Math.round(draft.qty * draft.rate * (1 + draft.gstPercent / 100)).toLocaleString("en-IN")}`} style={{ ...selStyle, background: COLORS.paperDim, color: COLORS.inkSoft }} /></Field>
            <Field label="Payment Status"><select value={draft.paidStatus} onChange={(e) => setDraft({ ...draft, paidStatus: e.target.value })} style={selStyle}><option>Unpaid</option><option>Partial</option><option>Paid</option></select></Field>
            <Field label="Paid Amount (₹)"><input type="number" value={draft.paidAmount} onChange={(e) => setDraft({ ...draft, paidAmount: +e.target.value })} style={selStyle} /></Field>
            <Field label="Payment Mode"><select value={draft.payMode} onChange={(e) => setDraft({ ...draft, payMode: e.target.value })} style={selStyle}><option>—</option>{PAY_MODES.map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field label="Payment Date"><input type="date" value={draft.payDate === "—" ? "" : draft.payDate} onChange={(e) => setDraft({ ...draft, payDate: e.target.value })} style={selStyle} /></Field>
          </div>
          {showPriceSpike && (
            <div className="flex items-center gap-2" style={{ background: "#FBF1DF", border: `1px solid ${COLORS.amber}`, borderRadius: 4, padding: "8px 12px", marginTop: 10, fontSize: 13.5, color: "#8A611C" }}>
              <AlertTriangle size={14} />
              <span>Rate is <b>{priceSpikePct}% higher</b> than the last purchase of {draft.item} (₹{lastPurchaseForItem.rate} on {lastPurchaseForItem.billDate}, from {lastPurchaseForItem.vendor}). Worth double-checking with the vendor.</span>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <button onClick={addRow} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save Entry</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}
      <ExportBar filename="purchase_inventory_report" rows={rows} title="Purchase Inventory Report" />
      <Ticket code="TKT-01" label="Purchase Inventory Report">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Invoice No</Th><Th>Branch</Th><Th>Vendor</Th><Th>Item</Th><Th right>Qty</Th><Th right>Rate (Excl.)</Th><Th right>GST %</Th><Th right>Total (Incl.)</Th><Th>Bill Date</Th><Th>Status</Th><Th right>Balance</Th><Th>Mode</Th><Th>Pay Date</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td mono>{r.invoiceNo || "—"}</Td>
                  <Td>{r.branch}</Td><Td>{r.vendor}</Td><Td>{r.item}</Td>
                  <Td right mono>{r.qty} {r.unit}</Td><Td right mono>₹{r.rate}</Td>
                  <Td right mono>{r.gstPercent ?? 0}%</Td>
                  <Td right mono bold>₹{(r.totalAmount ?? r.amount).toLocaleString("en-IN")}</Td>
                  <Td mono>{r.billDate}</Td>
                  <Td><Badge tone={r.paidStatus === "Paid" ? "sage" : r.paidStatus === "Partial" ? "amber" : "paprika"}>{r.paidStatus}</Badge></Td>
                  <Td right mono color={r.balance > 0 ? COLORS.paprika : COLORS.inkSoft}>₹{r.balance.toLocaleString("en-IN")}</Td>
                  <Td>{r.payMode}</Td><Td mono>{r.payDate}</Td>
                  <Td><IconBtn title="Delete" onClick={() => removeRow(r, `${r.vendor} – ${r.item}`)}><Trash2 size={13} /></IconBtn></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 3, fontFamily: "'IBM Plex Mono', monospace" }}>{label}</div>
      {children}
    </div>
  );
}
const selStyle = { width: "100%", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 8px", fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", background: "#fff" };

/* ---------------------------------------------------------
   ITEM MASTER MODULE — view/search/edit/delete + price history
--------------------------------------------------------- */
function ItemMasterModule({ items, priceHistory, onUpdate, onDelete }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [editingName, setEditingName] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  const categories = useMemo(() => ["All Categories", ...Array.from(new Set(items.map((i) => i.category || "Misc"))).sort()], [items]);
  const departments = useMemo(() => ["All Departments", ...Array.from(new Set(items.map((i) => i.department || "Kitchen"))).sort()], [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matchesSearch = !q || i.name.toLowerCase().startsWith(q) || (i.category || "").toLowerCase().startsWith(q) || (i.department || "").toLowerCase().startsWith(q);
      const matchesCategory = categoryFilter === "All Categories" || (i.category || "Misc") === categoryFilter;
      const matchesDept = deptFilter === "All Departments" || (i.department || "Kitchen") === deptFilter;
      return matchesSearch && matchesCategory && matchesDept;
    });
  }, [items, search, categoryFilter, deptFilter]);

  function startEdit(item) {
    setEditingName(item.name);
    setEditDraft({ ...item });
  }
  function saveEdit() {
    onUpdate(editingName, editDraft);
    setEditingName(null);
    setEditDraft(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search item, category, or department…" style={{ ...selStyle, maxWidth: 300, width: "auto", flex: "1 1 220px" }} />
        <select value={departments.includes(deptFilter) ? deptFilter : "All Departments"} onChange={(e) => setDeptFilter(e.target.value)} style={{ ...selStyle, maxWidth: 180, width: "auto" }}>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={categories.includes(categoryFilter) ? categoryFilter : "All Categories"} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...selStyle, maxWidth: 220, width: "auto" }}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span style={{ fontSize: 12.5, color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{filtered.length} of {items.length} items</span>
      </div>

      <ExportBar filename="item_master" rows={items} title="Item Master" />
      <Ticket code="TKT-14" label="Item Master — catalog, cost & supplier">
        <div style={{ overflowX: "auto", maxHeight: 460, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Item Name</Th><Th>Department</Th><Th>Category</Th><Th>Unit</Th><Th right>Cost (₹)</Th><Th>Supplier</Th><Th></Th></tr></thead>
            <tbody>
              {filtered.map((it) => (
                editingName === it.name ? (
                  <tr key={it.name} style={{ background: COLORS.paperDim }}>
                    <Td><input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }} /></Td>
                    <Td>
                      <select value={editDraft.department} onChange={(e) => setEditDraft({ ...editDraft, department: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }}>
                        <option>Kitchen</option><option>Bar</option><option>Office Items</option><option>Stationery Items</option>
                      </select>
                    </Td>
                    <Td><input value={editDraft.category} onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }} /></Td>
                    <Td><input value={editDraft.unit} onChange={(e) => setEditDraft({ ...editDraft, unit: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5, width: 70 }} /></Td>
                    <Td right><input type="number" value={editDraft.cost} onChange={(e) => setEditDraft({ ...editDraft, cost: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5, width: 80, textAlign: "right" }} /></Td>
                    <Td><input value={editDraft.supplier || ""} onChange={(e) => setEditDraft({ ...editDraft, supplier: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }} /></Td>
                    <Td>
                      <div className="flex gap-1">
                        <IconBtn title="Save" onClick={saveEdit}><Check size={13} /></IconBtn>
                        <IconBtn title="Cancel" onClick={() => { setEditingName(null); setEditDraft(null); }}><X size={13} /></IconBtn>
                      </div>
                    </Td>
                  </tr>
                ) : (
                  <tr key={it.name}>
                    <Td bold>{it.name}</Td>
                    <Td>{it.department || "—"}</Td>
                    <Td>{it.category || "—"}</Td>
                    <Td mono>{it.unit}</Td>
                    <Td right mono>₹{it.cost}</Td>
                    <Td>{it.supplier || "—"}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <IconBtn title="Edit" onClick={() => startEdit(it)}><Pencil size={13} /></IconBtn>
                        <IconBtn title="Delete" onClick={() => onDelete(it.name)}><Trash2 size={13} /></IconBtn>
                      </div>
                    </Td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>

      {priceHistory.length > 0 && (
        <>
          <ExportBar filename="item_price_history" rows={priceHistory} title="Item Price Change History" />
          <Ticket code="PRICE TRACKING" label="Price Change History — standard cost edits over time">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th>Item</Th><Th right>Old Cost</Th><Th right>New Cost</Th><Th right>Change</Th><Th>Date</Th></tr></thead>
                <tbody>
                  {priceHistory.map((p) => (
                    <tr key={p.id}>
                      <Td bold>{p.item}</Td>
                      <Td right mono>₹{p.oldCost}</Td>
                      <Td right mono>₹{p.newCost}</Td>
                      <Td right mono bold color={p.changePct > 0 ? COLORS.paprika : p.changePct < 0 ? COLORS.sage : COLORS.inkSoft}>{p.changePct > 0 ? "+" : ""}{p.changePct}%</Td>
                      <Td mono>{p.date}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Ticket>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   STOCK MODULE
--------------------------------------------------------- */
function StockModule({ rows, onSetPhysicalCount, items, itemCostMap, purchases, indents }) {
  const itemDeptMap = useMemo(() => Object.fromEntries(items.map((i) => [i.name, i.department || "—"])), [items]);

  const purchasedQtyMap = useMemo(() => {
    const map = {};
    purchases.forEach((p) => { const k = p.branch + "|" + p.item; map[k] = (map[k] || 0) + p.qty; });
    return map;
  }, [purchases]);

  const indentedQtyMap = useMemo(() => {
    const map = {};
    indents.forEach((ind) => { const k = ind.branch + "|" + ind.item; map[k] = (map[k] || 0) + ind.qty; });
    return map;
  }, [indents]);

  const enriched = rows.map((r) => {
    const key = r.branch + "|" + r.item;
    const totalPurchases = purchasedQtyMap[key] || 0;
    const totalIndented = indentedQtyMap[key] || 0;
    const unitCost = itemCostMap[r.item] ?? ITEM_COST[r.item] ?? 0;
    const stockValue = Math.round(r.onHand * unitCost);
    const variance = r.physicalCount != null ? +(r.physicalCount - r.onHand).toFixed(2) : null;
    const avgDailyUsage = totalIndented / 30; // approximation: assumes indent history covers ~30 days
    const daysRemaining = avgDailyUsage > 0 ? Math.round(r.onHand / avgDailyUsage) : null;
    return { ...r, department: itemDeptMap[r.item] || "—", totalPurchases, totalIndented, unitCost, stockValue, variance, daysRemaining };
  });

  const exportRows = enriched.map((r) => ({
    itemName: r.item, branch: r.branch, department: r.department, uom: r.unit, openingStock: r.openingStock ?? 0,
    totalPurchases: r.totalPurchases, totalIndented: r.totalIndented, inHandStock: r.onHand, daysRemaining: r.daysRemaining ?? "",
    physicalCount: r.physicalCount ?? "", variance: r.variance ?? "", unitCost: r.unitCost,
    totalStockValue: r.stockValue, parLevel: r.reorderLevel, status: r.status,
  }));

  return (
    <div className="space-y-3">
      <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6 }}>
        In Hand Stock = Opening Stock + Total Purchases − Total Indented (system-calculated). Enter a Physical Count during a stock take to reconcile; Variance = Physical Count − In Hand Stock.
        <br />Days Remaining is estimated from average daily usage (Total Indented ÷ 30) — treat it as a guide, not an exact countdown.
      </div>
      <ExportBar filename="stock_inventory_report" rows={exportRows} title="Stock Inventory Report" />
      <Ticket code="TKT-02" label="Stock Inventory Report">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <Th>Item Name</Th><Th>Branch</Th><Th>Department</Th><Th>UOM</Th>
              <Th right>Opening Stock</Th><Th right>Total Purchases</Th><Th right>Total Indented</Th>
              <Th right>In Hand Stock</Th><Th right>Days Remaining</Th><Th right>Physical Count</Th><Th right>Variance</Th>
              <Th right>Unit Cost</Th><Th right>Total Stock Value</Th><Th right>PAR Level</Th><Th>Status</Th>
            </tr></thead>
            <tbody>
              {enriched.map((r) => (
                <tr key={r.id}>
                  <Td bold>{r.item}</Td>
                  <Td>{r.branch}</Td>
                  <Td>{r.department}</Td>
                  <Td mono>{r.unit}</Td>
                  <Td right mono>{r.openingStock ?? 0}</Td>
                  <Td right mono color={COLORS.sage}>{r.totalPurchases}</Td>
                  <Td right mono color={COLORS.paprika}>{r.totalIndented}</Td>
                  <Td right mono bold>{r.onHand}</Td>
                  <Td right mono bold color={r.daysRemaining == null ? COLORS.inkSoft : r.daysRemaining < 7 ? COLORS.paprika : r.daysRemaining < 14 ? COLORS.amber : COLORS.sage}>
                    {r.daysRemaining == null ? "—" : `${r.daysRemaining}d`}
                  </Td>
                  <Td right>
                    <input
                      type="number"
                      placeholder="—"
                      defaultValue={r.physicalCount ?? ""}
                      onBlur={(e) => onSetPhysicalCount(r.id, e.target.value)}
                      style={{ width: 72, textAlign: "right", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "4px 6px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13.5 }}
                    />
                  </Td>
                  <Td right mono bold color={r.variance == null ? COLORS.inkSoft : r.variance === 0 ? COLORS.sage : COLORS.paprika}>
                    {r.variance == null ? "—" : (r.variance > 0 ? "+" : "") + r.variance}
                  </Td>
                  <Td right mono>₹{r.unitCost}</Td>
                  <Td right mono>₹{r.stockValue.toLocaleString("en-IN")}</Td>
                  <Td right mono>{r.reorderLevel}</Td>
                  <Td><Badge tone={r.status === "Low" ? "paprika" : "sage"}>{r.status === "Low" ? "REORDER" : "AVAILABLE"}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   STORE / BRANCH-WISE MODULE
--------------------------------------------------------- */
function StoreModule({ stock, itemCostMap, onSendEmail, emailStatus, restaurantName, ownerEmail }) {
  const valueOf = (r) => r.onHand * (itemCostMap[r.item] ?? ITEM_COST[r.item] ?? 0);
  const grandTotalValue = stock.reduce((s, r) => s + valueOf(r), 0);

  const byBranch = BRANCHES.slice(1).map((b) => {
    const items = stock.filter((r) => r.branch === b);
    const totalUnits = items.reduce((s, r) => s + r.onHand, 0);
    const low = items.filter((r) => r.status === "Low").length;
    const currentValue = items.reduce((s, r) => s + valueOf(r), 0);
    return { branch: b, items, totalUnits, low, currentValue };
  });
  const exportRows = stock.map((r) => ({ branch: r.branch, item: r.item, onHand: r.onHand, unit: r.unit, unitCost: itemCostMap[r.item] ?? ITEM_COST[r.item] ?? 0, physicalCount: r.physicalCount ?? "", stockValue: Math.round(valueOf(r)), status: r.status }));

  const now = new Date();
  const monthName = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }); // e.g. "August 2026"
  const monthTitle = `${monthName} Store Inventory and Stock Value`;
  const monthFilename = monthTitle.replace(/\s+/g, "_");
  const uncounted = stock.filter((r) => r.physicalCount == null).length;

  function emailSummary() {
    const lines = byBranch.map((b) => `${b.branch}: ₹${b.currentValue.toLocaleString("en-IN")} (${b.totalUnits} units, ${b.low} low-stock items)`).join("\n");
    onSendEmail(
      `${restaurantName} — ${monthTitle}`,
      `Total Stock Value (all branches): ₹${grandTotalValue.toLocaleString("en-IN")}\n\nBy branch:\n${lines}\n\n${uncounted > 0 ? `Note: ${uncounted} item(s) still need a physical count.` : "All items have a physical count on record."}`
    );
  }

  return (
    <div className="space-y-4">
      <StatCard code="TKT-03" label="Total Stock Value (all branches)" value={`₹${grandTotalValue.toLocaleString("en-IN")}`} tone="paprika" />

      <Ticket code="MONTHLY STOCK TAKE" label={monthTitle}>
        <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 10 }}>
          Do a physical count for every item (Stock Inventory → Physical Count column) each month-end, then send this snapshot to the owner.
          {uncounted > 0 && <span style={{ color: COLORS.paprika, fontWeight: 600 }}> {uncounted} item(s) still don't have a physical count entered.</span>}
        </div>
        <div className="flex gap-2 flex-wrap items-center mb-2">
          <button onClick={emailSummary} disabled={!onSendEmail} className="flex items-center gap-2" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            <Mail size={14} /> Email Summary to Owner
          </button>
          {emailStatus === "sending" && <Badge tone="amber">Sending…</Badge>}
          {emailStatus === "sent" && <Badge tone="sage">✓ Sent to {ownerEmail}</Badge>}
          {emailStatus === "error" && <Badge tone="paprika">⚠ Failed to send</Badge>}
          {emailStatus === "no-backend" && <Badge tone="ink">Connect Google Sheets Backend in Settings first</Badge>}
        </div>
        <ExportBar filename={monthFilename} rows={exportRows} title={monthTitle} />
      </Ticket>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {byBranch.map((b) => (
          <Ticket key={b.branch} code="TKT-03" label={b.branch}>
            <div className="flex justify-between items-baseline mb-2">
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 23, fontWeight: 600 }}>{b.totalUnits}</span>
              <span style={{ fontSize: 12, color: COLORS.inkSoft }}>units on hand</span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: COLORS.sage, marginBottom: 6 }}>
              ₹{b.currentValue.toLocaleString("en-IN")} <span style={{ fontSize: 11.5, color: COLORS.inkSoft, fontWeight: 400 }}>current stock value</span>
            </div>
            <Badge tone={b.low ? "amber" : "sage"}>{b.low} low-stock items</Badge>
          </Ticket>
        ))}
      </div>
      <ExportBar filename="branch_inventory_report" rows={exportRows} title="Branch-wise Inventory Report" />
      <Ticket code="TKT-03" label="Branch-wise Inventory Report — full breakdown">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Branch</Th><Th>Item</Th><Th right>On Hand</Th><Th right>Unit Cost</Th><Th right>Stock Value</Th><Th>Status</Th></tr></thead>
            <tbody>
              {stock.map((r) => (
                <tr key={r.id}>
                  <Td>{r.branch}</Td><Td>{r.item}</Td><Td right mono>{r.onHand} {r.unit}</Td>
                  <Td right mono>₹{itemCostMap[r.item] ?? ITEM_COST[r.item] ?? 0}</Td>
                  <Td right mono bold>₹{valueOf(r).toLocaleString("en-IN")}</Td>
                  <Td><Badge tone={r.status === "Low" ? "paprika" : "sage"}>{r.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   FOOD COSTING MODULE
--------------------------------------------------------- */
function RecipeBuilder({ ingredientOptions, getLabel, recipe, setRecipe }) {
  function addLine() { setRecipe([...recipe, ["", 0]]); }
  function updateItem(i, name) { const next = [...recipe]; next[i] = [name, next[i][1]]; setRecipe(next); }
  function updateQty(i, qty) { const next = [...recipe]; next[i] = [next[i][0], qty]; setRecipe(next); }
  function removeLine(i) { setRecipe(recipe.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      {recipe.map((line, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div style={{ flex: 2 }}>
            <SearchableSelect options={ingredientOptions} value={line[0]} onSelect={(opt) => updateItem(i, getLabel(opt))} placeholder="Ingredient (starts with)…" getLabel={getLabel} />
          </div>
          <input type="number" step="0.01" value={line[1]} onChange={(e) => updateQty(i, +e.target.value)} placeholder="Qty/serving" style={{ ...selStyle, width: 110 }} />
          <IconBtn title="Remove" onClick={() => removeLine(i)}><X size={13} /></IconBtn>
        </div>
      ))}
      <button type="button" onClick={addLine} className="flex items-center gap-1" style={{ fontSize: 12.5, color: COLORS.sage, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
        <Plus size={13} /> Add Ingredient
      </button>
    </div>
  );
}

function CostingModule({ rows, sales, items, onAddDish, onDeleteDish }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [recipe, setRecipe] = useState([["", 0]]);

  function saveDish() {
    const cleanRecipe = recipe.filter(([n, q]) => n && q > 0);
    if (!name.trim() || cleanRecipe.length === 0) return;
    onAddDish(name, price, cleanRecipe);
    setName(""); setPrice(0); setRecipe([["", 0]]);
    setShowForm(false);
  }

  const matrix = useMemo(() => {
    const qtyByDish = {};
    sales.forEach((s) => { qtyByDish[s.dish] = (qtyByDish[s.dish] || 0) + s.qty; });
    const withQty = rows.map((r) => ({ ...r, qtySold: qtyByDish[r.dish] || 0 }));
    const margins = withQty.map((r) => r.margin).sort((a, b) => a - b);
    const qtys = withQty.map((r) => r.qtySold).sort((a, b) => a - b);
    const median = (arr) => arr.length ? arr[Math.floor(arr.length / 2)] : 0;
    const medMargin = median(margins);
    const medQty = median(qtys);
    return withQty.map((r) => {
      const highMargin = r.margin >= medMargin;
      const highQty = r.qtySold >= medQty;
      let quadrant = "Dog";
      if (highMargin && highQty) quadrant = "Star";
      else if (highMargin && !highQty) quadrant = "Puzzle";
      else if (!highMargin && highQty) quadrant = "Plow Horse";
      return { ...r, quadrant };
    });
  }, [rows, sales]);

  const quadrantTone = { Star: "sage", Puzzle: "amber", "Plow Horse": "ink", Dog: "paprika" };
  const quadrantNote = {
    Star: "High margin + high sales — promote it, protect the recipe cost.",
    Puzzle: "High margin but low sales — needs more visibility on the menu or a push from staff.",
    "Plow Horse": "Popular but thin margin — consider a small price rise or cheaper plating.",
    Dog: "Low margin + low sales — candidate to redesign or drop from the menu.",
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2" style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> Add Dish
        </button>
      </div>
      {showForm && (
        <Ticket code="NEW DISH" label="Add a dish with its recipe">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Field label="Dish Name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Chicken Biryani" style={selStyle} /></Field>
            <Field label="Menu Price (₹)"><input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} style={selStyle} /></Field>
          </div>
          <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 6 }}>Recipe — ingredient + quantity used per serving (matches your Item Master units):</div>
          <RecipeBuilder ingredientOptions={items} getLabel={(i) => (typeof i === "string" ? i : i.name)} recipe={recipe} setRecipe={setRecipe} />
          <div className="flex gap-2 mt-3">
            <button onClick={saveDish} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save Dish</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}
      <ExportBar filename="food_costing_report" rows={rows} title="Food Costing Report" />
      <Ticket code="TKT-04" label="Food Costing Report — recipe-based cost per dish">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Dish</Th><Th right>Ingredient Cost</Th><Th right>Menu Price</Th><Th right>Margin</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dish}>
                  <Td bold>{r.dish}</Td>
                  <Td right mono>₹{r.cost}</Td>
                  <Td right mono>₹{r.price}</Td>
                  <Td right mono bold color={r.margin > 55 ? COLORS.sage : r.margin > 40 ? COLORS.amber : COLORS.paprika}>{r.margin}%</Td>
                  <Td><IconBtn title="Delete" onClick={() => onDeleteDish(r.dish)}><Trash2 size={13} /></IconBtn></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>

      <Ticket code="MENU ENGINEERING" label="Menu Engineering Matrix — margin vs sales volume">
        <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 10, lineHeight: 1.6 }}>
          Splits dishes above/below the median on margin and sales volume — a classic restaurant strategy tool for deciding what to promote, reprice, or drop.
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Dish</Th><Th right>Margin</Th><Th right>Qty Sold</Th><Th>Category</Th></tr></thead>
            <tbody>
              {matrix.map((r) => (
                <tr key={r.dish}>
                  <Td bold>{r.dish}</Td>
                  <Td right mono>{r.margin}%</Td>
                  <Td right mono>{r.qtySold}</Td>
                  <Td><Badge tone={quadrantTone[r.quadrant]}>{r.quadrant}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {Object.entries(quadrantNote).map(([q, note]) => (
            <div key={q} style={{ fontSize: 12.5, color: COLORS.inkSoft, background: COLORS.paperDim, borderRadius: 4, padding: "6px 10px" }}>
              <b style={{ color: COLORS.ink }}>{q}:</b> {note}
            </div>
          ))}
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   WASTAGE MODULE
--------------------------------------------------------- */
function WastageModule({ rows, onAdd, onDelete, items }) {
  const [showForm, setShowForm] = useState(false);
  const first = items[0];
  const [draft, setDraft] = useState({ branch: BRANCHES[1], item: first?.name || "", unit: first?.unit || "kg", qty: 1, reason: "Spoilage", date: todayISO() });

  function addRow() {
    onAdd(draft);
    setShowForm(false);
  }
  function removeRow(row, label) {
    onDelete(row, label);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2"
          style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> Log Breakage / Wastage
        </button>
      </div>
      {showForm && (
        <Ticket code="NEW ENTRY" label="Log wastage / breakage">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Branch"><select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} style={selStyle}>{BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Item"><ItemPicker items={items} value={draft.item} listId="wastage-items" onSelect={(it) => setDraft({ ...draft, item: it.name, unit: it.unit })} /></Field>
            <Field label={`Qty (${draft.unit})`}><input type="number" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: +e.target.value })} style={selStyle} /></Field>
            <Field label="Reason"><select value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} style={selStyle}><option>Spoilage</option><option>Over-prep</option><option>Dropped/Breakage</option><option>Expired</option></select></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRow} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}
      <ExportBar filename="wastage_report" rows={rows} title="Breakage / Wastage Report" />
      <Ticket code="TKT-05" label="Breakage / Wastage Report">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Branch</Th><Th>Item</Th><Th right>Qty</Th><Th>Reason</Th><Th right>Est. Loss</Th><Th>Date</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td>{r.branch}</Td><Td>{r.item}</Td><Td right mono>{r.qty} {r.unit}</Td>
                  <Td><Badge tone="amber">{r.reason}</Badge></Td>
                  <Td right mono color={COLORS.paprika}>₹{r.estLoss}</Td><Td mono>{r.date}</Td>
                  <Td><IconBtn title="Delete" onClick={() => removeRow(r, `${r.item} – ${r.reason}`)}><Trash2 size={13} /></IconBtn></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   DAILY INDENT MODULE — Store to Kitchen/Bar internal movement
--------------------------------------------------------- */
function IndentModule({ rows, onAdd, onDelete, items, itemCostMap, restaurantName }) {
  const [showForm, setShowForm] = useState(false);
  const first = items[0];
  const [draft, setDraft] = useState({ branch: BRANCHES[1], item: first?.name || "", unit: first?.unit || "Kg", qty: 1, issuedTo: "Main Kitchen", department: "Kitchen", issuedBy: "", receivedBy: "", date: todayISO() });

  function addRow() {
    if (!draft.issuedBy.trim() || !draft.receivedBy.trim()) return;
    onAdd(draft);
    setShowForm(false);
  }
  function removeRow(row) {
    onDelete(row);
  }

  function printSlip(row) {
    const win = window.open("", "_blank", "width=380,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Indent Slip #${row.indentNo}</title>
      <style>
        body{font-family: 'Courier New', monospace; padding:18px; font-size:13px; color:#222;}
        h2{text-align:center; margin:0 0 2px 0; font-size:16px;}
        .sub{text-align:center; font-size:11px; color:#555; margin-bottom:10px;}
        .line{border-top:1px dashed #333; margin:10px 0;}
        table{width:100%; border-collapse:collapse;}
        td{padding:4px 0; font-size:12.5px;}
        td.r{text-align:right; font-weight:bold;}
        .sig{margin-top:26px; display:flex; justify-content:space-between; font-size:11px;}
      </style>
      </head><body>
      <h2>${restaurantName}</h2>
      <div class="sub">DAILY INDENT SLIP — Store &rarr; Kitchen/Bar</div>
      <div class="line"></div>
      <table>
        <tr><td>Indent #</td><td class="r">${row.indentNo}</td></tr>
        <tr><td>Date</td><td class="r">${row.date}</td></tr>
        <tr><td>Branch</td><td class="r">${row.branch}</td></tr>
      </table>
      <div class="line"></div>
      <table>
        <tr><td>Item</td><td class="r">${row.item}</td></tr>
        <tr><td>Qty</td><td class="r">${row.qty} ${row.unit}</td></tr>
        <tr><td>Issued To</td><td class="r">${row.issuedTo}</td></tr>
        <tr><td>Department</td><td class="r">${row.department}</td></tr>
      </table>
      <div class="line"></div>
      <div class="sig">
        <div>Issued By:<br/>${row.issuedBy}</div>
        <div>Received By:<br/>${row.receivedBy}</div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 200);
  }

  const totalIndentValue = rows.reduce((s, r) => s + (r.indentValue ?? r.qty * (itemCostMap[r.item] ?? ITEM_COST[r.item] ?? 0)), 0);

  return (
    <div className="space-y-4">
      <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6 }}>
        Records store-to-kitchen/bar movement (no money involved — this is <b>not</b> a sale). Reduces Store stock the moment it's saved.
      </div>
      <StatCard code="TKT-13" label="Total Indent Value (period)" value={`₹${totalIndentValue.toLocaleString("en-IN")}`} tone="paprika" />
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2"
          style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> New Indent
        </button>
      </div>
      {showForm && (
        <Ticket code="NEW ENTRY" label="Issue stock to Kitchen / Bar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="From Branch (Store)"><select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} style={selStyle}>{BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Item"><ItemPicker items={items} value={draft.item} listId="indent-items" onSelect={(it) => setDraft({ ...draft, item: it.name, unit: it.unit })} /></Field>
            <Field label={`Qty (${draft.unit})`}><input type="number" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: +e.target.value })} style={selStyle} /></Field>
            <Field label="Date"><input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} style={selStyle} /></Field>
            <Field label="Issued To"><select value={draft.issuedTo} onChange={(e) => setDraft({ ...draft, issuedTo: e.target.value })} style={selStyle}><option>Main Kitchen</option><option>Bar</option><option>Live Counter</option><option>Bakery</option></select></Field>
            <Field label="Department"><select value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} style={selStyle}><option>Kitchen</option><option>Bar</option><option>South Indian</option><option>Continental</option><option>Chinese</option></select></Field>
            <Field label="Issued By"><input value={draft.issuedBy} onChange={(e) => setDraft({ ...draft, issuedBy: e.target.value })} placeholder="Store manager name" style={selStyle} /></Field>
            <Field label="Received By"><input value={draft.receivedBy} onChange={(e) => setDraft({ ...draft, receivedBy: e.target.value })} placeholder="Kitchen/bar staff name" style={selStyle} /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRow} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save Indent</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}
      <ExportBar filename="daily_indent_report" rows={rows} title="Daily Indent Report" />
      <Ticket code="TKT-13" label="Daily Indent Report — Store → Kitchen/Bar">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Indent #</Th><Th>Date</Th><Th>Branch</Th><Th>Item</Th><Th right>Qty</Th><Th right>Unit Cost</Th><Th right>Indent Value</Th><Th>Issued To</Th><Th>Department</Th><Th>Issued By</Th><Th>Received By</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const unitCost = r.unitCost ?? itemCostMap[r.item] ?? ITEM_COST[r.item] ?? 0;
                const value = r.indentValue ?? Math.round(r.qty * unitCost);
                return (
                  <tr key={r.id}>
                    <Td mono>#{r.indentNo}</Td><Td mono>{r.date}</Td><Td>{r.branch}</Td><Td>{r.item}</Td>
                    <Td right mono bold>{r.qty} {r.unit}</Td>
                    <Td right mono>₹{unitCost}</Td>
                    <Td right mono bold color={COLORS.paprika}>₹{value.toLocaleString("en-IN")}</Td>
                    <Td>{r.issuedTo}</Td><Td>{r.department}</Td><Td>{r.issuedBy}</Td><Td>{r.receivedBy}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <IconBtn title="Print Slip" onClick={() => printSlip(r)}><Printer size={13} /></IconBtn>
                        <IconBtn title="Delete" onClick={() => removeRow(r)}><Trash2 size={13} /></IconBtn>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   SALES MODULE (sales + wastage correlation)
--------------------------------------------------------- */
function SalesModule({ rows, consumption, processed, onProcess, onReset, onAdd, onDelete, onImport }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ branch: BRANCHES[1], dish: DISHES[0]?.name || "", qty: 1, date: todayISO() });
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  function addRow() {
    onAdd(draft);
    setShowForm(false);
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      const rowsForImport = parsed.map((p) => ({ date: p.date, branch: p.branch, dish: p.dish || p.item, qty: p.qty }));
      const result = onImport(rowsForImport);
      setImportResult(result);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const byDish = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!map[r.dish]) map[r.dish] = { dish: r.dish, qty: 0, revenue: 0 };
      map[r.dish].qty += r.qty;
      map[r.dish].revenue += r.revenue;
    });
    return Object.values(map);
  }, [rows]);

  return (
    <div className="space-y-4">
      <Ticket code="IMPORT" label="Import Sales from CSV (e.g., daily POS export)">
        <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 10 }}>
          CSV needs columns: <b>date, branch, dish, qty</b> (header names, case-insensitive). Dish names must match Food Costing exactly for revenue to calculate — otherwise it imports at ₹0 and flags the mismatch.
        </div>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />
        <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <ClipboardList size={14} /> Upload Sales CSV
        </button>
        {importResult && (
          <div className="mt-2" style={{ fontSize: 12.5, color: importResult.unmatched.length ? COLORS.paprika : COLORS.sage }}>
            {importResult.imported} rows imported.{importResult.unmatched.length > 0 && ` Unmatched dish names: ${importResult.unmatched.join(", ")}`}
          </div>
        )}
      </Ticket>

      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2"
          style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> New Sale Entry
        </button>
      </div>
      {showForm && (
        <Ticket code="NEW ENTRY" label="Record a sale">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Branch"><select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} style={selStyle}>{BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Dish"><select value={draft.dish} onChange={(e) => setDraft({ ...draft, dish: e.target.value })} style={selStyle}>{DISHES.map((d) => <option key={d.name}>{d.name}</option>)}</select></Field>
            <Field label="Qty Sold"><input type="number" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: +e.target.value })} style={selStyle} /></Field>
            <Field label="Date"><input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} style={selStyle} /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRow} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}

      <Ticket code="AUTO-DEDUCT" label="Recipe-based stock deduction">
        <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 10, lineHeight: 1.6 }}>
          Uses each dish's recipe to work out how much of every ingredient the sales above should have used, then deducts that from Stock Inventory automatically.
        </div>
        {!processed ? (
          <button onClick={onProcess} className="flex items-center gap-2"
            style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            <Check size={14} /> Process Sales → Deduct Stock
          </button>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <Badge tone="sage">✓ Stock already deducted for this sales batch</Badge>
            <button onClick={onReset} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "6px 12px", fontSize: 13, cursor: "pointer", color: COLORS.inkSoft }}>
              <X size={12} /> Reset (demo only)
            </button>
          </div>
        )}
      </Ticket>

      <ExportBar filename="sales_by_dish" rows={byDish} title="Sales Report by Dish" />
      <Ticket code="TKT-06" label="Sales Report — by dish, last 7 days">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Dish</Th><Th right>Qty Sold</Th><Th right>Revenue</Th></tr></thead>
            <tbody>
              {byDish.map((r) => (
                <tr key={r.dish}><Td bold>{r.dish}</Td><Td right mono>{r.qty}</Td><Td right mono bold>₹{r.revenue.toLocaleString("en-IN")}</Td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>

      <ExportBar filename="ingredient_consumption_report" rows={consumption} title="Ingredient Consumption — Business vs Wastage" />
      <Ticket code="TKT-06/05" label="Ingredient Consumption — Business (Sales) vs Wastage">
        <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 10 }}>
          Every ingredient used, split by what went into a sold dish (business) vs what was lost (wastage).
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Item</Th><Th right>Used in Sales (Business)</Th><Th right>Wastage</Th><Th right>Total Consumed</Th><Th right>Wastage %</Th></tr></thead>
            <tbody>
              {consumption.map((r) => (
                <tr key={r.item}>
                  <Td bold>{r.item}</Td>
                  <Td right mono color={COLORS.sage}>{r.businessQty.toFixed(2)} {r.unit}</Td>
                  <Td right mono color={COLORS.paprika}>{r.wastageQty.toFixed(2)} {r.unit}</Td>
                  <Td right mono>{r.totalQty.toFixed(2)} {r.unit}</Td>
                  <Td right mono bold color={r.wastagePct > 15 ? COLORS.paprika : r.wastagePct > 5 ? COLORS.amber : COLORS.sage}>{r.wastagePct}%</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>

      <ExportBar filename="sales_daily_entries" rows={rows} title="Sales — Daily Entries" />
      <Ticket code="TKT-06" label="Daily entries">
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Date</Th><Th>Branch</Th><Th>Dish</Th><Th right>Qty</Th><Th right>Revenue</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td mono>{r.date}</Td><Td>{r.branch}</Td><Td>{r.dish}</Td><Td right mono>{r.qty}</Td><Td right mono>₹{r.revenue.toLocaleString("en-IN")}</Td>
                  <Td><IconBtn title="Delete" onClick={() => onDelete(r)}><Trash2 size={13} /></IconBtn></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   VENDOR PAYABLES MODULE
--------------------------------------------------------- */
function PayablesModule({ purchases }) {
  const [tab, setTab] = useState("overall");

  const byVendor = useMemo(() => {
    const map = {};
    purchases.forEach((r) => {
      if (!map[r.vendor]) map[r.vendor] = { vendor: r.vendor, billed: 0, paid: 0, balance: 0 };
      map[r.vendor].billed += (r.totalAmount ?? r.amount);
      map[r.vendor].paid += r.paidAmount;
      map[r.vendor].balance += r.balance;
    });
    return Object.values(map).sort((a, b) => b.balance - a.balance);
  }, [purchases]);

  // group by vendor + period ("YYYY-MM" for monthly, "YYYY" for yearly)
  function groupByPeriod(periodLen) {
    const map = {};
    purchases.forEach((r) => {
      const period = r.billDate.slice(0, periodLen);
      const key = r.vendor + "|" + period;
      if (!map[key]) map[key] = { vendor: r.vendor, period, billed: 0, paid: 0, balance: 0 };
      map[key].billed += (r.totalAmount ?? r.amount);
      map[key].paid += r.paidAmount;
      map[key].balance += r.balance;
    });
    return Object.values(map).sort((a, b) => (a.vendor + a.period > b.vendor + b.period ? 1 : -1));
  }
  const monthly = useMemo(() => groupByPeriod(7), [purchases]);
  const yearly = useMemo(() => groupByPeriod(4), [purchases]);

  const TABS = [
    { key: "overall", label: "Outstanding (Overall)" },
    { key: "monthly", label: "Monthly Outstanding" },
    { key: "yearly", label: "Yearly Outstanding" },
    { key: "business", label: "Yearly Business Volume" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 12px", fontSize: 13.5, fontWeight: 500, cursor: "pointer",
              background: tab === t.key ? COLORS.paprika : "#fff", color: tab === t.key ? "#fff" : COLORS.ink,
            }}>{t.label}</button>
        ))}
      </div>

      {tab === "overall" && (
        <>
        <ExportBar filename="vendor_payables_overall" rows={byVendor} title="Vendor Payables — Overall" />
        <Ticket code="TKT-07" label="Vendor Payables Report — outstanding balances (all time)">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Vendor</Th><Th right>Total Billed</Th><Th right>Total Paid</Th><Th right>Outstanding</Th></tr></thead>
              <tbody>
                {byVendor.map((v) => (
                  <tr key={v.vendor}>
                    <Td bold>{v.vendor}</Td>
                    <Td right mono>₹{v.billed.toLocaleString("en-IN")}</Td>
                    <Td right mono color={COLORS.sage}>₹{v.paid.toLocaleString("en-IN")}</Td>
                    <Td right mono bold color={v.balance > 0 ? COLORS.paprika : COLORS.inkSoft}>₹{v.balance.toLocaleString("en-IN")}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Ticket>
        </>
      )}

      {tab === "monthly" && (
        <>
        <ExportBar filename="vendor_payables_monthly" rows={monthly} title="Vendor Payables — Monthly" />
        <Ticket code="TKT-07" label="Monthly Outstanding — vendor-wise, by billing month">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Vendor</Th><Th>Month</Th><Th right>Billed</Th><Th right>Paid</Th><Th right>Outstanding</Th></tr></thead>
              <tbody>
                {monthly.map((v) => (
                  <tr key={v.vendor + v.period}>
                    <Td>{v.vendor}</Td><Td mono>{v.period}</Td>
                    <Td right mono>₹{v.billed.toLocaleString("en-IN")}</Td>
                    <Td right mono color={COLORS.sage}>₹{v.paid.toLocaleString("en-IN")}</Td>
                    <Td right mono bold color={v.balance > 0 ? COLORS.paprika : COLORS.inkSoft}>₹{v.balance.toLocaleString("en-IN")}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Ticket>
        </>
      )}

      {tab === "yearly" && (
        <>
        <ExportBar filename="vendor_payables_yearly" rows={yearly} title="Vendor Payables — Yearly" />
        <Ticket code="TKT-07" label="Yearly Outstanding — vendor-wise, by billing year">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Vendor</Th><Th>Year</Th><Th right>Billed</Th><Th right>Paid</Th><Th right>Outstanding</Th></tr></thead>
              <tbody>
                {yearly.map((v) => (
                  <tr key={v.vendor + v.period}>
                    <Td>{v.vendor}</Td><Td mono>{v.period}</Td>
                    <Td right mono>₹{v.billed.toLocaleString("en-IN")}</Td>
                    <Td right mono color={COLORS.sage}>₹{v.paid.toLocaleString("en-IN")}</Td>
                    <Td right mono bold color={v.balance > 0 ? COLORS.paprika : COLORS.inkSoft}>₹{v.balance.toLocaleString("en-IN")}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Ticket>
        </>
      )}

      {tab === "business" && (
        <>
        <ExportBar filename="vendor_business_volume_yearly" rows={yearly} title="Vendor Yearly Business Volume" />
        <Ticket code="TKT-07" label="Yearly Business Volume — total purchase business done with each vendor">
          <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 10 }}>
            Total billed amount per vendor per year — shows how much business each vendor has done with you over time.
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Vendor</Th><Th>Year</Th><Th right>Total Business (₹)</Th></tr></thead>
              <tbody>
                {yearly.map((v) => (
                  <tr key={v.vendor + v.period}>
                    <Td bold>{v.vendor}</Td><Td mono>{v.period}</Td>
                    <Td right mono bold color={COLORS.sage}>₹{v.billed.toLocaleString("en-IN")}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Ticket>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   RECURRING PAYMENTS MODULE — rent, salaries, utilities, AMC, licenses
--------------------------------------------------------- */
const EXPENSE_TYPES = ["Rent", "Salaries", "Electricity", "Water", "Internet/Phone", "AMC (Equipment)", "License/Permit", "Loan EMI", "Insurance", "Other"];

function RecurringPaymentsModule({ rows, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [draft, setDraft] = useState({ expenseName: "Shop Rent", expenseType: "Rent", branch: BRANCHES[1], amount: 0, frequency: "Monthly", dueDate: "2026-08-05", paidStatus: "Unpaid", paidAmount: 0, payMode: "—", payDate: "—" });

  const totalMonthlyFixed = rows.filter((r) => r.frequency === "Monthly").reduce((s, r) => s + Number(r.amount), 0);
  const totalOutstanding = rows.reduce((s, r) => s + (r.balance || 0), 0);

  function addRow() {
    if (!draft.expenseName.trim()) return;
    onAdd(draft);
    setDraft({ ...draft, expenseName: "", amount: 0, paidAmount: 0, paidStatus: "Unpaid" });
    setShowForm(false);
  }

  function startEdit(row) {
    setEditingId(row.id);
    setEditDraft({ ...row });
  }
  function saveEdit() {
    onUpdate(editingId, editDraft);
    setEditingId(null);
    setEditDraft(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard code="TKT-15" label="Total Monthly Fixed Cost" value={`₹${totalMonthlyFixed.toLocaleString("en-IN")}`} tone="ink" />
        <StatCard code="TKT-15" label="Outstanding (all recurring)" value={`₹${totalOutstanding.toLocaleString("en-IN")}`} tone="paprika" />
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2"
          style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> Add Recurring Payment
        </button>
      </div>

      {showForm && (
        <Ticket code="NEW ENTRY" label="Add recurring payment">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Expense Name"><input value={draft.expenseName} onChange={(e) => setDraft({ ...draft, expenseName: e.target.value })} placeholder="e.g., Shop Rent - Banjara Hills" style={selStyle} /></Field>
            <Field label="Expense Type"><select value={draft.expenseType} onChange={(e) => setDraft({ ...draft, expenseType: e.target.value })} style={selStyle}>{EXPENSE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Branch"><select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} style={selStyle}>{BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Frequency"><select value={draft.frequency} onChange={(e) => setDraft({ ...draft, frequency: e.target.value })} style={selStyle}><option>Monthly</option><option>Quarterly</option><option>Yearly</option><option>One-time</option></select></Field>
            <Field label="Amount (₹)"><input type="number" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: +e.target.value })} style={selStyle} /></Field>
            <Field label="Due Date"><input type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} style={selStyle} /></Field>
            <Field label="Payment Status"><select value={draft.paidStatus} onChange={(e) => setDraft({ ...draft, paidStatus: e.target.value })} style={selStyle}><option>Unpaid</option><option>Partial</option><option>Paid</option></select></Field>
            <Field label="Paid Amount (₹)"><input type="number" value={draft.paidAmount} onChange={(e) => setDraft({ ...draft, paidAmount: +e.target.value })} style={selStyle} /></Field>
            <Field label="Payment Mode"><select value={draft.payMode} onChange={(e) => setDraft({ ...draft, payMode: e.target.value })} style={selStyle}><option>—</option>{PAY_MODES.map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field label="Payment Date"><input type="date" value={draft.payDate === "—" ? "" : draft.payDate} onChange={(e) => setDraft({ ...draft, payDate: e.target.value })} style={selStyle} /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRow} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}

      <ExportBar filename="recurring_payments" rows={rows} title="Recurring Payments Report" />
      <Ticket code="TKT-15" label="Recurring Payments — rent, salaries, utilities, AMC, licenses">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Expense</Th><Th>Type</Th><Th>Branch</Th><Th>Frequency</Th><Th right>Amount</Th><Th>Due Date</Th><Th>Status</Th><Th right>Paid</Th><Th right>Balance</Th><Th>Mode</Th><Th>Pay Date</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                editingId === r.id ? (
                  <tr key={r.id} style={{ background: COLORS.paperDim }}>
                    <Td><input value={editDraft.expenseName} onChange={(e) => setEditDraft({ ...editDraft, expenseName: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }} /></Td>
                    <Td><select value={editDraft.expenseType} onChange={(e) => setEditDraft({ ...editDraft, expenseType: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }}>{EXPENSE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Td>
                    <Td><select value={editDraft.branch} onChange={(e) => setEditDraft({ ...editDraft, branch: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }}>{BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}</select></Td>
                    <Td><select value={editDraft.frequency} onChange={(e) => setEditDraft({ ...editDraft, frequency: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }}><option>Monthly</option><option>Quarterly</option><option>Yearly</option><option>One-time</option></select></Td>
                    <Td right><input type="number" value={editDraft.amount} onChange={(e) => setEditDraft({ ...editDraft, amount: +e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5, width: 80, textAlign: "right" }} /></Td>
                    <Td><input type="date" value={editDraft.dueDate} onChange={(e) => setEditDraft({ ...editDraft, dueDate: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }} /></Td>
                    <Td><select value={editDraft.paidStatus} onChange={(e) => setEditDraft({ ...editDraft, paidStatus: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }}><option>Unpaid</option><option>Partial</option><option>Paid</option></select></Td>
                    <Td right><input type="number" value={editDraft.paidAmount} onChange={(e) => setEditDraft({ ...editDraft, paidAmount: +e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5, width: 80, textAlign: "right" }} /></Td>
                    <Td right mono>₹{(editDraft.amount - editDraft.paidAmount).toLocaleString("en-IN")}</Td>
                    <Td><select value={editDraft.payMode} onChange={(e) => setEditDraft({ ...editDraft, payMode: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }}><option>—</option>{PAY_MODES.map((m) => <option key={m}>{m}</option>)}</select></Td>
                    <Td><input type="date" value={editDraft.payDate === "—" ? "" : editDraft.payDate} onChange={(e) => setEditDraft({ ...editDraft, payDate: e.target.value })} style={{ ...selStyle, padding: "4px 6px", fontSize: 13.5 }} /></Td>
                    <Td>
                      <div className="flex gap-1">
                        <IconBtn title="Save" onClick={saveEdit}><Check size={13} /></IconBtn>
                        <IconBtn title="Cancel" onClick={() => { setEditingId(null); setEditDraft(null); }}><X size={13} /></IconBtn>
                      </div>
                    </Td>
                  </tr>
                ) : (
                  <tr key={r.id}>
                    <Td bold>{r.expenseName}</Td>
                    <Td>{r.expenseType}</Td>
                    <Td>{r.branch}</Td>
                    <Td>{r.frequency}</Td>
                    <Td right mono bold>₹{Number(r.amount).toLocaleString("en-IN")}</Td>
                    <Td mono>{r.dueDate}</Td>
                    <Td><Badge tone={r.paidStatus === "Paid" ? "sage" : r.paidStatus === "Partial" ? "amber" : "paprika"}>{r.paidStatus}</Badge></Td>
                    <Td right mono color={COLORS.sage}>₹{Number(r.paidAmount).toLocaleString("en-IN")}</Td>
                    <Td right mono bold color={r.balance > 0 ? COLORS.paprika : COLORS.inkSoft}>₹{Number(r.balance).toLocaleString("en-IN")}</Td>
                    <Td>{r.payMode}</Td>
                    <Td mono>{r.payDate}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <IconBtn title="Edit" onClick={() => startEdit(r)}><Pencil size={13} /></IconBtn>
                        <IconBtn title="Delete" onClick={() => onDelete(r)}><Trash2 size={13} /></IconBtn>
                      </div>
                    </Td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   BAR INVENTORY MODULE
--------------------------------------------------------- */
/* ---------------------------------------------------------
   BAR PURCHASES MODULE
--------------------------------------------------------- */
function BarPurchaseModule({ rows, onAdd, onDelete, vendors }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ branch: BRANCHES[1], vendor: vendors[0] || "", item: BAR_ITEMS[0].name, unit: BAR_ITEMS[0].unit, qty: 1, rate: 0, invoiceNo: "", gstPercent: 18, billDate: todayISO(), paidStatus: "Unpaid", paidAmount: 0, payMode: "—", payDate: "—" });

  function addRow() {
    onAdd(draft);
    setDraft((d) => ({ ...d, qty: 1, rate: 0, invoiceNo: "", paidAmount: 0, paidStatus: "Unpaid" }));
    setShowForm(false);
  }
  function removeRow(row, label) {
    onDelete(row, label);
  }

  return (
    <div className="space-y-4">
      <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6 }}>
        Liquor bottles, mixers, and garnish purchased from licensed bar vendors. Each entry updates Bar Inventory (TKT-09) automatically.
      </div>
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2"
          style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> New Bar Purchase Entry
        </button>
      </div>
      {showForm && (
        <Ticket code="NEW ENTRY" label="Add bar purchase bill">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Branch"><select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} style={selStyle}>{BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Vendor"><SearchableSelect options={vendors} value={draft.vendor} onSelect={(v) => setDraft({ ...draft, vendor: v })} placeholder="Type to search vendor… (starts with)" getLabel={(v) => v} /></Field>
            <Field label="Item"><select value={draft.item} onChange={(e) => { const it = BAR_ITEMS.find((i) => i.name === e.target.value); setDraft({ ...draft, item: it.name, unit: it.unit }); }} style={selStyle}>{BAR_ITEMS.map((i) => <option key={i.name}>{i.name}</option>)}</select></Field>
            <Field label="Invoice No"><input value={draft.invoiceNo} onChange={(e) => setDraft({ ...draft, invoiceNo: e.target.value })} placeholder="e.g., BAR-INV-118" style={selStyle} /></Field>
            <Field label="Bill Date"><input type="date" value={draft.billDate} onChange={(e) => setDraft({ ...draft, billDate: e.target.value })} style={selStyle} /></Field>
            <Field label={`Qty (${draft.unit})`}><input type="number" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: +e.target.value })} style={selStyle} /></Field>
            <Field label="Rate (₹, Excl. GST)"><input type="number" value={draft.rate} onChange={(e) => setDraft({ ...draft, rate: +e.target.value })} style={selStyle} /></Field>
            <Field label="GST %"><select value={draft.gstPercent} onChange={(e) => setDraft({ ...draft, gstPercent: +e.target.value })} style={selStyle}><option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option><option value={28}>28%</option></select></Field>
            <Field label="Payment Status"><select value={draft.paidStatus} onChange={(e) => setDraft({ ...draft, paidStatus: e.target.value })} style={selStyle}><option>Unpaid</option><option>Partial</option><option>Paid</option></select></Field>
            <Field label="Paid Amount (₹)"><input type="number" value={draft.paidAmount} onChange={(e) => setDraft({ ...draft, paidAmount: +e.target.value })} style={selStyle} /></Field>
            <Field label="Payment Mode"><select value={draft.payMode} onChange={(e) => setDraft({ ...draft, payMode: e.target.value })} style={selStyle}><option>—</option>{PAY_MODES.map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field label="Payment Date"><input type="date" value={draft.payDate === "—" ? "" : draft.payDate} onChange={(e) => setDraft({ ...draft, payDate: e.target.value })} style={selStyle} /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRow} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save Entry</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}
      <ExportBar filename="bar_purchase_report" rows={rows} title="Bar Purchase Report" />
      <Ticket code="TKT-16" label="Bar Purchase Report">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Invoice No</Th><Th>Branch</Th><Th>Vendor</Th><Th>Item</Th><Th right>Qty</Th><Th right>Rate</Th><Th right>GST %</Th><Th right>Total (Incl.)</Th><Th>Bill Date</Th><Th>Status</Th><Th right>Balance</Th><Th>Mode</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td mono>{r.invoiceNo || "—"}</Td>
                  <Td>{r.branch}</Td><Td>{r.vendor}</Td><Td>{r.item}</Td>
                  <Td right mono>{r.qty} {r.unit}</Td><Td right mono>₹{r.rate}</Td>
                  <Td right mono>{r.gstPercent ?? 0}%</Td>
                  <Td right mono bold>₹{(r.totalAmount ?? r.amount).toLocaleString("en-IN")}</Td>
                  <Td mono>{r.billDate}</Td>
                  <Td><Badge tone={r.paidStatus === "Paid" ? "sage" : r.paidStatus === "Partial" ? "amber" : "paprika"}>{r.paidStatus}</Badge></Td>
                  <Td right mono color={r.balance > 0 ? COLORS.paprika : COLORS.inkSoft}>₹{r.balance.toLocaleString("en-IN")}</Td>
                  <Td>{r.payMode}</Td>
                  <Td><IconBtn title="Delete" onClick={() => removeRow(r, `${r.vendor} – ${r.item}`)}><Trash2 size={13} /></IconBtn></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

function BarStockModule({ rows }) {
  return (
    <div className="space-y-3">
      <ExportBar filename="bar_inventory_report" rows={rows} title="Bar Inventory Report" />
      <Ticket code="TKT-09" label="Bar Inventory Report — liquor, mixers & garnish stock">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Branch</Th><Th>Item</Th><Th right>On Hand</Th><Th right>Reorder Level</Th><Th>Status</Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td>{r.branch}</Td><Td>{r.item}</Td>
                  <Td right mono bold>{r.onHand} {r.unit}</Td>
                  <Td right mono>{r.reorderLevel} {r.unit}</Td>
                  <Td><Badge tone={r.status === "Low" ? "paprika" : "sage"}>{r.status === "Low" ? "Reorder now" : "OK"}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   COCKTAIL / MOCKTAIL COSTING MODULE
--------------------------------------------------------- */
function BarCostingModule({ rows, onAddCocktail, onDeleteCocktail }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Cocktail");
  const [price, setPrice] = useState(0);
  const [recipe, setRecipe] = useState([["", 0]]);

  function saveCocktail() {
    const cleanRecipe = recipe.filter(([n, q]) => n && q > 0);
    if (!name.trim() || cleanRecipe.length === 0) return;
    onAddCocktail(name, type, price, cleanRecipe);
    setName(""); setPrice(0); setRecipe([["", 0]]);
    setShowForm(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2" style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> Add Cocktail/Mocktail
        </button>
      </div>
      {showForm && (
        <Ticket code="NEW DRINK" label="Add a drink with its recipe">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <Field label="Drink Name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Mojito" style={selStyle} /></Field>
            <Field label="Type"><select value={type} onChange={(e) => setType(e.target.value)} style={selStyle}><option>Cocktail</option><option>Mocktail</option></select></Field>
            <Field label="Menu Price (₹)"><input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} style={selStyle} /></Field>
          </div>
          <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 6 }}>Recipe — liquor/mixer + quantity (ml/pcs) used per serving:</div>
          <RecipeBuilder ingredientOptions={BAR_ITEMS} getLabel={(i) => (typeof i === "string" ? i : i.name)} recipe={recipe} setRecipe={setRecipe} />
          <div className="flex gap-2 mt-3">
            <button onClick={saveCocktail} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save Drink</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}
      <ExportBar filename="cocktail_mocktail_costing_report" rows={rows} title="Cocktail / Mocktail Costing Report" />
      <Ticket code="TKT-10" label="Cocktail / Mocktail Costing Report — recipe-based cost per drink">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Drink</Th><Th>Type</Th><Th right>Ingredient Cost</Th><Th right>Menu Price</Th><Th right>Margin</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dish}>
                  <Td bold>{r.dish}</Td>
                  <Td><Badge tone={r.type === "Cocktail" ? "paprika" : "sage"}>{r.type}</Badge></Td>
                  <Td right mono>₹{r.cost}</Td>
                  <Td right mono>₹{r.price}</Td>
                  <Td right mono bold color={r.margin > 55 ? COLORS.sage : r.margin > 40 ? COLORS.amber : COLORS.paprika}>{r.margin}%</Td>
                  <Td><IconBtn title="Delete" onClick={() => onDeleteCocktail(r.dish)}><Trash2 size={13} /></IconBtn></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   BAR WASTAGE MODULE
--------------------------------------------------------- */
function BarWastageModule({ rows, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ branch: BRANCHES[1], item: BAR_ITEMS[0].name, unit: BAR_ITEMS[0].unit, qty: 30, reason: "Spillage", date: todayISO() });

  function addRow() {
    onAdd(draft);
    setShowForm(false);
  }
  function removeRow(row) {
    onDelete(row);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2"
          style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> Log Bar Wastage
        </button>
      </div>
      {showForm && (
        <Ticket code="NEW ENTRY" label="Log bar spillage / breakage">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Branch"><select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} style={selStyle}>{BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Item"><select value={draft.item} onChange={(e) => { const it = BAR_ITEMS.find((i) => i.name === e.target.value); setDraft({ ...draft, item: it.name, unit: it.unit }); }} style={selStyle}>{BAR_ITEMS.map((i) => <option key={i.name}>{i.name}</option>)}</select></Field>
            <Field label={`Qty (${draft.unit})`}><input type="number" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: +e.target.value })} style={selStyle} /></Field>
            <Field label="Reason"><select value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} style={selStyle}><option>Spillage</option><option>Over-pour</option><option>Broken Bottle</option><option>Expired Mixer</option></select></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRow} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}
      <ExportBar filename="bar_wastage_report" rows={rows} title="Bar Wastage Report" />
      <Ticket code="TKT-11" label="Bar Wastage Report">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Branch</Th><Th>Item</Th><Th right>Qty</Th><Th>Reason</Th><Th right>Est. Loss</Th><Th>Date</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td>{r.branch}</Td><Td>{r.item}</Td><Td right mono>{r.qty} {r.unit}</Td>
                  <Td><Badge tone="amber">{r.reason}</Badge></Td>
                  <Td right mono color={COLORS.paprika}>₹{r.estLoss}</Td><Td mono>{r.date}</Td>
                  <Td><IconBtn title="Delete" onClick={() => removeRow(r)}><Trash2 size={13} /></IconBtn></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   CUTLERY & CROCKERY MODULE
--------------------------------------------------------- */
function CutleryModule({ rows, onAdd, onUpdateCount, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ branch: BRANCHES[1], item: "", area: "Restaurant", unit: "pcs", onHand: 0, par: 10 });

  function addRow() {
    if (!draft.item.trim()) return;
    onAdd(draft);
    setDraft({ ...draft, item: "", onHand: 0, par: 10 });
    setShowForm(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2"
          style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={14} /> Add Cutlery/Crockery Item
        </button>
      </div>
      {showForm && (
        <Ticket code="NEW ENTRY" label="Add cutlery / crockery item">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Branch"><select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} style={selStyle}>{BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Item Name"><input value={draft.item} onChange={(e) => setDraft({ ...draft, item: e.target.value })} placeholder="e.g., Dinner Plate" style={selStyle} /></Field>
            <Field label="Area"><select value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} style={selStyle}><option>Restaurant</option><option>Bar</option></select></Field>
            <Field label="Unit"><select value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} style={selStyle}><option>pcs</option><option>sets</option></select></Field>
            <Field label="Current Count"><input type="number" value={draft.onHand} onChange={(e) => setDraft({ ...draft, onHand: +e.target.value })} style={selStyle} /></Field>
            <Field label="Par Level"><input type="number" value={draft.par} onChange={(e) => setDraft({ ...draft, par: +e.target.value })} style={selStyle} /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRow} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><Check size={14} /> Save</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer" }}><X size={14} /> Cancel</button>
          </div>
        </Ticket>
      )}
      <ExportBar filename="cutlery_crockery_report" rows={rows} title="Cutlery & Crockery Inventory Report" />
      <Ticket code="TKT-12" label="Restaurant & Bar Cutlery / Crockery Inventory Report">
        <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 8 }}>Click into "On Hand" to update the count directly (e.g., after a breakage count or a fresh delivery).</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Branch</Th><Th>Area</Th><Th>Item</Th><Th right>On Hand</Th><Th right>Par Level</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td>{r.branch}</Td>
                  <Td><Badge tone={r.area === "Bar" ? "paprika" : "ink"}>{r.area}</Badge></Td>
                  <Td>{r.item}</Td>
                  <Td right>
                    <input type="number" defaultValue={r.onHand} onBlur={(e) => onUpdateCount(r.id, e.target.value)}
                      style={{ width: 70, textAlign: "right", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "4px 6px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13.5 }} /> {r.unit}
                  </Td>
                  <Td right mono>{r.par} {r.unit}</Td>
                  <Td><Badge tone={r.status === "Below Par" ? "amber" : "sage"}>{r.status}</Badge></Td>
                  <Td><IconBtn title="Delete" onClick={() => onDelete(r)}><Trash2 size={13} /></IconBtn></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}

/* ---------------------------------------------------------
   SETTINGS MODULE — owner email sync
--------------------------------------------------------- */
function SettingsModule({ ownerEmail, setOwnerEmail, notifyOn, setNotifyOn, activity, backendUrl, setBackendUrl, backendStatus, restaurantName, setRestaurantName, branches, onAddBranch, onClearDemoData, onBackup, onSendEmail, emailStatus, appPin, setAppPin }) {
  const [pinDraft, setPinDraft] = useState(appPin);
  const [urlDraft, setUrlDraft] = useState(backendUrl);
  const [nameDraft, setNameDraft] = useState(restaurantName);
  const [newBranchName, setNewBranchName] = useState("");
  return (
    <div className="space-y-4">
      <Ticket code="BACKUP" label="Full Data Backup">
        <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 10 }}>
          Downloads everything — every purchase, sale, item, vendor, stock row, and setting — as one JSON file. Keep a copy safe alongside your Google Sheets version history.
        </div>
        <button onClick={onBackup} className="flex items-center gap-2" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <ClipboardList size={14} /> Download Full Backup (JSON)
        </button>
      </Ticket>

      <Ticket code="DANGER ZONE" label="Clear Demo Data">
        <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 10 }}>
          Wipes demo Purchases, Wastage, Daily Indents, Bar Purchases, Recurring Payments, Price History, and resets Stock/Bar Stock to 0 — so you can start entering real data cleanly.
          <b> Item Master (274 items), Vendors, and Branches are kept.</b>
        </div>
        <button onClick={onClearDemoData} className="flex items-center gap-2" style={{ background: COLORS.paprika, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          <Trash2 size={14} /> Clear Demo Data
        </button>
      </Ticket>

      <Ticket code="GENERAL" label="Restaurant & Branch Settings">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ maxWidth: 560 }}>
          <Field label="Restaurant Name">
            <div className="flex gap-2">
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} style={selStyle} />
              <button onClick={() => setRestaurantName(nameDraft.trim())} style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "0 12px", fontSize: 13.5, cursor: "pointer" }}>Save</button>
            </div>
          </Field>
          <Field label="Branches">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {branches.map((b) => <Badge key={b} tone="ink">{b}</Badge>)}
            </div>
            <div className="flex gap-2">
              <input value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} placeholder="New branch name" style={selStyle} />
              <button onClick={() => { if (newBranchName.trim()) { onAddBranch(newBranchName.trim()); setNewBranchName(""); } }} style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "0 12px", fontSize: 13.5, cursor: "pointer" }}>Add</button>
            </div>
          </Field>
        </div>
      </Ticket>

      <Ticket code="LOGIN" label="Team PIN (basic access lock)">
        <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 10 }}>
          Not full user accounts — just a shared PIN so a random person with the link can't open the app. Anyone who knows the PIN sees and can edit everything (no per-person roles yet). Leave blank to disable the lock entirely.
        </div>
        <div className="flex gap-2 items-end flex-wrap" style={{ maxWidth: 420 }}>
          <div style={{ flex: "1 1 200px" }}>
            <Field label="Team PIN">
              <input value={pinDraft} onChange={(e) => setPinDraft(e.target.value)} placeholder="e.g., 4821" style={selStyle} />
            </Field>
          </div>
          <button onClick={() => setAppPin(pinDraft.trim())} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer", height: 34 }}><Check size={14} /> Save</button>
        </div>
        <div className="mt-2">
          {appPin ? <Badge tone="sage">🔒 Lock is ON</Badge> : <Badge tone="ink">Lock is OFF — anyone with the link can open the app</Badge>}
        </div>
      </Ticket>

      <Ticket code="BACKEND" label="Google Sheets Backend (shared data across devices)">
        <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 10 }}>
          Paste your deployed Google Apps Script Web App URL here. Once set, every save/load goes to your Google Sheet instead of this browser's local storage — so everyone on the team sees the same data.
        </div>
        <div className="flex gap-2 items-end flex-wrap" style={{ maxWidth: 640 }}>
          <div style={{ flex: "1 1 320px" }}>
            <Field label="Apps Script Web App URL">
              <input value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="https://script.google.com/macros/s/XXXX/exec" style={selStyle} />
            </Field>
          </div>
          <button onClick={() => setBackendUrl(urlDraft.trim())} className="flex items-center gap-1" style={{ background: COLORS.sage, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer", height: 34 }}><Check size={14} /> Save & Connect</button>
          {backendUrl && <button onClick={() => { setUrlDraft(""); setBackendUrl(""); }} className="flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "7px 14px", fontSize: 14, cursor: "pointer", height: 34 }}><X size={14} /> Disconnect</button>}
        </div>
        <div className="mt-2">
          {!backendUrl && <Badge tone="ink">Using this browser's local storage (not shared)</Badge>}
          {backendUrl && backendStatus === "ok" && <Badge tone="sage">✓ Connected to Google Sheets</Badge>}
          {backendUrl && backendStatus === "error" && <Badge tone="paprika">⚠ Could not reach backend — check the URL and deployment</Badge>}
          {backendUrl && backendStatus === "idle" && <Badge tone="amber">Saved — will connect on next save/load</Badge>}
        </div>
        <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 10, fontStyle: "italic" }}>
          After connecting, refresh the page once so the app loads existing data from the sheet.
        </div>
      </Ticket>

      <Ticket code="TKT-08" label="Owner Email Notification Settings">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ maxWidth: 560 }}>
          <Field label="Owner Email Address">
            <input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} style={selStyle} />
          </Field>
          <Field label="Mention my name in the activity log">
            <button onClick={() => setNotifyOn((n) => !n)}
              className="flex items-center gap-2"
              style={{ ...selStyle, cursor: "pointer", color: notifyOn ? COLORS.sage : COLORS.inkSoft }}>
              {notifyOn ? <Check size={14} /> : <X size={14} />} {notifyOn ? "Enabled" : "Disabled"}
            </button>
          </Field>
        </div>

        <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 12, marginBottom: 10, lineHeight: 1.6 }}>
          {backendUrl
            ? "Email sending is live via your Google Apps Script backend (Gmail's MailApp) — no per-transaction auto-emails though, to stay well under Gmail's free daily send limit. Use the buttons below to send on demand."
            : "Connect the Google Sheets Backend above first — email sending goes through the same Apps Script, using MailApp (your Gmail)."}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => onSendEmail(`Test email from ${restaurantName}`, `This is a test email from your InvotelStitch app.\n\nIf you're reading this, email sending is working correctly.\n\n— ${restaurantName}`)}
            disabled={!backendUrl}
            className="flex items-center gap-2"
            style={{ background: backendUrl ? COLORS.sage : COLORS.line, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: backendUrl ? "pointer" : "not-allowed" }}>
            <Mail size={14} /> Send Test Email
          </button>
          <button
            onClick={() => {
              const recent = activity.slice(0, 15).map((a) => `• ${a.ts} — ${a.text}`).join("\n");
              onSendEmail(`${restaurantName} — Activity Summary`, `Recent activity:\n\n${recent || "No recent activity."}`);
            }}
            disabled={!backendUrl}
            className="flex items-center gap-2"
            style={{ background: backendUrl ? COLORS.paprika : COLORS.line, color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: backendUrl ? "pointer" : "not-allowed" }}>
            <Mail size={14} /> Send Activity Digest Now
          </button>
          {emailStatus === "sending" && <Badge tone="amber">Sending…</Badge>}
          {emailStatus === "sent" && <Badge tone="sage">✓ Sent to {ownerEmail}</Badge>}
          {emailStatus === "error" && <Badge tone="paprika">⚠ Failed — check backend URL and MailApp authorization</Badge>}
          {emailStatus === "no-backend" && <Badge tone="ink">Connect the backend first</Badge>}
        </div>
      </Ticket>
      <Ticket code="LOG" label="Full activity log">
        <div style={{ maxHeight: 340, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Timestamp</Th><Th>Change</Th></tr></thead>
            <tbody>
              {activity.map((a) => (
                <tr key={a.id}>
                  <Td mono>{a.ts}</Td><Td>{a.text}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Ticket>
    </div>
  );
}
