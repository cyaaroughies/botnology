const express = require('express');
const app = express();

app.use(express.json());

// Mock endpoint for Stripe checkout session
app.post('/api/stripe/create-checkout-session', (req, res) => {
  const { plan, cadence, student_id, email } = req.body;

  if (!plan || !cadence || !student_id || !email) {
    return res.status(400).json({
      error: 'Missing required fields',
    });
  }

  // Simulate a successful response
  res.json({
    url: `https://mock-stripe.com/checkout?plan=${plan}&cadence=${cadence}`,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock Stripe API running on http://localhost:${PORT}`);
});