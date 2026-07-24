# ReflectLearning Demo Page

A professional demo landing page for ReflectLearning - an AI-powered learning platform.

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to the demo-web-page folder**:
   ```bash
   cd demo-web-page
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **reflectlearning-demo** (or your preferred name)
   - In which directory is your code located? **./** (current directory)

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add demo page"
   git push origin main
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure the project**:
   - Framework Preset: **Other**
   - Root Directory: **demo-web-page**
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

6. **Click "Deploy"**

### Option 3: Deploy via Drag & Drop

1. **Go to [Vercel](https://vercel.com/new)**

2. **Drag and drop the `demo-web-page` folder** onto the upload area

3. **Click "Deploy"**

## 📝 Before Deploying

Make sure to update the YouTube video ID in `index.html`:

```html
<!-- Find this line and replace YOUR_VIDEO_ID with your actual YouTube video ID -->
<iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID" ...>
```

## 🎨 Features

- Responsive design
- Interactive gallery with modal view
- Smooth animations
- Google AI Studio integration showcase
- GitHub repository links
- Tech stack badges
- Video demo section

## 📦 Files Included

- `index.html` - Main landing page
- `vercel.json` - Vercel configuration
- All image assets (PNG, JPEG)

## 🔗 Links

- GitHub: https://github.com/waghostel/ReflectLearning
- Google AI Studio: https://aistudio.google.com

## 📄 License

Built with ❤️ for learners everywhere.
