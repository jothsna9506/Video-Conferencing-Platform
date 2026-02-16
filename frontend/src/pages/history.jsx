import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton, Snackbar } from '@mui/material';

export default function History() {

    const {getHistoryOfUser} = useContext(AuthContext);
    const [meetings,setMeetings] = useState([])
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const routeTo = useNavigate();

    useEffect(()=>{
        const fetchHistory = async()=>{
            try{
                const history = await getHistoryOfUser();
                setMeetings(history);
            }catch(err){
                setSnackbarMessage(err?.response?.data?.message || "Failed to fetch history");
                setSnackbarOpen(true);
            }
        }
        fetchHistory();
    },[])

    let formatDate = (dateString)=>{
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2,"0");
        const month = (date.getMonth()+1).toString().padStart(2,"0")
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
            {/* Home Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 3 }}>
                <IconButton onClick={()=>routeTo("/home")}>
                    <HomeIcon fontSize="large"/>
                </IconButton>
            </Box>

            {/* Meetings List */}
            {meetings.length !== 0 ? (
                meetings.map((e,i)=>(
                    <Card key={i} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Code: {e.meetingCode}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Date: {formatDate(e.date)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                    No meetings found.
                </Typography>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Box>
    )
}
