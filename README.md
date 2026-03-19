# StayHub

A full-stack property listing platform (Airbnb clone) built with Node.js, Express, and MongoDB Atlas.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Cloud)
- **ODS**: Mongoose
- **Session**: express-session with connect-mongo (persistent storage)
- **Deployment**: Render-ready

## Features
- Real-time property listings
- User authentication with Passport.js
- Cloudinary integration for images
- Mapbox integration for location view
- Persistent sessions (stay logged in after server restart)

## Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file and add your `MONGO_URI`, `CLOUD_NAME`, `CLOUD_API_KEY`, etc.
4. Run `node init/index.js` to seed the database.
5. Run `nodemon app.js` to start the server.
