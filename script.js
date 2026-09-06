const quantityInput = document.getElementById("quantity");
const serviceInput = document.getElementById("service");
const totalDisplay = document.getElementById("total");

if (quantityInput && serviceInput && totalDisplay) {
    serviceInput.addEventListener("change", calculatePrice);
    quantityInput.addEventListener("input", calculatePrice);
    calculatePrice();
}

function calculatePrice() {
    if (!quantityInput || !serviceInput || !totalDisplay) return;

    const quantity = Number(quantityInput.value);
    const service = serviceInput.value;

    let pricePer1000 = 0;

    if (service === "Followers") {
        pricePer1000 = 150;
    } else if (service === "Likes") {
        pricePer1000 = 50;
    } else if (service === "Views") {
        pricePer1000 = 30;
    } else if (service === "Comments") {
        pricePer1000 = 200;
    }

    if (isNaN(quantity) || quantity <= 0) {
        totalDisplay.textContent = "KSh 0.00";
        return;
    }

    const total = (quantity / 1000) * pricePer1000;
    totalDisplay.textContent = "KSh " + total.toFixed(2);
}

function placeOrder() {
    const platform = document.getElementById("platform").value;
    const service = document.getElementById("service").value;
    const quantity = Number(document.getElementById("quantity").value);
    const link = document.getElementById("link").value;
    const message = document.getElementById("message");
    const paymentSection = document.getElementById("payment-section");

    if (!platform || !service || !quantity || !link) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    if (quantity < 100) {
        message.textContent = "Minimum order is 100.";
        return;
    }

    calculatePrice();

    paymentSection.style.display = "block";
    paymentSection.scrollIntoView({
        behavior: "smooth"
    });

    message.textContent = "Order created. Enter your M-Pesa number below.";
}

async function payWithMpesa() {
    const phoneInput = document.getElementById("phone").value.trim();
    const totalText = document.getElementById("total").textContent;
    const message = document.getElementById("message");

    const amount = Math.round(Number(totalText.replace(/[^0-9.]/g, '')));

    if (!phoneInput) {
        alert("Please enter your M-Pesa number.");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Invalid payment amount.");
        return;
    }

    // Completely strip +, spaces, hyphens, and non-numeric characters
    let formattedPhone = phoneInput.replace(/[^0-9]/g, '');

    // Convert 07... or 01... into 2547... or 2541...
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
    }

    // Ensure valid length for Kenyan phone numbers (254XXXXXXXXX -> 12 digits)
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
        alert("Please enter a valid Kenyan phone number (e.g., 0712345678 or 0112345678).");
        return;
    }

    message.textContent = "Sending M-Pesa prompt to your phone...";

    try {
        const response = await fetch("https://smm-panel-drab-sigma.vercel.app/api/stkpush", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone: formattedPhone,
                amount: amount
            })
        });

        if (!response.ok) {
            console.error("HTTP Error:", response.status, response.statusText);
            message.textContent = "Failed to connect to backend.";
            alert("Connection error (" + response.status + "): Ensure /api/stkpush exists on Vercel.");
            return;
        }

        const data = await response.json();

        if (data.ResponseCode === "0" || data.ResponseCode === 0) {
            message.textContent = "STK Push sent! Enter your M-Pesa PIN on your phone.";
            alert("Check your phone for the M-Pesa PIN prompt.");
        } else {
            const errDetails = data.errorMessage || data.error?.errorMessage || data.error || "Could not trigger STK push.";
            message.textContent = "Payment failed: " + errDetails;
            alert("M-Pesa Error: " + errDetails);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        message.textContent = "Network error. Try again.";
        alert("Network error: " + error.message);
    }
}
