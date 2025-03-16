# CodePath Learning Platform

A Mimo-inspired coding education platform that provides an interactive learning experience for developers, featuring comprehensive course tracking, adaptive learning paths, and a robust code editor.

## Features

- **Interactive Learning**: Engage with coding lessons in a real-time code editor
- **Progress Tracking**: Monitor your advancement through courses and learning paths
- **Adaptive Learning Paths**: Follow curated paths to master programming skills
- **User Authentication**: Secure login and registration system 
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (optional)
- **Authentication**: Passport.js with local strategy
- **State Management**: TanStack Query
- **Code Editor**: Custom Monaco-based editor

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/codepath.git
cd codepath

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Deployment

### GitHub Deployment

To deploy your application to GitHub:

1. Create a new GitHub repository
2. Use our automated deployment script:

```bash
# Make the script executable
chmod +x deploy-to-github.sh

# Run the script
./deploy-to-github.sh
```

3. Follow the prompts to push your code to GitHub
4. Your GitHub Actions workflow will automatically build and test your code

### Netlify Deployment

To deploy to Netlify:

1. Log in to your Netlify account
2. Click "New site from Git"
3. Connect to your GitHub repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `client/dist`
5. Set environment variables:
   - `NODE_VERSION`: `18`
6. Deploy the site

Alternatively, set up the GitHub Actions deployment by adding the following secrets to your repository:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

The CI/CD pipeline will automatically deploy your application to Netlify on pushes to the main branch.

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   ├── pages/      # Application pages
│   │   └── App.tsx     # Main application component
├── server/             # Backend Express application
│   ├── index.ts        # Entry point
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Data storage implementation
│   └── auth.ts         # Authentication logic
├── shared/             # Shared code between client and server
│   └── schema.ts       # Data schemas and types
└── .github/workflows/  # GitHub Actions configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.