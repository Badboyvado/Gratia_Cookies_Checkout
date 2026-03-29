document.addEventListener("DOMContentLoaded", () => {

    // DATA - Single source of truth
    const NIGERIAN_STATES = ["Abia","Adamawa"," Akwa Ibom","Anambra","Bauchi",
        "Bayelsa","Benue","Borno","Cross River","Delta",
        "Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja",
        "Gombe","Imo","Jigawa","Kaduna","Kano",
        "Katsina","Kebbi","Kogi","Kwara","Lagos",
        "Nasarawa","Niger","Ogun","Ondo", "Osun",
         "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
          "Yobe", "Zamfara"]; 

    const DELIVERY_METHODS  =   [
        {value: "standard", label: "🚚 Standard Delivery", desc: "3-5 business days", price: 1000},
        {value: "express", label: "⚡Express Delivery", desc: "Next business day", price: 2500},
        {value: "pick up", label: "Pick up", desc: "Collect from our store", price: 0},
    ];

    const PAYMENT_METHODS = [
        {value: "card", label: "💳 Card"},
        {value: "transfer", label:"🏦 Bank Transfer"},
        {value: "pod", label: "🚚 Pay on Delivery"},
    ];

    const POD_FEE = 500;

    const STEP_CONFIG = [
        {step: 1, label: "Cart"},
        {step: 2, label: "Delivery"},
        {step: 3, label: "Payment"},
        {step: 4, label: "Confirmed"},
    ];

    const VALID_PROMOS = {"GRATIA10": 10, "COOKIES20": 20};

    // Cart items - in production these come from product page via localStorage

    let cartItems = [
        {emoji: "🍪", name: "Gratia Cookies", meta: "Original -30g", price: 750, qty: 1},
        {emoji: "🍫", name: "Gratia Cookies", meta: "Chocolate -45g", price: 1500,  qty: 1 },
    ];

 // STATE
    let currentStep = 1;
    let selectedDelivery = "standard";
    let selectedPayment = "card";
    let promoApplied  = false;
    let promoDiscount = 0;


    // HELPERS
    const fmt = (n) =>  "₦" + n.toLocaleString();

    function getSubtotal() {
        return cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    }
    function getDeliveryfee() {
        const method  = DELIVERY_METHODS.find((m) => m.value === selectedDelivery);
        const base = method ? method.price : 0;
        // Add POD fee if pay on delivery is selected 
        return selectedPayment === "pod" ? base + POD_FEE : base;
    } 
    function getTotal() {
        return getSubtotal() + getDeliveryfee() - promoDiscount;
    }
    function generateOrderRef() {
        return  "#HBT-" +  Math.floor(100000 + Math.random() * 900000);
    }
    // console.log(generateOrderRef(1200));

    // RENDER - PROCESS STEPS  
    function renderStepDots() {
        const container = document.getElementById("stepsIndicator");
        container.innerHTML = STEP_CONFIG.map(({ step, label}) => `
        <div clas="step-dot ${step === currentStep ? "active" : ""} ${step < currentStep ? "completed" : ''}" data-step="${step}">
          <div class="dot-circle">${step < currentStep ? "✔️" : step}</div>
          <span class="dot-label">${label}</span>
        </div>`).join("");
    }

    function  updateProgressBar() {
        const percent =  ((currentStep - 1)/ (STEP_CONFIG.length - 1)) * 100;
        document.getElementById("progressFill").style.width  = percent + "%";
    }

    // RENDER -  STATE DROPDOWN
    function renderStateOptions() {
        const select = document.getElementById("state");
        select.innerHTML =  `<option value="">Select State</option>` + NIGERIAN_STATES.map((s) => `<option value="${s}">${s}</option>`).join("");
    }

    // RENDER - DELIVERY METHOD OPTIONS
    function  renderDeliveryOptions(){
        const container = document.getElementById("deliveryOptions");
        container.innerHTML =  DELIVERY_METHODS.map((m)  => `
        <label class="delivery-option ${m.value  ===  selectedDelivery ? "active" : ''}" data-value="${m.value}">
          <input type="radio" name="delivery" value="${m.value}" ${m.value ===  selectedDelivery ? "checked" : ''}></input>
         <div class="delivery-option-info">
          <span class="delivery-name">${m.label}</span>
          <span class="delivery-desc">${m.desc}</span>
         </div>
         <span class="delivery-price ${m.price === 0 ? "free" : ''}">${m.price === 0  ? "FREE" : fmt(m.price)}</span>
        </label>`
    ).join("");
    
    // Attach events to newly rendered options
    container.querySelectorAll(".delivery-option").forEach((opt) => {
        opt.addEventListener("click", () => {
            selectedDelivery =  opt.dataset.value;
            renderDeliveryOptions();
            updateSummary();
        });
    });
    }

    // RENDER -  PAYMENT TABS
    function  renderPaymentTabs(){
        const container = document.getElementById("paymentTabs");
        container.innerHTML  =   PAYMENT_METHODS.map((m) => `
        <button class="pay-tab ${m.value  ===  selectedPayment ? "active" : ''}" data-method="${m.value}">${m.label}</button>
        `).join("");

        container.querySelectorAll(".pay-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                selectedPayment =  tab.dataset.method;
                renderPaymentTabs();
                // Show the right payment panel
                document.querySelectorAll(".payment-panel").forEach((p) => p.classList.remove("active"));
                document.getElementById("pay-" + selectedPayment).classList.add('active');
                //POD fee affects delivery total - update summary
                updateSummary();
                renderPodNotes();
            });
        });
    }

    // RENDER -  POD NOTES (inlcudes live POD fee)

    function renderPodNotes() {
        const container = document.getElementById("podNotes");
        container.innerHTML = [
            "✅ Available for all states in Ngeria",
            "✅ Have exact change ready if possible",
            "⚠️ Extra ${fmt(POD_FEE)}  handling fee applies",
        ].map((note) => `<div class ="pod-note">${note}</div>`).join("");
    }

    //  RENDER - CART REVIEW (Step 1)
    function renderCartItems() {
        const list = document.getElementById("cartReviewList");

        if(cartItems.length === 0) {
            list.innerHTML =`<p class="cart-empty-msg">Your cart is empty.</p>`;
            updateSummary();
            return;
        }
        list.innerHTML  = cartItems.map((item, index) => `
        <div class="review-item">
         <div class="review-item-emoji">${item.emoji}</div>
         <div class="review-item-info">
          <div class="review-item-name">${item.name}</div>
          <div class="review-item-meta">${item.meta}</div>
         </div>
        <div class="review-item-right">
         <div class="review-qty-control">
           <button class="review-qty-btn"  data-index="${index}" data-action="decrease">-</button>
           <span class="review-qty-num">${item.qty}</span>
           <button class="review-qty-btn" data-index="${index}" data-action="increase">+</button>
         </div>
          <div class="review-item-price">${fmt(item.price * item.qty)}</div>
        </div>
        </div>`).join("");

        // Attach qty button events
        list.querySelectorAll(".review-qty-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const index  = parseInt(btn.dataset.index);
                const action = btn.dataset.action;
                if (action === "increase") {
                    cartItems[index].qty++;
                } else {
                    cartItems[index].qty = Math.max(1, cartItems[index].qty - 1);
                }
                renderCartItems();
                updateSummary();
            });
        });
        updateSummary();
    } 

    // UPDATE SUMMARY SIDEBAR 
    function updateSummary() {
       const subtotal  = getSubtotal();
        const delivery = getDeliveryfee();
       const total = getTotal();
        
        // Summary items list 
        document.getElementById("summaryItems").innerHTML  = cartItems.map((item) => `
        <div class ="summary-item">
         <span>${item.emoji} ${item.name} x ${item.qty}</span>
         <span>${fmt(item.price * item.qty)}</span>
        </div>
        `).join("");
       //Subtotal
       document.getElementById("summarySubtotal").textContent  = fmt(subtotal);
       //Delivery
       const deliveryLabel =  delivery  ===  0 ?  "FREE" : fmt(delivery);
       document.getElementById("summaryDelivery").textContent = deliveryLabel;
       
       //POD fee note in summary
       if (selectedPayment === "pod") {
        document.getElementById("summaryDelivery").textContent = deliveryLabel + `(incl. ${fmt(POD_FEE)}  handling)`;
       }
       //    PROMO
       const promoRow   = document.getElementById("promoRowSummary");
       if  (promoApplied && promoDiscount > 0) {
        promoRow.style.display = "flex";
        document.getElementById("summaryDiscount").textContent = "-" + fmt(promoDiscount);
       } else {
        promoRow.style.display = "none";
       }
       //Total
       document.getElementById("summaryTotal").textContent = fmt(total);
       // Bank transfer amount - always matches total
       document.getElementById("transferAmount").textContent = fmt(total);
    }

    // STEP NAVIGATION

    function goToStep(step) {
        document.querySelectorAll(".step-panel").forEach((p)  => p.classList.remove("active"));
        document.getElementById("step-" + step).classList.add("active");
        currentStep = step;
        renderStepDots();
        updateProgressBar();
        window.scrollTo({ top: 0, behavior: "smooth"});
    }
    // PROMO CODE
       document.getElementById("promoBtn").addEventListener("click",() => {
        const code = document.getElementById("promoInput").value.trim().toUpperCase();
        const msg = document.getElementById("promoMsg");

        if(!code) {
            msg.textContent = "Please enter a promo code.";
            msg.className = "promo-msg error";
            return;
        }
        if (VALID_PROMOS[code]) {
            const  percent = VALID_PROMOS[code];
            promoDiscount = Math.round(getSubtotal() * percent / 100);
            promoApplied = true;
            msg.textContent = `✅ Promo applied! You saved ${fmt(promoDiscount)} (${percent}% off)`;
            msg.className = "promo-msg sucess";
        } else {
            promoDiscount = 0;
            promoApplied = false;
            msg.textContent = "❌ Invalid code. Try GRATIA10 or COOKIES20";
            msg.className = "promo-msg error";
        }
        updateSummary();
       });

    //    Step 1 -> Step 2
    document.getElementById("step1Next").addEventListener("click", () => goToStep(2));

    // Step 2 DELIVERY FORM VALIDATION

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
        } 
            input.classList.remove("error");
            input.classList.add("sucess");
            err.textContent = "";
            return true;
    }

    function validateDeliveryForm() {
        return [
            validateField("firstName", "firstNameErr", (v) => v.length >= 2, "Enter your first name"), 
            validateField("lastName", "lastNameErr",  (v)=> v.length >= 2, "Enter your last name"), 
            validateField("email", "emailErr", (v)=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter your valid email address"), 
            validateField("phone", "phoneErr",(v) => /^[0-9]{10,11}$/.test(v.replace(/\s/g,"")), "Enter a valid Nigerian phone number"), 
            validateField("address", "addressErr",  (v)=> v.length >= 5, "Enter your delivery address"), 
            validateField("city",  "cityErr", (v) => v.length >= 2, "Enter your city"), 
            validateField("state", "stateErr", (v) => v !== "", "Select your state"),
        ].every(Boolean);
    }
    function validateCardForm() {
        return  [
            validateField("cardName", "cardNameErr", (v) => v.length >= 2, "Enter the name on your card"),
            validateField("cardNumber", "cardNumberErr",(v) => v.replace(/\s/g, "").length === 16, "Enter a valid 16-digit card number"),
            validateField("cardExpiry", "cardExpiryErr", (v) => /^\d{2}\s\/\s\d{2}$/.test(v), "Enter expiry as MM/YY"),
            validateField("cardCvv", "cardCvvErr", (v) => length ===3, "CVV must be 3 digits"),
        ].every(Boolean);
    }
    // Live validation on delivery fields
    ["firstName", "lastName","email","phone","address", "city","state"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("blur", ()=> validateField(id, id + "Err",(v) => v.length > 0, "This field is required"));
    });
