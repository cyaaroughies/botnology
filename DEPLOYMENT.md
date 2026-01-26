# Botnology 101 - Deployment Guide

## 🚀 Vercel Deployment Checklist

### 1. Pre-Deployment Setup

#### A. Stripe Configuration
1. **Create Products in Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/products
   - Create 3 products: Associates, Bachelors, Masters
   - For each product, create 2 prices: Monthly and Annual
   - Copy all 6 Price IDs (format: `price_xxxxx`)

2. **Get Stripe API Keys**
   - Go to: https://dashboard.stripe.com/apikeys
   - Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - ⚠️ Never share or commit this key!

3. **Setup Stripe Webhook** (for subscription updates)
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the **Webhook Secret** (starts with `whsec_`)

#### B. OpenAI Configuration
1. Go to: https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy the key (starts with `sk-`)

### 2. Vercel Deployment Steps

#### Option A: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to: https://vercel.com/new
   - Import your GitHub repository: `cyaaroughies/botnology`
   - Click "Import"

2. **Configure Project**
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: (leave empty)
   - Output Directory: `public`

3. **Add Environment Variables**
   Go to "Environment Variables" and add:

   ```
   APP_SECRET=<generate-with-command-below>
   OPENAI_API_KEY=sk-your-openai-key
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_TTS_MODEL=gpt-4o-mini-tts
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   STRIPE_PRICE_ASSOCIATES_MONTHLY=price_xxxxx
   STRIPE_PRICE_ASSOCIATES_ANNUAL=price_xxxxx
   STRIPE_PRICE_BACHELORS_MONTHLY=price_xxxxx
   STRIPE_PRICE_BACHELORS_ANNUAL=price_xxxxx
   STRIPE_PRICE_MASTERS_MONTHLY=price_xxxxx
   STRIPE_PRICE_MASTERS_ANNUAL=price_xxxxx
   ```

   Generate APP_SECRET with:
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your deployment URL (e.g., `botnology-xxxxx.vercel.app`)

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts and set up environment variables

# Deploy to production
vercel --prod
```

### 3. Post-Deployment Verification

#### A. Test Basic Functionality
1. Visit your site: `https://your-site.vercel.app`
2. Check health endpoint: `https://your-site.vercel.app/api/health`
   - Should return: `{"status": "ok", "openai": true, "stripe": true}`

#### B. Test Yeti Mode
1. Click "Yeti Mode" button in nav bar
2. Theme should switch from forest green to icy blue
3. Button should change to "Forest Mode"
4. Refresh page - theme should persist

#### C. Test Sign In
1. Click "Sign In" button
2. Enter name and email
3. Select a plan
4. Click "Sign In"
5. Should see success message
6. Button should change to "Signed In"

#### D. Test Checkout Flow
1. Make sure you're signed in first
2. Go to Pricing page: `/pricing.html`
3. Click any "Monthly" or "Annual" button
4. Should redirect to Stripe Checkout page
5. In test mode, use test card: `4242 4242 4242 4242`
6. After payment, should redirect back to site with success message

### 4. Update Stripe Webhook URL

After deployment:
1. Go to: https://dashboard.stripe.com/webhooks
2. Update webhook endpoint URL to: `https://your-site.vercel.app/api/stripe/webhook`
3. Save changes

### 5. Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" > "Domains"
3. Add your custom domain (e.g., `botnology101.com`)
4. Follow DNS configuration instructions
5. Update Stripe webhook URL to use custom domain

### 6. Monitoring & Troubleshooting

#### Check Logs
```bash
vercel logs <deployment-url>
```

Or in Vercel Dashboard:
- Go to your project
- Click on a deployment
- View "Functions" tab for API logs

#### Common Issues

**Checkout buttons not working:**
- Check browser console for errors (F12)
- Verify `STRIPE_SECRET_KEY` is set correctly
- Verify Price IDs match your Stripe products
- Make sure you're signed in before clicking checkout

**Theme toggle not working:**
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check that script.js is loading (Network tab in DevTools)

**API errors:**
- Check `/api/health` endpoint
- Verify environment variables are set in Vercel
- Check function logs in Vercel Dashboard

**Stripe webhook failures:**
- Verify webhook URL is correct
- Check webhook signing secret matches
- View webhook events in Stripe Dashboard

### 7. Testing Checklist

- [ ] Health endpoint returns OK
- [ ] Yeti Mode toggles theme
- [ ] Theme persists on page reload
- [ ] Sign In modal opens and works
- [ ] All navigation buttons work
- [ ] Checkout buttons redirect to Stripe
- [ ] Test payment succeeds (use test card)
- [ ] Success redirect works after payment
- [ ] API returns proper errors for invalid requests

### 8. Security Best Practices

1. **Never commit secrets**
   - Keep `.env` in `.gitignore`
   - Use Vercel environment variables

2. **Use Production Keys**
   - For production, use `sk_live_` keys
   - Set up separate test and production environments

3. **Monitor Stripe Dashboard**
   - Regularly check for failed payments
   - Monitor webhook delivery
   - Review subscription status

4. **Enable CORS restrictions**
   - In production, update CORS settings in `api/index.py`
   - Only allow your domain

### 9. Maintenance

#### Update Price IDs
If you change Stripe prices:
1. Update Price IDs in Vercel environment variables
2. Redeploy: `vercel --prod`

#### Update API
After code changes:
```bash
git add .
git commit -m "Update API"
git push
```
Vercel will auto-deploy on push.

#### Force Redeploy
```bash
vercel --prod --force
```

## 🎉 Your Site is Live!

Visit `www.botnology101.com` and test all features!

**Need help?** Check the Vercel logs and Stripe Dashboard for detailed error messages.
