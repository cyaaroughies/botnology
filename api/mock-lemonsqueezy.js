const express = require('express');
const app = express();

app.use(express.json());

// Mock endpoint for Lemon Squeezy checkout creation
app.post('/api/lemonsqueezy/create-checkout', (req, res) => {
  const { plan, cadence, student_id, email } = req.body;

  if (!plan || !cadence || !student_id) {
    return res.status(400).json({
      error: 'Missing required fields: plan, cadence, student_id',
    });
  }

  res.json({
    url: `https://mock-lemonsqueezy.com/checkout?plan=${encodeURIComponent(plan)}&cadence=${encodeURIComponent(cadence)}&student_id=${encodeURIComponent(student_id)}${email ? `&email=${encodeURIComponent(email)}` : ''}`,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock Lemon Squeezy API running on http://localhost:${PORT}`);
});
