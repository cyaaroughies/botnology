# How to Deploy Your Changes

## TL;DR (Quick Answer)

Your changes are NOT live because they're in a feature branch.

**Fix in 30 seconds:**
```bash
git checkout main
git merge copilot/add-student-dashboard
git push origin main
```

Done! Wait 2-3 minutes, then check: https://www.botnology101.com

---

## Understanding the Problem

### Question: "Where are my changes?"
**Answer**: In `copilot/add-student-dashboard` branch (not deployed)

### Question: "Why isn't the site updating?"
**Answer**: Production deploys from `main` branch only

### Question: "Why is Stripe broken?"
**Answer**: `main` branch still has `script.html` (should be `script.js`)

### Question: "Why is lecture image still showing?"
**Answer**: `main` branch still has the old `index.html`

---

## The Simple Truth

```
Feature Branch (copilot/add-student-dashboard)
    ↓
    Has all your changes ✅
    BUT not deployed ❌
    
Main Branch (main)
    ↓
    Has old code ❌
    BUT is deployed ✅
    
Solution: Merge feature → main
```

---

## Two Ways to Deploy

### Option 1: Command Line (Fast)

```bash
# 1. Go to main branch
git checkout main

# 2. Get your changes
git merge copilot/add-student-dashboard

# 3. Deploy
git push origin main

# 4. Wait 2-3 minutes

# 5. Verify
open https://www.botnology101.com
```

### Option 2: GitHub Web (Safer)

1. Go to: https://github.com/cyaaroughies/botnology
2. Click: "Pull requests" → "New pull request"
3. Set: Base `main` ← Compare `copilot/add-student-dashboard`
4. Click: "Create Pull Request"
5. Review changes
6. Click: "Merge Pull Request"
7. Wait 2-3 minutes
8. Visit: https://www.botnology101.com

---

## After Deployment

### What to Check:

1. **Landing Page**
   - Visit: https://www.botnology101.com
   - Verify: Lecture image is GONE ✅

2. **Stripe Checkout**
   - Click: "Pricing" or "Tuition Plans"
   - Click: Any "Monthly" or "Annual" button
   - Verify: Redirects to Stripe (not error) ✅

3. **Console (Optional)**
   - Press F12 in browser
   - Check: No errors about `script.js` not found ✅

---

## Common Questions

### "Do I deploy too much?"

**No!** You're not deploying at all - that's the problem! 😊

You're committing and pushing, but to a feature branch. Feature branches don't auto-deploy.

**Rule**: Only `main` branch auto-deploys.

### "Which deploy is it on?"

**Current**: `main` branch (old code)
**Your changes**: `copilot/add-student-dashboard` branch (not deployed yet)

After merge: Both will be the same ✅

### "How do I know it worked?"

After pushing to `main`:

1. **Vercel Dashboard**: 
   - Shows: "Building..." then "Deployed"
   - URL: https://vercel.com/dashboard

2. **GitHub**: 
   - Check: Latest commit on `main` branch
   - Should match your feature branch

3. **Live Site**:
   - Visit: https://www.botnology101.com
   - Changes visible in 2-3 minutes

---

## For Future Reference

### Starting New Work:

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes, commit
git add .
git commit -m "Add feature"

# Push to see in PR
git push origin feature/my-new-feature
```

### Deploying to Production:

```bash
# Always merge to main
git checkout main
git merge feature/my-new-feature
git push origin main

# Site updates automatically!
```

### Checking Where You Are:

```bash
# Current branch
git branch

# Compare with main
git diff main..HEAD --stat

# See commits not in main
git log main..HEAD --oneline
```

---

## Emergency Rollback

If something breaks after deployment:

```bash
# Find last good commit
git log main --oneline -10

# Rollback to it
git checkout main
git reset --hard <commit-id>
git push origin main --force

# Only use --force in emergency!
```

---

## Remember

1. **Feature branches** = Work in progress (not deployed)
2. **Main branch** = Production (auto-deploys)
3. **To deploy** = Merge to main and push

That's it! 🎯

---

## Need More Help?

- Full guide: `DEPLOYMENT_STATUS.md`
- Branch comparison: `BRANCH_COMPARISON.md`
- Site URL: `SITE_URL.md`

---

Last Updated: 2026-01-30
