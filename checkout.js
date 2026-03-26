document.addEventListener("DOMContentLoaded", () => {
    // STATE
    let currentStep = 1;
    const totalSteps = 4;

    const deliveryPrices = {standard: 1500,  express: 2500, pickup: 0};
    let selectedDelivery = "standard";
    let selectedPayment = "card";
    let promoApplied  = false;
    let promoDiscount = 0;

    // CART ITEMS (demo - in real app this comes from product page)
    let cartItems = [
        {emoji: "🍪", name: "Gratia Cookies", meta: "Original -30g", price: 750, qty: 2},
        {emoji: "🍫", name: "Gratia Cookies", meta: "Chocolate -45g", price: 1500,  qty: 1 }
    ];

    // HELPERS

    function getSubtotal() {
        return cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    }
    function getDeliveryfee() {
        return deliveryPrices[selectedDelivery] || 0;
    } 
    function getTotal() {
        return getSubtotal() + getDeliveryfee() - promoDiscount;
    }
    function formatNaira(amount) {
        return "" + amount.toLocaleString();
    }
    function generateOrderRef() {
        return  "#HBT-" +  Math.floor(100000 + Math.random() * 900000);
    }
    console.log(generateOrderRef(1200));

    // UPDATE SUMMARY SIDEBAR 
    function updateSummary() {
        document.getElementById("summarySubtotal").textContent  = formatNaira(getSubtotal());
        document.getElementById("summaryDelivery").textContent = getDeliveryfee() === 0 ? "FREE" : formatNaira(getDeliveryfee());
        // document.getElementById("summaryTotal").textContent = formatNaira(getTotal());
        document.getElementById("transferAmount").textContent = formatNaira(getTotal());
        
        // Promo row
        const promoRow =  document.getElementById("promoRowSummary");
        if (promoApplied) {
            promoRow.style.display = "flex";
            document.getElementById("summaryDiscount").textContent = "-" + formatNaira(promoDiscount);
        } else {promoRow.style.display = "none";}
    }

    // PROGRESS BAR  & STEP DOTS
    function updateProgress(step) {
        const percent = ((step - 1) / (totalSteps - 1))  * 100;
        document.getElementById("progressFill").style.width = percent + "%";
        document.querySelectorAll(".step-dot").forEach((dot) => {
            const dotStep =  parseInt(dot.dataset.step);
            dot.classList.remove("active", "completed");
            if (dotStep === step) dot.classList.add("active");
            if (dotStep < step) dot.classList.add("completed");
        });
    }
    // GO TO STEP 
    function goToStep(step)  {
        document.querySelectorAll(".step-1").forEach((panel) => panel.classList.remove("active"));
        document.getElementById("step-" + step).classList.add("active");
        currentStep = step;
        updateProgress(step);
        window.scrollTo({ top: 0, behavior: "smooth"});
    }

    // STEP 1 CART REVIEW
    function renderCartItems(){
        const list = document.getElementById("cartReviewList");
        if (cartItems.length === 0) {
            list.innerHTML = `<p style = "color: var(--muted);  font-weight:600; text-align: center; padding: 20px">Your cart is empty.</p>`;
            return;
        }
        list.innerHTML =  cartItems.map((item, index)  =>
            ` <div class="review-item">
                        <div class="review-item-emoji">${item.emoji}</div>
                        <div class="review-item-info">
                            <div class="review-item-name">${item.name}</div>
                            <div class="review-item-meta">${item.meta}</div>
                        </div>
                        <div class="review-item-right">
                            <div class="review-qty-control">
                                <button class="review-qty-btn" data-index="${index}" data-action="decrease">-</button>
                                <span class="review-qty-num">${item.qty}</span>
                                <button class="review-qty-btn" data-index="${index}" data-action="increase">+</button>
                            </div>
                            <div class="review-item-price">${formatNaira(item.price * item.qty)}</div>
                        </div>
                     </div>
        `).join("");
        // Qty Buttons in cart review 
        list.querySelectorAll(".review-qty-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.dataset.index);
                const action = btn.dataset.action;
                if (action === "increase") {
                    cartItems[index].qty++;
                } else {
                    cartItems[index].qty  = Math.max(1, cartItems[index].qty - 1);
                }
                renderCartItems();
                updateSummary();
                updateSummaryItems();
            });
        });
    }

    function updateSummaryItems() {
        document.getElementById("summaryItems").innerHTML  =  cartItems.map((item) =>
        `<div class="summary-item">
            <span>${item.name} x ${item.qty}</span>
            <span>${formatNaira(item.price * item.qty)}</span>
                    </div>`).join("");
    }

    // Promo Code
    const VALID_PROMOS = { "GRATIA10": 10, "COOKIES20": 20};  // code: % discount
    document.getElementById("promoBtn").addEventListener("click", () => {
        ("promoInput").value.trim().toUpperCase();
        const msg = document.getElementById("promoMsg");

        if (!code) {
            msg.textContent = "Please enter a promo code.";
            msg.className  = "promo-msg error";
            return;
        }

        if (VALID_PROMOS[code]) {
            const percent = VALID_PROMOS[code];
            promoDiscount = Math.round(getSubtotal() * percent / 100);
            promoApplied = true;
            msg.textContent = `✅ Promo applied! You saved ${formatNaira(promoDiscount)} (${percent}% off)`;
            msg.className  = `promo-msg sucess`;
            updateSummary();
        } else {
            promoDiscount = 0;
            promoApplied = false;
            msg.textContent = `❌ Invalid promo code. Try GRATIA10 or COOKIES20`;
            msg.className = `promo-msg error`;
            updateSummary();
        }
    });

    document.getElementById("step1Next").addEventListener("click", () => {
        goToStep(2);
    });

    // STEP 2 DELIVERY FORM VALIDATION

    function validateField(id, errId, rule, message ) {
        const input = document.getElementById(id);
        const  err  = document.getElementById(errId);
        const value = input.value.trim();
        
       /* for (let {rule, message} of rules) */
        if (!rule(value)) {
            input.classList.add("error");
            input.classList.remove("sucess");
            err.textContent = message;
            return false;
        } else {
            input.classList.remove("error");
            input.classList.add("sucess");
            err.textContent = "";
            return true;
    }
}

    function validateDeliveryForm() {
        const checks = [
            validateField("firstName", "firstNameErr", (v) => v.length >= 2, "Please enter your first name"), 
            validateField("lastName", "lastNameErr",  (v)=> v.length >= 2, "Please enter your last name"), 
            validateField("email", "emailErr", (v)=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Please enter your valid email address"), 
            validateField("phone", "phoneErr",(v) => /^[0-9]{10,11}$/.test(v.replace(/\s/g,"")), "Enter a valid Nigerian phone number"), 
            validateField("address", "addressErr",  (v)=> v.length >= 5, "Please enter   your delivery address"), 
            validateField("city",  "cityErr", (v) => v.length >= 2, "Please enter your city"), 
            validateField("state", "stateErr", (v) => v !== "", "Please select your state"),
        ];
        // console.log(checks);
        return checks.every(Boolean);
    }

    // Live validation on blur
    ["firstName", "lastName","email","phone","address", "city","state"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("blur", ()=> validateDeliveryForm());
        }
    });
    // Delivery method selection
    document.querySelectorAll(".delivery-option").forEach((opt) =>  {
        opt.addEventListener("click", () => {
            document.querySelectorAll(".delivery-option").forEach((o) => o.classList.remove("active"));
            opt.classList.add("active");
            const radio = opt.querySelector("input[type='radio']");
            if (radio) {
                radio.checked = true;
            }
            updateSummary();
        });
    });

    document.getElementById("step2Prev").addEventListener("click", () => goToStep(1));
    document.getElementById("step2Next").addEventListener("click", () => {
        if (validateDeliveryForm()) goToStep(3);
        else window.scrollTo({ top: 200, behavior: "smooth"});
        return goToStep(3);
    });

    // STEP 3 - PAYMENT

    // Payment tabs
    document.querySelectorAll(".pay-tab").forEach((tab) => {
        tab.addEventListener("click",  () => {
            document.querySelectorAll(".pay-tab").forEach((t) => t.classList.remove("active"));
            document.querySelectorAll(".payment-panel").forEach((p) => p.classList.remove("active"));
            tab.classList.add("active");
            selectedPayment = tab.dataset.method;
            document.getElementById("pay-" + selectedPayment).classList.add("active");
        });
    });

    // Card Number formatting
    const cardNumberInput = document.getElementById("cardNumber");
    cardNumberInput.addEventListener("input", () => {
        let val = cardNumberInput.value.replace(/\D/g, "").substring(0,16);
        cardNumberInput.value = val.replace(/(.{4})/g, "$1").trim();

        // Detect card type 
        const icon = document.getElementById("cardTypeIcon");
        if (val.startsWith("4")) icon.textContent = "💙";  //Visa
        else if (val.startsWith("5")) icon.textContent = "💛"; //Mastercard
        else icon.textContent = "💳";
    });
    // Expiry formatting
    const cardExpiryInput = document.getElementById("cardExpiry");
    cardExpiryInput.addEventListener("input",()=> {
        let val = cardExpiryInput.value.replace(/\D/g, "").substring(0,4);
        if (val.length >= 2) val = val.substring(0, 2) + "/" + val.substring(2);
        cardExpiryInput.value = val;
    });

    // CVV - numbers only 
    document.getElementById("cardCvv").addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").substring(0,3);
    });

    // COPY account number
    document.getElementById("copyAcct").addEventListener("click", (btn) => {
        navigator.clipboard.writeText("0123456789").then(()=> {
            btn.target.textContent = "Copied!";
            setTimeout(()=> btn.target.textContent = "copy", 2000);
        });
    });
    function validateCardForm() {
        const checks = [
            validateField("cardName", "cardNameErr", (v)=> v.length >= 2, "Enter the name on your card"), 
            validateField("cardNumber", "cardNumberErr", (v)=> v.replace(/\s/g, "").length === 16, "Enter a valid 16-digit card number"), 
            validateField("cardExpiry","cardExpiryErr", (v)=> /^\d{2}\s\/s\d{2}$/.test(v), "Enter a valid expiry date (MM / YY)"), 
            validateField("cardCvv", "cardCvvErr", (v) => v.length ===3,  "CVV must be 3 digits")
        ];
        return checks.every(Boolean);
    }

    document.getElementById("step3Prev").addEventListener("click", ()=> goToStep(2));
    document.getElementById("step3Next").addEventListener("click", () => {
        if (selectedPayment  === "card"  && !validateCardForm()) return;
        buildConfirmation();
        goToStep(4);
    });

    // STEP  4- CONFIRMATION
    function  buildConfirmation() {
        // Order refrence
        document.getElementById("orderRef").textContent = generateOrderRef();

        // GAther deliivery info
        const name = document.getElementById("firstName").value + " " + document.getElementById("lastName").value;
        const address = document.getElementById("address").value +  " "  + document.getElementById("city").value +  " " + document.getElementById("state").value;
        const payMap = { card: "💳 Card Payment", transfer: "🏦 Bank Transfer", pod: "🚚 Pay on Delivery"};
        const delMap = {standard: "Standard(3-5 days)", express: "Express(Next day)", pickup: "Store Pickup"};

        document.getElementById("confirmDetails").innerHTML = `
        <div class="confirm-detail-row">
        <span class="confirm-detail-label">Name</span>
        <span class="confirm-detail-value">${name.trim() || "_"}</span>
        </div>
        <div class="confrim-detail-row">
        <span class="confirm-detail-label">Delivery Address</span>
        <span class="confrim-detail-value">${address.trim().replace(/^,\s*/, "") || "_"}</span>
        </div>
        <div class ="confirm-detail-row">
        <span class="confirm-detail-label">Delivery Method</span>
        <span class="confirm-detail-detail-value">${delMap[selectedDelivery]}</span>
        </div>
        <div class="confirm-detail-row">
        <span class="confirm-detail-label">Payment Method</span>
        <span class="confirm-detail-value">${payMap[selectedPayment]}</span>
        </div>
        <div class="confirm-detail-row">
        <span class="confirm-detail-label">Total Paid</span>
        <span class="confirm-detail-value" style="color:var(--caramel)">${formatNaira(getTotal())}</span>
        </div>
        `;
    }
    // INITIALISE
    renderCartItems();
    updateSummary();
    updateSummaryItems();
    updateProgress();

})