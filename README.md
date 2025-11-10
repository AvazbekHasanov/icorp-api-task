# Texnik Topshiriq - Request Manager

A webhook-based request management system built with Node.js, Express, and TypeScript. This application allows you to send requests to an external API, receive webhook callbacks, and manage secret data through a modern admin interface.

## Features

- 🚀 **Send API Requests**: Create and send requests to external APIs with custom messages
- 🔔 **Webhook Support**: Receive and process webhook callbacks with secret data
- 📊 **Admin Dashboard**: Beautiful, modern web interface for managing all requests
- 💾 **Persistent Storage**: File-based storage for request data and secrets
- ✅ **Request Verification**: Check and verify requests by combining secret parts
- 🔄 **Auto-refresh**: Real-time updates in the admin panel

## Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Storage**: JSON file-based storage

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Texnik-Topshiriq
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional):
```env
PORT=3000
WEBHOOK_BASE_URL=http://your-server-url.com
```

**Note**: If `WEBHOOK_BASE_URL` is not set, the application will use the current request's host. Make sure your server is accessible from the internet if you're expecting webhook callbacks.

## Usage

### Development Mode

Run the development server with hot-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Production Mode

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Endpoints

### `POST /v1/send/request`
Send a new request to the external API.

**Request Body:**
```json
{
  "message": "Hello from Avazbek"
}
```

**Response:**
```json
{
  "succes": true,
  "message": "Request was sent succesfully!",
  "requestId": "uuid-here"
}
```

### `POST /v1/recieve/secret/:requestId`
Webhook endpoint to receive secret data (part 2).

**Response:** `204 No Content`

### `GET /v1/secrets/:requestId`
Get a specific request by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "uuid-here",
    "part1": {...},
    "part2": {...},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "completedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### `GET /v1/secrets`
Get all requests.

**Response:**
```json
{
  "success": true,
  "data": {
    "request-id-1": {...},
    "request-id-2": {...}
  }
}
```

### `POST /v1/check/:requestId`
Check and verify a request by combining secret parts.

**Response:**
```json
{
  "success": true,
  "data": {...},
  "combinedCode": "code1code2"
}
```

## Admin Interface

Access the admin panel at `http://localhost:3000/` (or your configured port).

The admin interface provides:
- **Create Requests**: Send new requests with custom messages
- **View All Requests**: See all sent requests with their status
- **Request Details**: View part1, part2, and check responses
- **Check Requests**: Verify requests by combining secret parts
- **Auto-refresh**: Automatically updates every 10 seconds

## Project Structure

```
Texnik-Topshiriq/
├── dist/                 # Compiled JavaScript files
├── node_modules/         # Dependencies
├── public/              # Static files
│   └── admin.html       # Admin panel interface
├── src/                 # Source code
│   └── index.ts         # Main application file
├── .env                 # Environment variables (create this)
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── secrets.json         # Request storage (auto-generated)
```

## Configuration

### Environment Variables

- `PORT` (optional): Server port (default: 3000)
- `WEBHOOK_BASE_URL` (optional): Base URL for webhook callbacks. If not set, uses the current request's host.

### Port Management

The `predev` script automatically ensures the port is available before starting the development server.

## Storage

All request data is stored in `secrets.json` in the project root. This file is automatically created when the first request is made.

**Note**: Make sure to add `secrets.json` to your `.gitignore` if it contains sensitive data.

## Development


### TypeScript Configuration

The project uses TypeScript with strict mode enabled. Configuration can be found in `tsconfig.json`.

## License

This project is private and not licensed for public use.

## Author

Avazbek



