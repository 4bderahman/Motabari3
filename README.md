# Motabari3 - Blood Donation Management System

A comprehensive blood donation management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- **User Management**: Admin, donor, and hospital user roles
- **QR Code Scanning**: Scan donor QR codes for quick verification
- **Donation Tracking**: Track donor history and eligibility
- **Hospital Requests**: Allow hospitals to request specific blood types
- **Responsive Design**: Mobile-friendly interface for all users

## Technologies Used

- **Frontend**: React.js, TailwindCSS, Lucide React (icons)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code**: html5-qrcode and jsQR for scanning

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/4bderahman/Motabari3.git
   cd Motabari3
   ```

2. Install dependencies:
   ```
   npm install
   cd server
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the necessary environment variables (e.g., MONGODB_URI, JWT_SECRET)

4. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

- `/src` - React frontend code
- `/server` - Express.js backend code
- `/public` - Static assets

## Contributors

- Abderrahman (Frontend & Backend Development)
- Yassine (Design & Frontend Development)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
