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
    // Chat and participants list
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [participantsList, setParticipantsList] = useState([]);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStream = useRef(null);
    const chatContainerRef = useRef(null);
    
    // Camera, microphone, and pinning
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
    const [pinnedUser, setPinnedUser] = useState(null);
    
    // View mode for responsive layout
    const [viewMode, setViewMode] = useState("auto"); // "auto", "focus", "grid"

    // Helper function to get participant name from ID
    const getParticipantName = (userId) => {
        if (userId === 'self') {
            return isScreenSharing ? 'You (Screen)' : 'You';
        }
        
        // Just return "Participant" without numbers
        return "Participant";
    };

    // Helper function to attach stream to video element
    const attachStreamToVideo = (videoElement, stream) => {
        if (videoElement && stream) {
            // Only set srcObject if it's different to avoid unnecessary reattachment
            if (videoElement.srcObject !== stream) {
                videoElement.srcObject = stream;
                videoElement.play().catch(error => {
                    console.error("Error playing video:", error);
                });
            }
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
            
            // If the pinned user disconnects, unpin
            if (pinnedUser === userId) {
                setPinnedUser(null);
            }
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
            const username = "Participant";
            console.log(`Joining meeting as ${username}`);
            socket.emit("join-meeting", { meetingId, name: username });
        } catch (error) {
            console.error("Error accessing media devices:", error);
            alert(`Failed to access camera and microphone: ${error.message}. Please check permissions.`);
        }
    };
    
    // Function to toggle camera
    const toggleCamera = () => {
        if (mediaStream.current) {
            const videoTrack = mediaStream.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };

    // Function to toggle microphone
    const toggleMicrophone = () => {
        if (mediaStream.current) {
            const audioTrack = mediaStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicrophoneOn(audioTrack.enabled);
            }
        }
    };

    // Function to pin/unpin a user - fixed to prevent black screens
    const togglePinUser = (userId) => {
        // Only set pinnedUser if the stream exists
        if (streams[userId]) {
            setPinnedUser(prevPinned => prevPinned === userId ? null : userId);
            // When pinning a user, automatically switch to focus mode
            if (viewMode !== "focus") {
                setViewMode("focus");
            }
        } else {
            console.error("Cannot pin user - stream not found:", userId);
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
                    sender: "Participant"
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

    // Function to determine grid layout based on number of participants
    const getGridTemplateClass = () => {
        const streamCount = Object.keys(streams).length;
        
        if (streamCount === 1) {
            return "grid-cols-1 grid-rows-1";
        } else if (streamCount === 2) {
            return "grid-cols-2 grid-rows-1";
        } else if (streamCount === 3 || streamCount === 4) {
            return "grid-cols-2 grid-rows-2";
        } else if (streamCount <= 6) {
            return "grid-cols-3 grid-rows-2";
        } else if (streamCount <= 9) {
            return "grid-cols-3 grid-rows-3";
        } else {
            return "grid-cols-4 grid-rows-3";
        }
    };

    // Function to render the video grid based on view mode and pinned status
    const renderVideoGrid = () => {
        // Check if we have any streams to display
        if (Object.keys(streams).length === 0) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="bg-black bg-opacity-70 px-4 py-2 rounded text-center">
                        <p>No video streams available</p>
                        <p className="text-sm text-gray-400 mt-2">Waiting for participants to join...</p>
                    </div>
                </div>
            );
        }

        // If a user is pinned and the stream exists
        if (pinnedUser && streams[pinnedUser]) {
            return (
                <div className="flex h-full flex-col md:flex-row">
                    {/* Main pinned video */}
                    <div className="flex-grow h-3/4 md:h-full">
                        <div className="relative bg-black rounded overflow-hidden h-full">
                            <video
                                ref={el => {
                                    if (el) {
                                        videoRefs.current[pinnedUser] = el;
                                        attachStreamToVideo(el, streams[pinnedUser]);
                                    }
                                }}
                                autoPlay
                                playsInline
                                muted={pinnedUser === 'self'}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
                                {getParticipantName(pinnedUser)}
                            </div>
                            
                            {/* Unpin button */}
                            <button 
                                onClick={() => setPinnedUser(null)}
                                className="absolute top-2 right-2 bg-black bg-opacity-70 p-2 rounded-full hover:bg-opacity-90"
                                title="Unpin"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Sidebar with other videos */}
                    <div className="h-1/4 md:w-1/4 md:h-full md:ml-2 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden">
                        {Object.entries(streams)
                            .filter(([userId]) => userId !== pinnedUser)
                            .map(([userId, stream]) => (
                                <div 
                                    key={userId} 
                                    className="relative bg-black rounded overflow-hidden h-full w-32 md:w-full md:h-32 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500"
                                    onClick={() => togglePinUser(userId)}
                                >
                                    <video
                                        ref={el => {
                                            if (el) {
                                                videoRefs.current[userId] = el;
                                                attachStreamToVideo(el, stream);
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        muted={userId === 'self'}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
                                        {getParticipantName(userId)}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            );
        } else if (viewMode === "focus" && Object.keys(streams).length > 0) {
            // Focus mode without pinning - use first stream as focus
            const focusedUser = Object.keys(streams)[0];
            return (
                <div className="flex h-full flex-col md:flex-row">
                    {/* Main focused video */}
                    <div className="flex-grow h-3/4 md:h-full">
                        <div className="relative bg-black rounded overflow-hidden h-full">
                            <video
                                ref={el => {
                                    if (el) {
                                        videoRefs.current[focusedUser] = el;
                                        attachStreamToVideo(el, streams[focusedUser]);
                                    }
                                }}
                                autoPlay
                                playsInline
                                muted={focusedUser === 'self'}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
                                {getParticipantName(focusedUser)}
                            </div>
                            
                            {/* Pin button */}
                            <button 
                                onClick={() => togglePinUser(focusedUser)}
                                className="absolute top-2 right-2 bg-black bg-opacity-70 p-2 rounded-full hover:bg-opacity-90"
                                title="Pin this participant"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Sidebar with other videos */}
                    <div className="h-1/4 md:w-1/4 md:h-full md:ml-2 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden">
                        {Object.entries(streams)
                            .filter(([userId]) => userId !== focusedUser)
                            .map(([userId, stream]) => (
                                <div 
                                    key={userId} 
                                    className="relative bg-black rounded overflow-hidden h-full w-32 md:w-full md:h-32 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500"
                                    onClick={() => togglePinUser(userId)}
                                >
                                    <video
                                        ref={el => {
                                            if (el) {
                                                videoRefs.current[userId] = el;
                                                attachStreamToVideo(el, stream);
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        muted={userId === 'self'}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
                                        {getParticipantName(userId)}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            );
        }
        
        // Grid view (default or explicitly selected)
        return (
            <div className={`grid gap-4 h-full ${getGridTemplateClass()}`}>
                {Object.entries(streams).map(([userId, stream]) => (
                    <div 
                        key={userId} 
                        className="relative bg-black rounded overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                    >
                        <video
                            ref={el => {
                                if (el) {
                                    videoRefs.current[userId] = el;
                                    attachStreamToVideo(el, stream);
                                }
                            }}
                            autoPlay
                            playsInline
                            muted={userId === 'self'}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
                            {getParticipantName(userId)}
                        </div>
                        
                        {/* Pin button */}
                        <button 
                            className="absolute top-2 right-2 bg-black bg-opacity-70 p-1 rounded-full hover:bg-opacity-90"
                            onClick={() => togglePinUser(userId)}
                            title="Pin this participant"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        );
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
            <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-800">
                <h1 className="text-lg font-bold mb-2 md:mb-0">Meeting ID: {meetingId}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    {/* View mode selector */}
                    <div className="flex bg-gray-700 rounded-lg p-1">
                        <button 
                            onClick={() => {
                                setViewMode("auto");
                                // Clear pinned user when switching to auto mode
                                setPinnedUser(null);
                            }}
                            className={`px-3 py-1 rounded-lg text-sm ${viewMode === "auto" ? "bg-blue-600" : "hover:bg-gray-600"}`}
                            title="Automatic layout based on participants"
                        >
                            Auto
                        </button>
                        <button 
                            onClick={() => {
                                setViewMode("focus");
                                // Keep pinned user when switching to focus mode
                            }}
                            className={`px-3 py-1 rounded-lg text-sm ${viewMode === "focus" ? "bg-blue-600" : "hover:bg-gray-600"}`}
                            title="Focus on one participant"
                        >
                            Focus
                        </button>
                        <button 
                            onClick={() => {
                                setViewMode("grid");
                                // Clear pinned user when switching to grid mode
                                setPinnedUser(null);
                            }}
                            className={`px-3 py-1 rounded-lg text-sm ${viewMode === "grid" ? "bg-blue-600" : "hover:bg-gray-600"}`}
                            title="Grid view of all participants"
                        >
                            Grid
                        </button>
                    </div>
                    {/* Display participant count without click functionality */}
        <div className="flex items-center bg-gray-700 px-3 py-1 rounded">
            <span>{participants} Participants</span>
        </div>
                    
                </div>
            </div>
            
            <div className="flex-1 p-4 overflow-hidden flex">
                {/* Main video grid */}
                <div className={`${showChat ? 'w-full md:w-2/3' : 'w-full'} h-full`}>
                    {renderVideoGrid()}
                </div>
                
                {/* Chat panel */}
                {showChat && (
                    <div className="hidden md:flex w-1/3 ml-4 bg-gray-800 rounded-lg flex-col">
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
            
            {/* Mobile chat overlay when active */}
            {showChat && (
                <div className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col">
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
            
            {/* Participants list overlay - simplified */}
            {showParticipants && (
                <div className="absolute right-0 top-16 bg-gray-800 rounded-lg shadow-lg w-64 z-10 mr-4">
                    <div className="p-3 border-b border-gray-700 font-medium flex justify-between items-center">
                        <span>Participants</span>
                        <button 
                            onClick={() => setShowParticipants(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto">
                        {/* Add yourself to the list first */}
                        <div className="p-2 hover:bg-gray-700 rounded flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                                Y
                            </div>
                            <span>You</span>
                        </div>
                        
                        {participantsList.length === 0 ? (
                            <p className="text-gray-500 text-center my-2">No other participants</p>
                        ) : (
                            participantsList.map((participant, index) => (
                                <div key={index} className="p-2 hover:bg-gray-700 rounded flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                                        P
                                    </div>
                                    <span>Participant</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            {/* Control bar */}
            <div className="flex justify-center items-center p-4 bg-gray-800 gap-4 flex-wrap">
                {/* Camera toggle button */}
                <button 
                    onClick={toggleCamera} 
                    className={`p-3 rounded-full ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
                    title={isCameraOn ? "Turn off camera" : "Turn on camera"}
                >
                    {isCameraOn ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    )}
                </button>
                
                {/* Microphone toggle button */}
                <button 
                    onClick={toggleMicrophone} 
                    className={`p-3 rounded-full ${isMicrophoneOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
                    title={isMicrophoneOn ? "Mute microphone" : "Unmute microphone"}
                >
                    {isMicrophoneOn ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    )}
                </button>
                
                {/* Screen sharing button */}
                <button 
                    onClick={toggleScreenShare} 
                    className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </button>
                
                {/* Chat toggle button */}
                <button 
                    onClick={() => setShowChat(!showChat)} 
                    className={`p-3 rounded-full ${showChat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title={showChat ? "Hide chat" : "Show chat"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
                
                {/* Participants button */}
                <button 
                    onClick={() => setShowParticipants(!showParticipants)} 
                    className={`p-3 rounded-full ${showParticipants ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title={showParticipants ? "Hide participants" : "Show participants"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </button>
                
                {/* View mode toggle - mobile only */}
                <div className="md:hidden">
                    <button 
                        onClick={() => {
                            // Cycle through view modes: auto -> focus -> grid -> auto
                            if (viewMode === "auto") setViewMode("focus");
                            else if (viewMode === "focus") setViewMode("grid");
                            else setViewMode("auto");
                        }}
                        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
                        title="Change view mode"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                </div>
                
                {/* Leave meeting button */}
                <button 
                    onClick={() => navigate("/")} 
                    className="bg-red-600 hover:bg-red-700 p-3 rounded-full"
                    title="Leave meeting"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
            
            {/* View mode indicator - shows current mode */}
            <div className="absolute bottom-20 left-4 bg-gray-800 bg-opacity-80 px-3 py-1 rounded-full text-sm">
                {viewMode === "auto" && "Auto Layout"}
                {viewMode === "focus" && "Focus View"}
                {viewMode === "grid" && "Grid View"}
            </div>
        </div>
    );
}

export default MeetingPage;

