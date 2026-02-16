import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, TextField, Box, Typography } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore'
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`)
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0B132B, #1C2541)",
            color: "white"
        }}>

            {/* NAVBAR */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 50px",
                backdropFilter: "blur(10px)",
                background: "rgba(11,19,43,0.6)"
            }}>
                <h2 style={{ color: "#5BC0BE", letterSpacing: "1px" }}>
                    Apna Video Call
                </h2>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

    {/* History Button (icon + text together) */}
    <Button
        onClick={() => navigate("/history")}
        startIcon={<RestoreIcon />}
        sx={{
            color: "#5BC0BE",
            textTransform: "none",
            fontWeight: 600,
            '&:hover': { backgroundColor: "rgba(91,192,190,0.1)" }
        }}
    >
        History
    </Button>

    {/* Logout */}
    <Button
        onClick={() => {
            localStorage.removeItem("token")
            navigate("/auth");
        }}
        variant="contained"
        sx={{
            bgcolor: "#5BC0BE",
            color: "#0B132B",
            fontWeight: 600,
            px: 3,
            '&:hover': { bgcolor: "#6FFFE9" }
        }}
    >
        Logout
    </Button>

</div>

            </div>

            {/* MAIN SECTION */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "60px",
                gap: "40px",
                flexWrap: "wrap"
            }}>

                {/* LEFT PANEL */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <Typography variant="h3" sx={{
                        fontWeight: 700,
                        mb: 3,
                        lineHeight: 1.3
                    }}>
                        Start or Join a <span style={{ color: "#5BC0BE" }}>Meeting</span> Instantly
                    </Typography>

                    <Typography sx={{ color: "#A7B3C2", mb: 4 }}>
                        High-quality video calls, seamless collaboration, and secure communication — all in one place.
                    </Typography>

                    <Box sx={{
                        display: "flex",
                        gap: 2,
                        background: "rgba(255,255,255,0.05)",
                        p: 2,
                        borderRadius: "12px",
                        backdropFilter: "blur(8px)",
                        width: "fit-content"
                    }}>
                        <TextField
                            placeholder="Enter Meeting Code"
                            variant="outlined"
                            onChange={e => setMeetingCode(e.target.value)}
                            sx={{
                                input: { color: "white" },
                                bgcolor: "#0B132B",
                                borderRadius: 1
                            }}
                        />

                        <Button
                            onClick={handleJoinVideoCall}
                            variant="contained"
                            sx={{
                                bgcolor: "#5BC0BE",
                                color: "#0B132B",
                                fontWeight: 700,
                                px: 4,
                                '&:hover': { bgcolor: "#6FFFE9" }
                            }}
                        >
                            Join
                        </Button>
                    </Box>
                </div>

                {/* RIGHT PANEL */}
                <div style={{ flex: 1, textAlign: "center", minWidth: "300px" }}>
                    <img
                        src="/logo.png"
                        alt="Video Call"
                        style={{
                            width: "80%",
                            maxWidth: "420px",
                            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))"
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default withAuth(HomeComponent);
