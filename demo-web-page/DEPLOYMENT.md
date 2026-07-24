# Deploying to Vercel

This guide will help you deploy your demo web page to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional, but recommended)
- Git repository (GitHub, GitLab, or Bitbucket)

## Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to Git Repository

First, make sure your code is pushed to a Git repository:

```bash
# If not already initialized
git init

# Add all files
git add .

# Commit changes
git commit -m "Add AI Jobs section with copy functionality"

# Push to your repository
git push origin main
```

### Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other (or leave as detected)
   - **Root Directory**: `demo-web-page`
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: Leave empty (uses root)
5. Click **"Deploy"**

### Step 3: Access Your Site

Once deployed, Vercel will provide you with:
- A production URL (e.g., `your-project.vercel.app`)
- Automatic HTTPS
- Global CDN distribution

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy from the demo-web-page directory

```bash
# Navigate to the demo-web-page directory
cd demo-web-page

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No (for first deployment)
# - What's your project's name? Enter a name
# - In which directory is your code located? ./
```

### Step 4: Deploy to Production

```bash
# Deploy to production
vercel --prod
```

## Method 3: Deploy via Git Integration (Recommended for Continuous Deployment)

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Vercel to access your repositories
5. Select the repository containing your demo-web-page

### Step 2: Configure Build Settings

- **Root Directory**: `demo-web-page`
- **Framework Preset**: Other
- **Build Command**: (leave empty)
- **Output Directory**: (leave empty)
- **Install Command**: (leave empty)

### Step 3: Deploy

Click **"Deploy"** and Vercel will:
- Build and deploy your site
- Provide a production URL
- Set up automatic deployments for future commits

## Automatic Deployments

Once connected via Git:
- **Every push to main branch** → Automatic production deployment
- **Every pull request** → Automatic preview deployment
- **Every branch** → Automatic preview deployment

## Custom Domain (Optional)

### Add a Custom Domain

1. Go to your project in Vercel Dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow the DNS configuration instructions
5. Vercel will automatically provision SSL certificate

## Environment Variables (If Needed)

If your site needs environment variables:

1. Go to **"Settings"** → **"Environment Variables"**
2. Add your variables:
   - `VARIABLE_NAME`: `value`
3. Redeploy for changes to take effect

## Vercel Configuration (vercel.json)

Your current `vercel.json` is empty. Here's an enhanced configuration you can use:

```json
{
  "version": 2,
  "public": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Troubleshooting

### Build Fails

- Check that all files are committed
- Verify the root directory is set to `demo-web-page`
- Check Vercel build logs for specific errors

### 404 Errors

- Ensure `index.html` is in the root of the deployment directory
- Check the output directory configuration

### Images Not Loading

- Verify image paths are relative (not absolute)
- Check that all image files are committed to the repository
- Ensure image files are in the same directory as `index.html`

## Useful Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Remove a deployment
vercel rm [deployment-name]

# Open project in browser
vercel open
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Custom Domains Guide](https://vercel.com/docs/concepts/projects/custom-domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Quick Deploy Button

You can also add a "Deploy to Vercel" button to your README:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.
