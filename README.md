# Therapy API

Welcome to the Therapy API, a backend solution designed to support therapy-related functionalities. This API offers various features to assist therapists and users in managing therapy-related tasks efficiently.

## Features

### Client Management
- **Register Client**: Allows therapists to register new clients.
- **View Client Information**: Provides access to client profiles and details.

### Appointment Management
- **Schedule Appointment**: Enables therapists to schedule appointments with clients.
- **Cancel Appointment**: Allows therapists or clients to cancel scheduled appointments.
- **View Appointments**: Provides a view of scheduled appointments.

### Invoice Management
- **Send Invoice**: Allows therapists to send invoices to clients.
- **Upload Invoice**: Enables clients to upload invoices.
- **View Invoice**: Clients can view invoices sent by therapists.
- **Invoice Control**: Provides functionality to manage invoices.

### User Authentication and Authorization
- **JWT Authentication**: Implements user authentication using JSON Web Tokens (JWT).
- **Role-Based Access Control**: Provides role-based access control to different API endpoints.

### Notifications
- **Push Notifications**: Supports push notifications to notify users about appointments, invoices, etc.

### Environment Variables
- **dotenv Integration**: Utilizes dotenv for managing environment variables.

### Database Integration
- **MongoDB**: Uses MongoDB as the primary database for storing therapy-related data.

### Cloudinary Integration
- **File Uploads**: Integrates with Cloudinary for uploading and storing files such as invoices, client documents, etc.

## Installation and Setup

### Prerequisites
- Node.js and npm installed on your machine.
- MongoDB database setup.
- Cloudinary account for file storage.

### Installation Steps
1. Clone the repository to your local machine.
2. Install dependencies using `npm install`.
3. Set up environment variables using a `.env` file.
4. Start the server using `npm dev` **"dev": "nodemon ./index.js localhost 3001"**

## Contributing
Contributions to the Therapy API project are welcome! If you'd like to contribute, please follow the guidelines outlined in [CONTRIBUTING.md](CONTRIBUTING.md).

## Contact
If you have any questions, suggestions, or feedback, feel free to reach out to us at [your_email@example.com](mailto:mauro.developer.br@gmail.com).

Thank you for choosing the Therapy API for your therapy-related needs!
