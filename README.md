# Motabari3 🩸

**An open-source blood donation management system that helps people in Morocco find blood quickly when they need it.**

[Live demo]([https://motabari3-azure.vercel.app](https://motabarii3.vercel.app/)) · [Report a bug](https://github.com/4bderahman/Motabari3/issues) · [Request a feature](https://github.com/4bderahman/Motabari3/issues)

---

## Why Motabari3?

In Morocco, there is no central, easy-to-use system for finding blood donors or checking blood availability. When a patient urgently needs a specific blood type, families often rely on phone calls, social media posts, and word of mouth, and every lost hour matters.

Motabari3 connects **donors**, **hospitals**, and **administrators** on one platform so that a blood request can reach the right people fast, and so donation history and eligibility are tracked reliably.

## Features

- **Three user roles**: donors, hospitals, and administrators, each with their own dashboard and permissions.
- **Hospital blood requests**: hospitals can post requests for a specific blood type so matching donors can respond.
- **Donation tracking**: keeps each donor's history and calculates when they are eligible to donate again.
- **QR code verification**: scan a donor's QR code for quick identity and eligibility checks at donation time.
- **Mobile-friendly**: responsive interface that works on phones, which is how most users will access it.
- **Secure authentication**: JWT-based login with role-based access.


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Auth | JSON Web Tokens (JWT) |
| QR scanning | html5-qrcode, jsQR |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/4bderahman/Motabari3.git
cd Motabari3

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install
cd ..
```

### Configuration

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A long, random secret used to sign tokens |

> ⚠️ **Never commit your `.env` file or reuse the example secrets in production.**

### Run locally

```bash
npm run dev
```

### Creating the first admin account

For security, Motabari3 does not ship with default credentials. Create your first admin account with your own email and a strong password, using the project's setup or seed script, or by registering a user and promoting it in the database. Never use a default or shared admin password on a live deployment.

## Project Structure

```
Motabari3/
├── src/        # React frontend
├── server/     # Express.js backend
├── api/        # Serverless API entry for Vercel
├── public/     # Static assets
└── DEPLOYMENT.md   # Deployment guide
```

## Deployment

The project is configured for Vercel (`vercel.json`). See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.

## Roadmap

These are the directions the project is heading. Contributions are welcome on any of them.

- [ ] Search for donors by city and blood type
- [ ] SMS / WhatsApp notifications for urgent requests
- [ ] Arabic, French, and Darija language support
- [ ] Live blood-stock dashboard for hospitals
- [ ] Automated tests and CI
- [ ] Public API documentation

## Contributing

Contributions are very welcome, whether it's code, translations, design, documentation, or feedback from people who work with blood donation.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Look for issues labeled `good first issue` if you're just getting started.

## Security

If you find a security vulnerability, please **do not** open a public issue. Contact the maintainer directly via GitHub: [@4bderahman](https://github.com/4bderahman).

This system handles sensitive health-related data. If you deploy it, use strong secrets, HTTPS, and follow your local data-protection rules.

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

## Author

Built by [@4bderahman](https://github.com/4bderahman) to make finding blood faster for people in Morocco.

If this project helps you or you'd like to collaborate, feel free to open an issue or reach out.
