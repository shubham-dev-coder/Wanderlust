# 🌍 Wanderlust

A full-stack listing platform where users can explore, create, edit and manage travel listings.

Wanderlust is built using **Node.js, Express.js, MongoDB and EJS** with user authentication, reviews and CRUD functionality.

---

## 🚀 Features

- 🔐 User Signup & Login
- 👤 User Authentication
- 🏠 Create new listings
- ✏️ Edit existing listings
- 🗑️ Delete listings
- 🔍 View listing details
- ⭐ Add and manage reviews
- ⚠️ Error handling
- 💬 Flash messages
- 📱 Responsive UI
- 🗄️ MongoDB database integration
- 🧩 EJS templating with reusable layouts

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- Bootstrap
- EJS

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- Passport.js
- Passport-Local-Mongoose

### Other Tools
- EJS-Mate
- Method-Override
- Connect-Flash
- Express-Session

---

## 📂 Project Structure

```text
Wanderlust/
│
├── init/
│   ├── data.js
│   └── index.js
│
├── models/
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
│
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
│
├── views/
│   ├── includes/
│   │   ├── footer.ejs
│   │   └── navbar.ejs
│   │
│   ├── layouts/
│   │   └── boilerplate.ejs
│   │
│   ├── listings/
│   │   ├── edit.ejs
│   │   ├── index.ejs
│   │   ├── new.ejs
│   │   └── show.ejs
│   │
│   ├── Users/
│   │   ├── login.ejs
│   │   └── signup.ejs
│   │
│   └── error.ejs
│
├── app.js
├── schema.js
├── package.json
├── package-lock.json
└── .gitignore
