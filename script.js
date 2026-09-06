const quantityInput = document.getElementById("quantity");
const serviceInput = document.getElementById("service");
const totalDisplay = document.getElementById("total");

function calculatePrice() {
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

    const total = (quantity / 1000) * pricePer1000;

    totalDisplay.textContent = "KSh " + total.toFixed(2);
}

serviceInput.addEventListener("change", calculatePrice);
quantityInput.addEventListener("input", calculatePrice);

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

function payWithMpesa() {
    const phone = document.getElementById("phone").value;
    const amount = document.getElementById("total").textContent;

    if (!phone) {
        alert("Please enter your M-Pesa number.");
        return;
    }

    alert(
        "M-Pesa payment request for " +
        amount +
        " will be sent to " +
        phone
    );
}