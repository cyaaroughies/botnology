# Botnology Setup Guide

## Environment Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the `.env` file with your API keys and secrets.

## Mock Stripe API
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the mock Stripe API server:
   ```bash
   node api/mock-stripe.js
   ```
   The server will run at `http://localhost:3001`.

## Running the Application
1. Start the development server:
   ```bash
   npm start
   ```
2. Ensure the `API_BASE_URL` in `.env` points to the mock server during development:
   ```env
   API_BASE_URL=http://localhost:3001
   ```

## Troubleshooting
- **Missing Dependencies**: Run `npm install` to install required packages.
- **API Errors**: Check the mock server logs for detailed error messages.
- **Environment Issues**: Ensure `.env` is properly configured and matches `.env.example`.

For further assistance, refer to the project documentation or contact the maintainer.