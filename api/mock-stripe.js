const express = require('express');
const app = express();

app.use(express.json());

// Mock endpoint for Stripe checkout session
app.post('/api/stripe/create-checkout-session', (req, res) => {
  const { plan, cadence, student_id, email } = req.body;

  // Accept email as optional, but require plan, cadence, student_id
  if (!plan || !cadence || !student_id) {
    return res.status(400).json({
      error: 'Missing required fields: plan, cadence, student_id',
    });
  }

  // Simulate a successful response
  res.json({
    url: `https://mock-stripe.com/checkout?plan=${encodeURIComponent(plan)}&cadence=${encodeURIComponent(cadence)}&student_id=${encodeURIComponent(student_id)}${email ? `&email=${encodeURIComponent(email)}` : ''}`,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock Stripe API running on http://localhost:${PORT}`);
});
