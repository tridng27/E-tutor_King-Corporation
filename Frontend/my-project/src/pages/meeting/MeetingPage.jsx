import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const socket = io("http://localhost:5000");

function MeetingPage() {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const [streams, setStreams] = useState({});
    const [participants, setParticipants] = useState(1);
    const [meetingInput, setMeetingInput] = useState("");
    const [isJoining, setIsJoining] = useState(true);
    const mediaStream = useRef(null);
    const peerConnections = useRef({});
    const videoRefs = useRef({});
    // New state variables for chat and participants list
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [participantsList, setParticipantsList] = useState([]);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStream = useRef(null);
    const chatContainerRef = useRef(null);

    // Helper function to attach stream to video element
    const attachStreamToVideo = (videoElement, stream) => {
        if (videoElement && stream && videoElement.srcObject !== stream) {
            videoElement.srcObject = stream;
            videoElement.play().catch(error => {
                console.error("Error playing video:", error);
            });
        }
    };

    // Log stream changes for debugging
    useEffect(() => {
        console.log("Streams updated:", Object.keys(streams));
        Object.entries(streams).forEach(([userId, stream]) => {
            console.log(`Stream for ${userId}:`, {
                active: stream.active,
                id: stream.id,
                tracks: stream.getTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    muted: t.muted
                }))
            });
        });
    }, [streams]);

    // Auto-scroll chat to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!meetingId || isJoining) return;

        socket.on("update-participants", ({ count, participants }) => {
            console.log("Participants updated:", count);
            setParticipants(count);
            setParticipantsList(participants || []);
        });

        socket.on("user-connected", async ({ userId }) => {
            console.log("New user connected:", userId);
            try {
                const peerConnection = createPeerConnection(userId);
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                socket.emit("offer", { meetingId, offer, to: userId });
            } catch (error) {
                console.error("Error creating offer:", error);
            }
        });

        socket.on("receive-offer", async ({ from, offer }) => {
            console.log("Received offer from:", from);
            try {
                const peerConnection = createPeerConnection(from);
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.emit("answer", { meetingId, answer, to: from });
            } catch (error) {
                console.error("Error handling offer:", error);
            }
        });

        socket.on("receive-answer", async ({ from, answer }) => {
            console.log("Received answer from:", from);
            try {
                if (peerConnections.current[from]) {
                    await peerConnections.current[from].setRemoteDescription(new RTCSessionDescription(answer));
                }
            } catch (error) {
                console.error("Error handling answer:", error);
            }
        });

        socket.on("receive-ice-candidate", async ({ from, candidate }) => {
            console.log("Received ICE candidate from:", from);
            try {
                if (peerConnections.current[from]) {
                    await peerConnections.current[from].addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        });

        socket.on("user-disconnected", ({ userId }) => {
            console.log("User disconnected:", userId);
            if (peerConnections.current[userId]) {
                peerConnections.current[userId].close();
                delete peerConnections.current[userId];
            }
            setStreams(prev => {
                const newStreams = {...prev};
                delete newStreams[userId];
                return newStreams;
            });
        });

        // Chat message listener
        socket.on("receive-message", (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        return () => {
            socket.emit("leave-meeting", meetingId);
            if (mediaStream.current) {
                mediaStream.current.getTracks().forEach(track => track.stop());
            }
            
            // Stop screen sharing if active
            if (screenStream.current) {
                screenStream.current.getTracks().forEach(track => track.stop());
            }
            
            // Clean up all peer connections
            Object.values(peerConnections.current).forEach(pc => pc.close());
            peerConnections.current = {};
            
            // Remove all socket listeners
            socket.off("update-participants");
            socket.off("user-connected");
            socket.off("receive-offer");
            socket.off("receive-answer");
            socket.off("receive-ice-candidate");
            socket.off("user-disconnected");
            socket.off("receive-message");
        };
    }, [meetingId, isJoining]);

    const createPeerConnection = (userId) => {
        console.log("Creating peer connection for:", userId);
        
        // Check if connection already exists
        if (peerConnections.current[userId]) {
            console.log("Connection already exists for", userId);
            return peerConnections.current[userId];
        }
        
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" },
                { urls: "stun:stun3.l.google.com:19302" },
                { urls: "stun:stun4.l.google.com:19302" },
                // Add TURN servers for better connectivity through firewalls
                {
                    urls: "turn:openrelay.metered.ca:80",
                    username: "openrelayproject",
                    credential: "openrelayproject"
                },
                {
                    urls: "turn:openrelay.metered.ca:443",
                    username: "openrelayproject",
                    credential: "openrelayproject"
                }
            ],
            iceCandidatePoolSize: 10
        });

        // Add all tracks from our media stream to the peer connection
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => {
                console.log("Adding track to peer connection:", track.kind);
                peerConnection.addTrack(track, mediaStream.current);
            });
        } else {
            console.error("No local media stream available when creating peer connection");
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Generated ICE candidate for", userId);
                socket.emit("ice-candidate", {
                    meetingId,
                    candidate: event.candidate,
                    to: userId
                });
            }
        };

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
            console.log("Received tracks from:", userId, event.streams.length);
            if (event.streams && event.streams[0]) {
                console.log("Setting remote stream for", userId);
                setStreams(prev => ({
                    ...prev,
                    [userId]: event.streams[0]
                }));
            }
        };

        // Log connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state for ${userId}:`, peerConnection.connectionState);
            if (peerConnection.connectionState === 'failed' || 
                peerConnection.connectionState === 'disconnected' ||
                peerConnection.connectionState === 'closed') {
                console.log("Cleaning up failed connection for", userId);
                if (peerConnections.current[userId]) {
                    delete peerConnections.current[userId];
                }
            }
        };

        peerConnection.onicegatheringstatechange = () => {
            console.log(`ICE gathering state for ${userId}:`, peerConnection.iceGatheringState);
        };

        peerConnection.onsignalingstatechange = () => {
            console.log(`Signaling state for ${userId}:`, peerConnection.signalingState);
        };

        peerConnections.current[userId] = peerConnection;
        return peerConnection;
    };

    const createMeeting = () => {
        const newMeetingId = uuidv4();
        navigate(`/meeting/${newMeetingId}`);
    };

    const joinMeeting = () => {
        if (meetingInput.trim()) {
            navigate(`/meeting/${meetingInput}`);
        }
    };

    const startCall = async () => {
        try {
            console.log("Starting call and accessing media devices...");
            
            // Request both audio and video with constraints
            mediaStream.current = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                }, 
                audio: true 
            });
            
            console.log("Media stream obtained:", 
                mediaStream.current.getTracks().map(t => t.kind).join(", "));
            
            // Add your own stream to the streams state
            setStreams(prev => ({ 
                ...prev, 
                self: mediaStream.current 
            }));
            
            setIsJoining(false);
            
            // Join the meeting after getting media stream
            const username = `User-${Math.floor(Math.random() * 1000)}`;
            console.log(`Joining meeting as ${username}`);
            socket.emit("join-meeting", { meetingId, username });  // CHANGE THIS LINE
        } catch (error) {
            console.error("Error accessing media devices:", error);
            alert(`Failed to access camera and microphone: ${error.message}. Please check permissions.`);
        }
    };
    

    // Function to send chat message
    const sendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                sender: 'You',
                text: newMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            // Add to local messages
            setMessages(prevMessages => [...prevMessages, message]);
            
            // Send to other participants
            socket.emit("send-message", { 
                roomId: meetingId, 
                message: {
                    ...message,
                    sender: `User-${socket.id ? socket.id.substring(0, 5) : Math.random().toString(36).substring(2, 7)}`

                }
            });
            
            setNewMessage("");
        }
    };
    

    // Function to toggle screen sharing
    const toggleScreenShare = async () => {
        try {
            if (isScreenSharing) {
                // Stop screen sharing
                if (screenStream.current) {
                    screenStream.current.getTracks().forEach(track => track.stop());
                    screenStream.current = null;
                }
                
                // Restore camera stream
                setStreams(prev => {
                    const newStreams = {...prev};
                    newStreams.self = mediaStream.current;
                    return newStreams;
                });
                
                // Update all peer connections to use camera stream
                Object.values(peerConnections.current).forEach(pc => {
                    const senders = pc.getSenders();
                    const videoSender = senders.find(sender => 
                        sender.track && sender.track.kind === 'video'
                    );
                    
                    if (videoSender && mediaStream.current) {
                        const videoTrack = mediaStream.current.getVideoTracks()[0];
                        if (videoTrack) {
                            videoSender.replaceTrack(videoTrack);
                        }
                    }
                });
                
                setIsScreenSharing(false);
            } else {
                // Start screen sharing
                screenStream.current = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: "always"
                    },
                    audio: false
                });
                
                // Replace video track in all peer connections
                Object.values(peerConnections.current).forEach(pc => {
                    const senders = pc.getSenders();
                    const videoSender = senders.find(sender => 
                        sender.track && sender.track.kind === 'video'
                    );
                    
                    if (videoSender && screenStream.current) {
                        const videoTrack = screenStream.current.getVideoTracks()[0];
                        if (videoTrack) {
                            videoSender.replaceTrack(videoTrack);
                        }
                    }
                });
                
                // Update local display
                setStreams(prev => {
                    const newStreams = {...prev};
                    newStreams.self = screenStream.current;
                    return newStreams;
                });
                
                // Handle when user stops sharing via browser UI
                screenStream.current.getVideoTracks()[0].onended = () => {
                    toggleScreenShare();
                };
                
                setIsScreenSharing(true);
            }
        } catch (error) {
            console.error("Error toggling screen share:", error);
            alert(`Failed to ${isScreenSharing ? 'stop' : 'start'} screen sharing: ${error.message}`);
        }
    };

    if (isJoining) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white text-black">
                <h1 className="text-2xl font-bold mb-4">Join or Create a Meeting</h1>
                <div className="mb-4">
                    <input type="text" placeholder="Enter Meeting ID" value={meetingInput} onChange={(e) => setMeetingInput(e.target.value)} className="p-2 border rounded bg-gray-700 text-white" />
                    <button onClick={joinMeeting} className="ml-2 bg-blue-500 px-4 py-2 rounded">Join</button>
                </div>
                <button onClick={createMeeting} className="mb-4 bg-green-500 px-6 py-2 rounded-lg">Create New Meeting</button>
                {meetingId && (
                    <>
                        <p className="mb-2">Meeting ID: {meetingId}</p>
                        <button onClick={startCall} className="bg-green-500 px-6 py-2 rounded-lg">Join Now</button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white">
            <div className="flex justify-between items-center p-4 bg-gray-800">
                <h1 className="text-lg font-bold">Meeting ID: {meetingId}</h1>
                <button 
                    onClick={() => setShowParticipants(!showParticipants)} 
                    className="flex items-center bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                >
                    <span>{participants} Participants</span>
                </button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto flex">
                {/* Main video grid */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${showChat ? 'w-2/3' : 'w-full'}`}>
                    {Object.keys(streams).length === 0 ? (
                        <div className="col-span-full flex items-center justify-center h-64">
                            <p className="text-xl">Waiting for participants to join...</p>
                        </div>
                    ) : (
                        Object.entries(streams).map(([userId, stream]) => (
                            <div key={userId} className="relative bg-black rounded overflow-hidden h-64">
                                <video
                                    ref={el => el && attachStreamToVideo(el, stream)}
                                    autoPlay
                                    playsInline
                                    muted={userId === 'self'}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
                                    {userId === 'self' ? (isScreenSharing ? 'You (Screen)' : 'You') : `Participant ${userId.substring(0, 5)}`}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Chat panel */}
                {showChat && (
                    <div className="w-1/3 ml-4 bg-gray-800 rounded-lg flex flex-col">
                        <div className="p-3 border-b border-gray-700 font-medium flex justify-between items-center">
                            <span>Meeting Chat</span>
                            <button 
                                onClick={() => setShowChat(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div 
                            ref={chatContainerRef}
                            className="flex-1 p-3 overflow-y-auto"
                        >
                            {messages.length === 0 ? (
                                <p className="text-gray-500 text-center my-4">No messages yet</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className={`mb-3 ${msg.sender === 'You' ? 'text-right' : ''}`}>
                                        <div className={`inline-block rounded-lg px-3 py-2 max-w-xs ${
                                            msg.sender === 'You' ? 'bg-blue-600' : 'bg-gray-700'
                                        }`}>
                                            <p className="text-sm font-medium">{msg.sender}</p>
                                            <p>{msg.text}</p>
                                            <p className="text-xs text-gray-300 mt-1">{msg.time}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-3 border-t border-gray-700 flex">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-700 rounded-l-lg px-3 py-2 outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-600 rounded-r-lg px-4 hover:bg-blue-700"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Participants list overlay */}
            {showParticipants && (
                <div className="absolute right-0 top-16 bg-gray-800 rounded-lg shadow-lg w-64 z-10 mr-4">
                    <div className="p-3 border-b border-gray-700 font-medium flex justify-between items-center">
                        <span>Participants ({participantsList.length})</span>
                        <button 
                            onClick={() => setShowParticipants(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto">
                        {participantsList.length === 0 ? (
                            <p className="text-gray-500 text-center my-2">No participants</p>
                        ) : (
                            participantsList.map((participant, index) => (
                                <div key={index} className="p-2 hover:bg-gray-700 rounded flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                                        {participant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{participant.name}</span>
                                    {participant.isYou && <span className="ml-2 text-xs text-gray-400">(You)</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            <div className="flex justify-center p-4 bg-gray-800 gap-4">
                <button 
                    onClick={() => setShowChat(!showChat)} 
                    className={`px-4 py-2 rounded-lg ${showChat ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    {showChat ? 'Hide Chat' : 'Show Chat'}
                </button>
                <button 
                    onClick={toggleScreenShare} 
                    className={`px-4 py-2 rounded-lg ${isScreenSharing ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                </button>
                <button onClick={() => navigate("/")} className="bg-red-500 px-6 py-2 rounded-lg">
                    Leave Meeting
                </button>
            </div>
        </div>
    );
}

export default MeetingPage;

