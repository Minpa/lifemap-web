# CloudKit Authentication Setup Guide

This guide will help you set up CloudKit authentication for the LifeMap web application.

---

## 📋 Prerequisites

- Apple Developer Account (required for CloudKit)
- Access to Apple Developer Portal
- Next.js 14+ application (already set up)

---

## 🚀 Setup Steps

### 1. Create CloudKit Container

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **CloudKit Containers** from the sidebar
4. Click the **+** button to create a new container
5. Enter a container identifier (e.g., `iCloud.com.yourcompany.lifemap`)
6. Click **Continue** and then **Register**

### 2. Generate API Token

1. In the CloudKit Dashboard, select your container
2. Go to **API Access** tab
3. Click **Generate API Token**
4. Copy the generated token (you won't be able to see it again!)

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# CloudKit Configuration
NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=iCloud.com.yourcompany.lifemap
NEXT_PUBLIC_CLOUDKIT_API_TOKEN=your_api_token_here
NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT=development

# Other configurations
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**Important**: Never commit `.env.local` to version control!

### 4. Configure CloudKit Database

1. Go to CloudKit Dashboard
2. Select your container
3. Go to **Schema** tab
4. Create any custom record types you need (optional for authentication)

### 5. Enable Sign in with Apple

1. Go to **Certificates, Identifiers & Profiles**
2. Select **Identifiers**
3. Select your App ID or create a new one
4. Enable **Sign in with Apple** capability
5. Configure domains and return URLs:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

---

## 🔧 Configuration Files

### Environment Variables

The application uses the following CloudKit environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID` | Your CloudKit container identifier | Yes |
| `NEXT_PUBLIC_CLOUDKIT_API_TOKEN` | API token from CloudKit Dashboard | Yes |
| `NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT` | `development` or `production` | No (defaults to `development`) |

### Next.js Configuration

The `next.config.js` file is already configured to expose CloudKit environment variables:

```javascript
env: {
  NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID: process.env.NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID,
  NEXT_PUBLIC_CLOUDKIT_API_TOKEN: process.env.NEXT_PUBLIC_CLOUDKIT_API_TOKEN,
  NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT: process.env.NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT || 'development',
}
```

---

## 🧪 Testing

### Development Mode

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/login`

3. Click "Apple로 로그인" to test authentication

4. Check browser console for any errors

### Production Mode

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Test authentication flow

---

## 🔍 Troubleshooting

### CloudKit Not Configured Error

**Error**: `NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID is not set`

**Solution**: 
- Ensure `.env.local` file exists in project root
- Verify environment variables are set correctly
- Restart the development server after adding environment variables

### CloudKit Initialization Failed

**Error**: `서비스 초기화에 실패했습니다`

**Solution**:
- Check that your API token is valid
- Verify container ID matches your CloudKit container
- Check browser console for detailed error messages
- Ensure CloudKit Dashboard shows container as active

### Authentication Failed

**Error**: `로그인에 실패했습니다`

**Solution**:
- Verify "Sign in with Apple" is enabled for your App ID
- Check that return URLs are configured correctly
- Ensure user has an Apple ID and is signed in
- Check browser console for CloudKit error codes

### Network Errors

**Error**: `네트워크 연결을 확인해주세요`

**Solution**:
- Check internet connection
- Verify CloudKit services are operational (check Apple System Status)
- Check browser network tab for failed requests
- Ensure no firewall is blocking CloudKit requests

---

## 📚 CloudKit JS SDK Documentation

- [CloudKit JS Documentation](https://developer.apple.com/documentation/cloudkitjs)
- [CloudKit Web Services](https://developer.apple.com/documentation/cloudkit/cloudkit_web_services)
- [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)

---

## 🔐 Security Best Practices

### Environment Variables

- ✅ **DO**: Store sensitive data in `.env.local`
- ✅ **DO**: Add `.env.local` to `.gitignore`
- ✅ **DO**: Use different tokens for development and production
- ❌ **DON'T**: Commit API tokens to version control
- ❌ **DON'T**: Share API tokens publicly

### API Token Management

- Rotate API tokens periodically
- Use separate tokens for different environments
- Revoke tokens immediately if compromised
- Monitor token usage in CloudKit Dashboard

### User Data

- All user data is stored in CloudKit private database
- Data is encrypted in transit and at rest
- Users control their data through iCloud settings
- Implement proper data deletion on user request

---

## 🚀 Deployment

### Vercel

1. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all `NEXT_PUBLIC_CLOUDKIT_*` variables
   - Set for Production, Preview, and Development

2. Deploy:
   ```bash
   vercel --prod
   ```

### Railway

1. Add environment variables in Railway dashboard:
   - Go to your project
   - Click on Variables tab
   - Add all `NEXT_PUBLIC_CLOUDKIT_*` variables

2. Deploy:
   ```bash
   railway up
   ```

### Other Platforms

Ensure all CloudKit environment variables are set in your deployment platform's environment configuration.

---

## 📊 Monitoring

### CloudKit Dashboard

Monitor your CloudKit usage:
- Active users
- API requests
- Storage usage
- Error rates

### Application Logs

Check application logs for:
- Authentication failures
- CloudKit errors
- Session expirations
- Network issues

---

## 🆘 Support

### Apple Developer Support

- [Apple Developer Forums](https://developer.apple.com/forums/)
- [CloudKit Support](https://developer.apple.com/support/cloudkit/)
- [Technical Support](https://developer.apple.com/support/technical/)

### LifeMap Support

- Check GitHub Issues
- Review documentation
- Contact development team

---

## ✅ Checklist

Before going to production:

- [ ] CloudKit container created
- [ ] API token generated and stored securely
- [ ] Environment variables configured
- [ ] Sign in with Apple enabled
- [ ] Return URLs configured
- [ ] Authentication tested in development
- [ ] Authentication tested in production
- [ ] Error handling verified
- [ ] Session persistence tested
- [ ] Logout functionality tested
- [ ] Guest mode tested
- [ ] Monitoring set up
- [ ] Documentation reviewed

---

## 🎉 Success!

Once all steps are complete, your LifeMap application will have:

- ✅ Apple Sign-In authentication
- ✅ iCloud data synchronization
- ✅ Secure session management
- ✅ Guest mode support
- ✅ Automatic session restoration
- ✅ Protected routes
- ✅ Error handling with retry logic

Users can now sign in with their Apple ID and have their data automatically synced across all their devices via iCloud!
