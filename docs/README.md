# ResearchBase Landing Page

## 🚀 Deploy to GitHub Pages

### Step 1: Push to GitHub

```bash
cd "C:\Users\aditr\OneDrive\Desktop\Current projects\ResearchBase"
git add .
git commit -m "Add landing page"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings**
3. Scroll to **Pages** (in the left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/docs`
5. Click **Save**

Your site will be live at: `https://yourusername.github.io/researchbase/`

---

## 📝 Customize the Landing Page

### 1. Update Download Link

In `docs/index.html`, line 102, replace:
```html
<a href="https://github.com/yourusername/researchbase/releases/latest" class="cta-button">
```

With your actual GitHub release URL.

### 2. Add a Screenshot

1. Take a screenshot of your app
2. Save it as `docs/screenshot.png`
3. In `index.html`, replace the screenshot placeholder (line 173):

```html
<img src="screenshot.png" alt="ResearchBase Screenshot" style="width: 100%; border-radius: 1rem; box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
```

### 3. Update GitHub Links

Replace `yourusername/researchbase` with your actual repo (lines 102, 218).

---

## 🎬 Create a Release

1. Build your app: `npm run build:win`
2. Go to GitHub → **Releases** → **Create a new release**
3. Tag: `v1.0.0`
4. Title: `ResearchBase v1.0.0`
5. Upload: `dist/ResearchBase Setup 1.0.0.exe`
6. Click **Publish release**

---

## ✅ Final Checklist

- [ ] Push code to GitHub
- [ ] Enable GitHub Pages (Settings → Pages → `/docs`)
- [ ] Create a release with your `.exe` file
- [ ] Update download link in `index.html`
- [ ] Add screenshot
- [ ] Update GitHub links
- [ ] Share your live URL!

Your landing page will be: `https://[username].github.io/[repo-name]/`
