
**Video Conferencing Platform – MERN Stack Video Conferencing App**

## Overview
Video Conferencing Platform is a full-stack web application built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** that allows users to create and join video meetings in real time. The application replicates essential video conferencing features such as secure authentication, instant meeting creation, video/audio communication, and responsive meeting rooms. It uses **WebRTC** for peer-to-peer media streaming and **Socket.IO** for real-time signaling, ensuring a seamless communication experience.

## Features

### Authentication
- User signup and login using **JWT Authentication**
- Protected routes for authenticated users
- Secure session management

### Meeting Functionality
- Create new meetings with unique meeting IDs
- Join existing meetings using a meeting ID
- Real-time video and audio communication
- Toggle camera and microphone controls
- Screen sharing functionality
- Responsive and user-friendly meeting room interface

### Real-Time Communication
- **WebRTC** for peer-to-peer media streaming
- **Socket.IO** for signaling and real-time communication
- Live participant join/leave notifications

### User Experience
- Responsive UI for desktop devices
- Modern dashboard interface
- Copy meeting link functionality for easy sharing
- Meeting history management

## Tech Stack

### Frontend
- **React.js**
- **Context API / Redux**
- **Tailwind CSS / CSS Modules**
- **Socket.IO Client**
- **WebRTC**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **Socket.IO**
- **JWT Authentication**

## Architecture Overview
- **Frontend Layer:** Built with **React.js** to manage the user interface, meeting dashboard, and video room interactions.
- **Backend Layer:** Built with **Node.js** and **Express.js** to handle APIs, user authentication, and meeting management.
- **Database Layer:** **MongoDB** stores user credentials, meeting data, and meeting history.
- **Real-Time Layer:** **Socket.IO** handles signaling and participant updates.
- **Media Layer:** **WebRTC** enables low-latency peer-to-peer audio/video communication.

## Key Highlights
- Developed a real-time video conferencing application with secure user authentication.
- Integrated **WebRTC** for live audio/video streaming.
- Implemented **Socket.IO** for seamless signaling and room communication.
- Built a responsive meeting interface with screen sharing and media controls.
- Designed scalable backend APIs for meeting and user management.
