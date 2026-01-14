# uk223 Skeleton

## Quick Links
- Homepage: http://localhost:3000
- Login: http://localhost:3000/login
- User Component: http://localhost:3000/users

## Prerequisites

Before you start, make sure you have the following installed on your computer:

- **Node.js** (version 16 or higher)
  - Download from: https://nodejs.org/
  - To check if installed, open a terminal and run: `node --version`
- **Yarn** (package manager)
  - After installing Node.js, install Yarn by running: `npm install -g yarn`
  - To check if installed, run: `yarn --version`
- **Git** (version control)
  - Download from: https://git-scm.com/
  - To check if installed, run: `git --version`

## Setup Instructions

### 1. Clone the Repository

Open a terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone <repository-url>
cd react_frontend
```

### 2. Install Dependencies

Install all required packages by running:

```bash
yarn install
```

This will download all the libraries and tools needed for the project.

### 3. Start the Development Server

Run the following command to start the application:

```bash
yarn dev
```

The application will open at http://localhost:3000

### 4. Stop the Development Server

To stop the server, press `Ctrl + C` in the terminal.

## Common Commands

- `yarn dev` - Start the development server
- `yarn build` - Build the application for production
- `yarn test` - Run tests
- `yarn preview` - Preview the production build

## Project Structure

```
react_frontend/
├── src/               # Source code
│   ├── components/    # React components
│   ├── pages/         # Page components
│   └── ...
├── public/            # Static files
├── package.json       # Project dependencies
└── README.md          # This file
```

## Troubleshooting

### Port Already in Use

If you see an error that port 3000 is already in use:
1. Stop any other applications running on port 3000
2. Or change the port in your configuration

### Installation Errors

If you encounter errors during `yarn install`:
1. Delete the `node_modules` folder and `yarn.lock` file
2. Run `yarn install` again
3. Make sure you have the correct Node.js version (16+)

### Need Help?

If you're stuck, ask your instructor or check the project documentation.

## Components
