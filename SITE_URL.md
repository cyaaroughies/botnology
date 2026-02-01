# Botnology 101 - Site URL Information

## 🌐 Production Site URL

**https://www.botnology101.com**

This is your live, production website where users can access the Botnology 101 AI tutor platform.

---

## 📍 Main Pages

Visit these pages on the live site:

- **Home**: https://www.botnology101.com/
- **Dashboard**: https://www.botnology101.com/dashboard.html
- **Pricing Plans**: https://www.botnology101.com/pricing.html
- **Courses**: https://www.botnology101.com/courses.html
- **Study Hall**: https://www.botnology101.com/study-hall.html
- **Quiz Module**: https://www.botnology101.com/quiz-module.html
- **Student Dashboard**: https://www.botnology101.com/student-dashboard.html

---

## 🔧 API Endpoints

The API is accessible at the `/api/` path:

- **Health Check**: https://www.botnology101.com/api/health
- **Authentication**: https://www.botnology101.com/api/auth
- **Chat**: https://www.botnology101.com/api/chat
- **Text-to-Speech**: https://www.botnology101.com/api/tts
- **Quiz Generation**: https://www.botnology101.com/api/quiz/generate
- **Stripe Checkout**: https://www.botnology101.com/api/stripe/create-checkout-session

---

## 💻 Local Development URLs

When running the site locally:

### Using Uvicorn (FastAPI server)
```bash
python -m uvicorn api.index:app --host 0.0.0.0 --port 3050 --reload
```
- **Local URL**: http://localhost:3050

### Using Vercel Dev
```bash
vercel dev
```
- **Local URL**: http://localhost:3000

---

## ✅ Testing the Site

### Quick Health Check
```bash
curl https://www.botnology101.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "openai": true,
  "stripe": true,
  "public_dir_exists": true
}
```

### Open in Browser
Simply visit: **https://www.botnology101.com**

---

## 🚀 Deployment Info

- **Platform**: Vercel
- **Configuration**: `vercel.json`
- **Environment**: Production
- **Custom Domain**: www.botnology101.com

---

## 📝 Notes

- The site is a FastAPI backend with static frontend
- All static files are served from the `public/` directory
- API routes are prefixed with `/api/`
- Stripe integration is live and configured
- OpenAI chat and TTS features are enabled

---

**Last Updated**: January 30, 2026

**Status**: 🟢 Site is LIVE and operational at https://www.botnology101.com
