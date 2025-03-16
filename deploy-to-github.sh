#!/bin/bash

# Ensure script stops on first error
set -e

# Instructions for the user
echo "GitHub Deployment Script"
echo "========================"
echo "This script will help you deploy your CodePath project to GitHub."
echo "Please follow the prompts to complete the deployment process."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git first."
    exit 1
fi

# Check if repository has been initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    echo "Git repository initialized."
else
    echo "Git repository already initialized."
fi

# Prompt for GitHub username and repository name
read -p "Enter your GitHub username: " github_username
read -p "Enter the repository name (e.g., codepath): " repo_name

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo "Remote 'origin' already exists. Updating..."
    git remote set-url origin "https://github.com/$github_username/$repo_name.git"
else
    echo "Adding remote 'origin'..."
    git remote add origin "https://github.com/$github_username/$repo_name.git"
fi

# Add all files to git
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
read -p "Enter a commit message (e.g., 'Initial commit'): " commit_message
git commit -m "$commit_message"

# Push to GitHub
echo "Pushing to GitHub..."
echo "You might be prompted for your GitHub credentials."
git push -u origin main || git push -u --force origin main

echo ""
echo "Deployment completed!"
echo "Your code is now available at: https://github.com/$github_username/$repo_name"
echo ""
echo "Next steps:"
echo "1. Visit the repository URL above to verify your code was uploaded"
echo "2. Set up GitHub Pages if you want to deploy the frontend"
echo "3. To deploy the full application, consider using services like Heroku, Render, or Railway"