// Step 2 Navigation
    document.getElementById("step2Prev").addEventListener("click", ()=> goToStep(1));
    document.getElementById("step2Next").addEventListener("click", ()=> {
        if (validateDeliveryForm()) goToStep(3);
        else window.scrollTo({top: 200, behavior: "smooth"}); 
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

    const cardCvv = document.getElementById("cardCvv");
    cardCvv.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").substring(0,3);
    });

 // COPY account number
    document.getElementById("copyAcct").addEventListener("click", (e) => {
        navigator.clipboard.writeText("0123456789").then(()=> {
            e.target.textContent = "Copied!";
            setTimeout(()=> e.target.textContent = "copy", 2000);
        });
    });

    // Step 3 navigation
 document.getElementById("step3Prev").addEventListener("click", () => goToStep(2));
    document.getElementById("step3Next").addEventListener("click", () => {
        if (selectedPayment === "card" && !validateCardForm()) return;
        renderConfirmation();
        goToStep(4);
    });
    // RENDER - CONFIRMATION
    function renderConfirmation () {
        // Order Reference
        document.getElementById("orderRef").textContent = generateOrderRef();

        // Gather info from form
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || "-" ;
        const  address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value.trim();
        const state = document.getElementById("state").value;
        const fullAddress = [address, city, state].filter(Boolean).join(",") || "-";

        const deliveryMethod = DELIVERY_METHODS.find((m) => m.value  === selectedDelivery);
        const paymentMethod = PAYMENT_METHODS.find((m) => m.value === selectedPayment);

        // Confirmation detail rows - all values from JS State
        const rows = [
            {label: "Name", value:fullName},
            {label: "Delivery Address", value: fullAddress},
            {label: "Delivery Method", value: deliveryMethod ? deliveryMethod.label + "_" + deliveryMethod.desc : "_" },
            {label: "Delivery Fee", value: getDeliveryfee()  === 0  ?  "FREE" : fmt((getDeliveryfee())) },
            {label: "Payment Method", value: paymentMethod ? paymentMethod.label : "_"},
            {label: "Subtotal", value: fmt(getSubtotal())}, 
            (promoApplied ? [{label: "Promo Discount", value: "-" + fmt(promoDiscount) }] : []),
            {label: "Total Paid", value: fmt(getTotal()), Highlight: true},
        ];

        document.getElementById("confirmDetails").innerHTML = rows.map((row) => `
        <div class="confirm-detail-row"
          <span class="confirm-detail-label">${row.label}</span>
          <span class="confirm-detail-value ${row.highlight ? "highlight-val" : ""}">${row.value}</span>
          </div>
        `).join("");

        // Delivery timeline - desc comes from selected dleivery method
        const deliveryDesc = deliveryMethod ? deliveryMethod.desc : "3-5 business days";
        const timelineSteps = [
            {icon:"✔️",  title: "Order Confirmed", sub: "Just now", done: true},
            {icon: "2", title: "Being Prepared", sub: "Without 24 hours", done: false},
            {icon: "3", title: "Out of Delivery", sub: deliveryDesc, done: false},
            {icon:  "🍪", title:"Delivered", sub: "Enjoy your cookies", done: false},
        ];

        document.getElementById("confirmTimeline").innerHTML = timelineSteps.map((s) => `
        <div class="timeline-item ${s.done ? "done" : ""}">
          <div class="timeline-dot">${s.icon}</div>
          <div class="timeline-info">
           <div class="timeline-title">${s.title}</div>
           <div class="timeline-sub">${s.sub}</div>
          </div>
        </div>
        `).join("");
    }
    // INITIALISE EVERYTHING 
    renderStepDots();
    updateProgressBar();
    renderStateOptions();
    renderDeliveryOptions();
    renderPaymentTabs();
    renderPodNotes();
    renderCartItems();

});