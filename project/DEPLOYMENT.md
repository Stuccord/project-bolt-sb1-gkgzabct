# Deployment Guide for Netlify

This guide will help you deploy your BearGuard Insurance Agency Portal to Netlify.

## Prerequisites

1. A Netlify account (sign up at https://netlify.com)
2. Your GitHub repository pushed with this code
3. Your Supabase project URL and Anon Key from the `.env` file

## Deployment Steps

### 1. Connect to Netlify

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Authorize Netlify to access your repository

### 2. Configure Build Settings

Netlify will automatically detect the settings from `netlify.toml`, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

### 3. Add Environment Variables

In the Netlify dashboard, go to:
**Site settings > Environment variables**

Add these environment variables from your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Deploy

1. Click "Deploy site"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your site will be live at a URL like: `https://random-name-12345.netlify.app`

### 5. Custom Domain (Optional)

To use a custom domain:

1. Go to **Site settings > Domain management**
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS

### 6. Configure Supabase

Update your Supabase project to allow requests from your Netlify URL:

1. Go to your Supabase dashboard
2. Navigate to **Authentication > URL Configuration**
3. Add your Netlify URL to the "Site URL" field
4. Add your Netlify URL to "Redirect URLs"

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Can navigate to login page
- [ ] Can sign up new users
- [ ] Can log in existing users
- [ ] Dashboard loads with data
- [ ] All features work as expected

## Troubleshooting

### Build Fails

- Check the build logs in Netlify
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Can't Log In

- Verify environment variables are correct
- Check Supabase URL configuration
- Ensure your Netlify URL is added to Supabase allowed URLs

### 404 Errors on Page Refresh

- This should be handled by `netlify.toml` redirects
- If still occurring, verify the `netlify.toml` file is in your repository root

## Support

For issues specific to:
- **Netlify**: Check https://docs.netlify.com
- **Supabase**: Check https://supabase.com/docs
- **Application bugs**: Contact your development team
