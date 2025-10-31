# FlowCraft - Appwrite Authentication Setup

This guide will help you configure Appwrite authentication for the FlowCraft application.

## Prerequisites

1. An Appwrite instance (local or cloud)
2. Node.js and pnpm installed
3. FlowCraft application cloned and dependencies installed

## Appwrite Setup

### 1. Create an Appwrite Project

1. Go to your Appwrite console
2. Click "Create Project"
3. Give your project a name (e.g., "FlowCraft")
4. Copy the **Project ID**

### 2. Add Web Platform

1. In your project, click "Add Platform"
2. Select "Web"
3. Add your hostname:
   - For development: `localhost:3000`
   - For production: your actual domain
4. Click "Create"

### 3. Configure Environment Variables

Create a `.env.local` file in the root of your project (copy from `.env.example`):

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
```

Replace:

- `NEXT_PUBLIC_APPWRITE_ENDPOINT`: Your Appwrite endpoint URL
  - For Appwrite Cloud: `https://cloud.appwrite.io/v1`
  - For self-hosted: `http://localhost/v1` or your custom URL
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite Project ID from step 1

## Application Structure

### Authentication Flow

1. **Landing Page** (`/`) - Public homepage with login/register buttons
2. **Login Page** (`/login`) - Email/password login form
3. **Register Page** (`/register`) - Account creation form
4. **Dashboard** (`/dashboard/*`) - Protected routes (requires authentication)
   - `/dashboard/issues` - Issues management
   - `/dashboard/current-sprint` - Current sprint view
   - `/dashboard/sprints` - Sprint planning
   - `/dashboard/analytics` - Project analytics

### Key Files

- `lib/appwrite.ts` - Appwrite client configuration
- `lib/auth.ts` - Authentication helper functions
- `contexts/auth-context.tsx` - Authentication state management
- `middleware.ts` - Route protection middleware
- `components/login-form.tsx` - Login form component
- `components/register-form.tsx` - Registration form component

## Running the Application

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure environment variables (see above)

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to:
   - Landing page: http://localhost:3000
   - Login: http://localhost:3000/login
   - Register: http://localhost:3000/register

## Testing Authentication

### Test Flow

1. **Register a new account**:

   - Go to `/register`
   - Fill in name, email, and password
   - Submit the form
   - You should be automatically logged in and redirected to `/dashboard/issues`

2. **Log out**:

   - Click the "Log Out" button in the navigation bar
   - You should be redirected to the landing page

3. **Log in with existing account**:

   - Go to `/login`
   - Enter your email and password
   - Submit the form
   - You should be redirected to `/dashboard/issues`

4. **Protected routes**:
   - Try accessing `/dashboard/issues` without being logged in
   - You should be redirected to `/login` with a redirect parameter

### Verify in Appwrite Console

1. Go to your Appwrite console
2. Navigate to "Auth" > "Users"
3. You should see your registered user
4. Check "Auth" > "Sessions" to see active sessions

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**:

   - Verify your email and password are correct
   - Check if the user exists in Appwrite console

2. **Redirected to login immediately after registration**:

   - Check browser console for errors
   - Verify environment variables are set correctly
   - Ensure your hostname is added to Appwrite platform settings

3. **CORS errors**:

   - Verify your hostname is correctly added in Appwrite platform settings
   - For development, ensure you're using `localhost:3000` (not `127.0.0.1`)

4. **Session not persisting**:
   - Check if cookies are enabled in your browser
   - Verify the Appwrite session cookie is being set
   - Check middleware configuration in `middleware.ts`

## Security Considerations

- **Password Requirements**: Minimum 8 characters (enforced by Zod schema)
- **Session Management**: Handled automatically by Appwrite
- **Route Protection**: Middleware checks for valid session cookie
- **Environment Variables**: Never commit `.env.local` to version control

## Next Steps

1. Configure email verification (optional)
2. Add password reset functionality
3. Implement OAuth providers (Google, GitHub, etc.)
4. Add role-based access control
5. Configure session duration and security settings

## Support

For more information about Appwrite authentication:

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Authentication Guide](https://appwrite.io/docs/products/auth)
- [Next.js with Appwrite](https://appwrite.io/docs/tutorials/nextjs)
