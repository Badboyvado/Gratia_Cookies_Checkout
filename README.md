# Gratia Checkout ⚡

A fully dynamic 4-step checkout flow for the Gratia Cookies e-commerce product page — built with pure HTML, CSS & JavaScript. Zero hard coded values in HTML. JavaScript owns and renders all data dynamically.

## 🌐 Live Demo
[View Live Site](https://gratia-cookies-checkout.vercel.app/)

## 📸 Preview
![Gratia Checkout Preview]()

---

## 🪜 The 4 Steps

**Step 1 — Cart Review**
- All cart items rendered dynamically from JavaScript
- Adjust item quantities with live price updates
- Promo code system — try `GRATIA10` (10% off) or `CHINCHIN20` (20% off)
- Discount reflects instantly in the order summary

**Step 2 — Delivery Information**
- Full form with 7 fields — first name, last name, email, phone, address, city, state
- All 37 Nigerian states populated dynamically from a JS array
- Real-time field validation — green border ✅ on valid, red ❌ on invalid
- 3 delivery methods rendered from JS data — Standard (₦1,000), Express (₦2,500), Free Pickup
- Delivery fee updates live in the order summary on selection

**Step 3 — Payment**
- 3 payment method tabs rendered dynamically — Card, Bank Transfer, Pay on Delivery
- Card panel auto-formats card number with spaces, detects Visa vs Mastercard, formats expiry to MM / YY
- Bank Transfer shows account details with one-click copy button and live total amount
- Pay on Delivery shows terms including ₦500 handling fee — all from JS, never hard coded
- Card form validates all fields before proceeding

**Step 4 — Confirmation**
- Animated ✓ circle on order success
- Unique order reference generated e.g. `#HBT-482910`
- Full order summary — name, address, delivery method, fees, payment method, total
- Delivery timeline rendered dynamically with correct delivery duration from selected method

---

## ✨ Features

- 🔄 Fully dynamic rendering — JS owns all data, HTML has zero hard coded values
- ✅ Form validation on every required field with clear error messages
- 📊 Live order summary that updates on every selection change
- 🎨 Animated step progress bar and step indicator dots
- 💳 Smart card input — auto-spacing, auto-expiry format, card type detection
- 📋 One-click account number copy for bank transfer
- 🧾 Promo code engine with percentage discounts
- 🚚 POD handling fee automatically included in totals
- 📱 Fully responsive design

---

## 🛠️ Built With

- HTML5 — structure and empty containers only
- CSS3 — custom properties, transitions, animations, grid, flexbox
- Vanilla JavaScript — all rendering, state management, validation, and logic

---

## 🧠 JavaScript Concepts Practiced

- **Dynamic rendering** — building all UI from JS data arrays
- **Single source of truth** — one place for all data, no conflicts
- **Form validation** — real-time field checking with visual feedback
- **State management** — tracking selections across 4 steps
- **String formatting** — card number spacing, expiry, Naira currency
- **Event delegation** — handling events on dynamically created elements
- **Template literals** — building HTML strings cleanly in JS

---

## 🚀 Getting Started

1. Clone the repo
```bash
git clone https://github.com/Badboyvado/Gratia_Cookies_Checkout.git
```

2. Open `index.html` in your browser
```
No installations or dependencies needed!
Double click checkout.html and it opens in your browser.
```

---

## 📁 Project Structure

```
gratia-cookies-checkout/
├── index.html          # Checkout page — empty containers only
├── checkout.css        # Checkout styles
├── checkout.js         # All checkout logic and rendering
└── README.md           # You are here
```

---

## 🔗 Related Project

This checkout page is part of the **Gratia Cookies** product page project.
👉 [View the Product Page README]()

---

## 👤 Author

Your Name 
Habeeb Taiwo
- GitHub: [@Badboyvado](https://github.com/Badboyvado)
- Portfolio: [https://habeeb-taiwo.vercel.app/](https://365badboy.name.ng)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
