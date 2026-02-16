import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import styles from "../styles/videoComponent.module.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { io } from "socket.io-client";
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { Badge } from '@mui/material';

// Server URL
const server_url = "http://localhost:8000";

// WebRTC connections
var connections = {};
const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const videoRef = useRef([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);

  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState();
  const [screen, setScreen] = useState();
  const [showModal, setModal] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  const routeTo = useNavigate();

  // ------------------------------
  // Permissions and Local Stream
  // ------------------------------
  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(!!audioPermission);

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  // ------------------------------
  // Helper functions: Silence & Black Video
  // ------------------------------
  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  // ------------------------------
  // Get User Media & Stream Management
  // ------------------------------
  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
          })
          .catch(e => console.log(e));
      });
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);

      try {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) {
        console.log(e);
      }

      const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      for (let id in connections) {
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
            }).catch(e => console.log(e));
        });
      }
    });
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) { }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) getUserMedia();
  }, [audio, video]);

  // ------------------------------
  // Socket / Signaling
  // ------------------------------
  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId].createAnswer().then(description => {
                connections[fromId].setLocalDescription(description).then(() => {
                  socketIdRef.current.emit("signal", fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
                }).catch(e => console.log(e));
              }).catch(e => console.log(e));
            }
          }).catch(e => console.log(e));
      }

      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
      }
    }
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages(prev => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) setNewMessages(prev => prev + 1);
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos(videos => videos.filter(video => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach(socketListId => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          };

          connections[socketListId].onaddstream = (event) => {
            const videoExists = videoRef.current.find(video => video.socketId === socketListId);

            if (videoExists) {
              setVideos(videos => {
                const updateVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updateVideos;
                return updateVideos;
              });
            } else {
              const newVideo = { socketId: socketListId, stream: event.stream, autoPlay: true, playsInline: true };
              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream != null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;
          }
        });

        // Send local stream to all other peers
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (err) {
              connections[id2].createOffer().then(description => {
                connections[id2].setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }));
                  }).catch(e => console.log(e));
              });
            }
          }
        }
      });
    });
  };

  // ------------------------------
  // Media & Controls
  // ------------------------------
  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  const connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  const handleVideo = () => setVideo(!video);
  const handleAudio = () => setAudio(!audio);
  const handleScreen = () => setScreen(!screen);

  const handleEndCall = () => {
    try {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    } catch (e) { console.log(e); }
    routeTo("/home");
  };

  const sendMessage = () => {
    if (!message.trim()) return; // Avoid sending empty messages
    setMessages(prev => [...prev, { sender: username, data: message }]);
    socketRef.current.emit("chit-message", message, username);
    setMessage("");
  };

  // ------------------------------
  // Display Media (Screen Sharing)
  // ------------------------------
  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) { console.log(e); }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then(() => {
        connections[id].setLocalDescription(connections[id].localDescription)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
          }).catch(e => console.log(e));
      });
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);
      try {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) { console.log(e); }

      const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      getUserMedia();
    });
  };

  const getDisplayMedia = () => {
    if (screen && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch(e => console.log(e));
    }
  };

  useEffect(() => {
    if (screen !== undefined) getDisplayMedia();
  }, [screen]);

  // ------------------------------
  // JSX Rendering
  // ------------------------------
  return (
    <div>
      {askForUsername ? (
        <div
  style={{
    display: 'flex',         // enables flex layout
    flexDirection: 'column', // stack items vertically
    alignItems: 'center',    // center horizontally
    justifyContent: 'center',// center vertically
    height: '100vh',         // full viewport height
    gap: '20px',             // spacing between elements
    textAlign: 'center',     // center text
  }}
>
  <h2>Enter into Lobby</h2>

  <TextField
    id="outlined-basic"
    label="Username"
    value={username}
    onChange={e => setUsername(e.target.value)}
    variant="outlined"
    style={{ width: '250px' }} // optional: set input width
  />

  <Button variant="contained" onClick={connect}>
    Connect
  </Button>

  <video
    ref={localVideoRef}
    autoPlay
    muted
    style={{
      marginTop: '20px',   // optional extra spacing above video
      width: '400px',      // video width
      borderRadius: '8px', // optional rounded corners
      backgroundColor: '#000'
    }}
  ></video>
</div>

      ) : (
        <div className={styles.appContainer}>
          {/* Top Bar */}
          <div className={styles.topBar}>
            <h3>Meeting Room</h3>
            <p>{username}</p>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Video Section */}
            <div className={styles.videoSection}>
              <video className={styles.localVideo} ref={localVideoRef} autoPlay muted />
              <div className={styles.remoteGrid}>
                {videos.map(video => (
                  <video
                    key={video.socketId}
                    data-socket={video.socketId}
                    ref={ref => { if (ref && video.stream) ref.srcObject = video.stream }}
                    autoPlay
                    playsInline
                    className={styles.remoteVideo}
                  />
                ))}
              </div>
            </div>

            {/* Chat Panel */}
            {showModal && (
              <div className={styles.chatPanel}>
                <h3>Chat</h3>
                <div className={styles.chatMessages}>
                  {messages.length > 0 ? messages.map((item, index) => (
                    <div key={index} className={styles.chatMessage}>
                      <strong>{item.sender}</strong>
                      <p>{item.data}</p>
                    </div>
                  )) : <p>No messages yet</p>}
                </div>

                <div className={styles.chatInput}>
                  <TextField
                    fullWidth
                    size="small"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                  />
                  <Button variant="contained" onClick={sendMessage}>Send</Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className={styles.controlsBar}>
            <IconButton onClick={handleVideo}>{video ? <VideocamIcon /> : <VideocamOffIcon />}</IconButton>
            <IconButton onClick={handleAudio}>{audio ? <MicIcon /> : <MicOffIcon />}</IconButton>
            {screenAvailable && <IconButton onClick={handleScreen}>{screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}</IconButton>}
            <Badge badgeContent={newMessages} color="secondary">
              <IconButton onClick={() => setModal(!showModal)}><ChatIcon /></IconButton>
            </Badge>
            <IconButton onClick={handleEndCall} className={styles.endCall}><CallEndIcon /></IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
