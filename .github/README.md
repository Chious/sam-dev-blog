# GitHub Actions Setup

This directory contains GitHub Actions workflows for the sam-dev-blog project.

## Workflows

### 1. CI (`ci.yml`)

- **Trigger**: Push to `main`/`develop` branches, Pull Requests to `main`
- **Purpose**: Build and test the project
- **Actions**:
  - Install dependencies
  - Build the Astro project
  - Upload build artifacts

### 2. Deploy (`deploy.yml`)

- **Trigger**: Push to `main` branch, Manual dispatch
- **Purpose**: Deploy the site to GitHub Pages
- **Actions**:
  - Build the Astro project
  - Deploy to GitHub Pages
  - Site URL: `https://chious.github.io/sam-dev-blog`

### 3. Code Quality (`code-quality.yml`)

- **Trigger**: Push to `main`/`develop` branches, Pull Requests to `main`
- **Purpose**: Run code quality checks
- **Actions**:
  - Astro file checking
  - TypeScript type checking
  - Build verification

## Setup Instructions

### GitHub Pages Configuration

1. Go to your repository: `https://github.com/Chious/sam-dev-blog`
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The site will be available at: `https://chious.github.io/sam-dev-blog`

### Environment Variables (if needed)

No additional environment variables are required for basic deployment.

### Branch Protection (Recommended)

Consider setting up branch protection rules for the `main` branch:

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Select the CI workflow as required status check

## Workflow Status

You can monitor workflow runs in the **Actions** tab of your repository.

## Troubleshooting

### Common Issues

1. **Deployment fails**: Check if GitHub Pages is enabled in repository settings
2. **Build errors**: Ensure all dependencies are correctly specified in `package.json`
3. **Path issues**: Verify the `base` configuration in `astro.config.mjs` matches your repository name

### Debugging

- Check the Actions tab for detailed logs
- Ensure Node.js version compatibility (using Node.js 20)
- Verify all Astro and Tailwind configurations are correct
