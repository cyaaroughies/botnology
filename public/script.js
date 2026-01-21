document.getElementById("voice-button").addEventListener("click", () => {
  const text = "Hello! I am Professor Botonic, your premium AI tutor. Let's learn together!";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = speechSynthesis.getVoices().find(voice => voice.name.includes("English"));
  speechSynthesis.speak(utterance);
});

function startCheckout(plan, cadence) {
  const priceId = {
    associates: {
      monthly: "price_1Sq35RK6UhzkJnxUOJOqVUxU",
      annual: "price_1Sq35RK6UhzkJnxUDrjqCFmD",
    },
    bachelors: {
      monthly: "price_1Sq38sK6UhzkJnxUOajgkvKV",
      annual: "price_1Sq3BGK6UhzkJnxUEUOZwOgc",
    },
    masters: {
      monthly: "price_1Sq3FhK6UhzkJnxUFZEYdlQD",
      annual: "price_1Sq3HwK6UhzkJnxUGZ0Gr02O",
    },
  }[plan]?.[cadence];

  if (!priceId) {
    alert("Invalid plan or cadence selected.");
    return;
  }

  fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ priceId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session.");
      }
    })
    .catch((error) => {
      console.error("Error creating checkout session:", error);
      alert("An error occurred. Please try again.");
    });
}

// Attach startCheckout to the global window object
window.startCheckout = startCheckout;