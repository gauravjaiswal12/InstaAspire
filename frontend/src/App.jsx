import Signup from "@/components/Signup.jsx";
import {Routes,Route} from "react-router-dom";
import Login from "@/components/Login.jsx";
import MainLayout from "@/components/MainLayout.jsx";
import Home from "@/components/Home.jsx";
import Profile from "@/components/Profile.jsx";
import EditProfile from "@/components/EditProfile.jsx";
import ChatPage from "@/components/ChatPage.jsx";
import {io} from "socket.io-client";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {setSocket} from "@/redux/socketSlide.js";
import {setMessagesNotification, setOnlineUsers} from "@/redux/chatSlice.js";
import {setLikeNotification} from "@/redux/rtnSlice.js";
import ProtectedRoutes from "@/components/ProtectedRoutes.jsx";
import ReelsFeed from "@/components/ReelsFeed.jsx";
import SearchUser from "@/components/SearchUser.jsx";

function App() {
    const {user}=useSelector((state)=>state.auth);
    const {socket}=useSelector((state)=>state.socketio);
    const dispatch=useDispatch();

  useEffect(()=>{
    if(user){
        const socketio=io("http://localhost:8000",{
            query:{
                userId:user?._id
            },
            transports:['websocket']
        });
        dispatch(setSocket(socketio));
        //listening all the events
        socketio.on('getOnlineUsers',(onlineUsers)=>{
            dispatch(setOnlineUsers(onlineUsers));
        });
        socketio.on('Notification',(notification)=>{
            dispatch(setLikeNotification(notification));
        });
        socketio.on('newMessage',(newMessage)=>{
            console.log("new message in the app",newMessage);
            dispatch(setMessagesNotification(newMessage));
        })

        return ()=>{
            socketio.close();
            dispatch(setSocket(null));
        }
    }else if(socket){
        socket?.close();
        dispatch(setSocket(null));
    }
  },[user,dispatch])
  return (
    <>
        <Routes>
            <Route path="/" element={<ProtectedRoutes><MainLayout /></ProtectedRoutes>}>
                <Route path='/' element={<ProtectedRoutes><Home/></ProtectedRoutes>} />
                <Route path="/profile/:id" element={<ProtectedRoutes><Profile/></ProtectedRoutes>}/>
                <Route path="/account/edit" element={<ProtectedRoutes><EditProfile /></ProtectedRoutes>}/>
                <Route path="/viewReels" element={<ProtectedRoutes><ReelsFeed/></ProtectedRoutes>}/>
                <Route path="/chat" element={<ProtectedRoutes><ChatPage /></ProtectedRoutes>}/>
                <Route path="/Search" element={<ProtectedRoutes><SearchUser/></ProtectedRoutes>}/>
            </Route>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/login" element={<Login/>}/>
        </Routes>
    </>
  )
}

export default App
