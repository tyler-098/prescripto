# 🩺 Prescripto – Doctor Appointment & Live Chat App

Prescripto is a full-stack web application that allows users to book doctor appointments online and chat with healthcare professionals in real-time. Built with React, Tailwind CSS, Node.js, Express, and MongoDB.

---

## 🖼 Screenshots

### 🏠 Home Page  
![Home Page](./screenshots/home.png)

### 👨‍⚕️ Doctor Listing  
![Doctor List](./screenshots/doctor-list.png)

### 💬 Live Chat  
![Chat](./screenshots/chat.png)

> 📸 You can replace these images with your actual screenshots inside a `screenshots/` folder.

---

## 📖 Project Description (English / Hindi)

**Prescripto** is a web app to help users find doctors, book appointments, and consult via live chat.

**Prescripto** एक वेब ऐप्लिकेशन है जिससे यूज़र्स डॉक्टर से अपॉइंटमेंट बुक कर सकते हैं और लाइव चैट के जरिए सलाह ले सकते हैं।

---

## 🚀 Features

- 👨‍⚕️ Browse doctors by specialization
- 📅 Book and manage appointments
- 💬 Real-time chat with doctors
- 🔒 Secure login/signup for patients and doctors
- ☁️ Upload doctor profile images (Cloudinary)
- 🧑‍💻 Admin panel for control and management

---

## 🛠 Tech Stack

**Frontend**: React, Tailwind CSS, React Router  
**Backend**: Node.js, Express.js  
**Database**: MongoDB  
**Auth**: JWT, bcrypt  
**Image Upload**: Multer, Cloudinary

---

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/tyler-098/prescripto.git
cd prescripto
```
### 2. Install Dependencies

##For frontend:

```bash
cd frontend
npm install
```
##For admin:

```bash
cd admin
npm install
```

##For backend:

```bash
cd ../backend
npm install
```


### 3. Configure Environment Variables

In the server/ directory, create a .env file and add the following:

```.env
MONGODB_URI=your_mongo_db_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Run the App

Start the Backend
```bash
cd backend
npm start
```

Start the Frontend
```bash
cd ../frontend
npm run dev
```

Start the Admin Panel
```bash
cd ../admin
npm run dev
```

🤝 Contributing
Want to contribute? Follow these steps:

Fork the repo

Create a branch: git checkout -b feature-name

Commit your changes: git commit -m "added feature"

Push and submit a PR
