import React, {useEffect, useState} from 'react';
import {Label} from "@/components/ui/label.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Button} from "@/components/ui/button.jsx";
import axios from "axios";
import {toast} from "sonner";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {Loader2} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {setAuthUser} from "@/redux/authSlice.js";

const Login = () => {
    const dispatch=useDispatch();
    const [input,setInput]=useState({
        email:'',
        password:''
    });
    const [loading,setloading]=useState(false);
    const {user}=useSelector((state)=>state.auth);

    const navigate=useNavigate();
    const changeEventHandler=(event)=>{
        const {name,type,value,checked}=event.target;
        setInput(prevState => {
            return {
                ...prevState,
                [name]:type==="checkbox"?checked:value
            }
        })
    }
    const SignupHandler=async (event)=>{
        event.preventDefault();
        try{
            setloading(true);
            const res=await axios.post('http://localhost:8000/api/v1/user/login',input,{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                dispatch(setAuthUser(res.data.user));
                toast.success(res.data.message);

                navigate('/');
                setInput({
                    email:'',
                    password:''
                });
            }
        }catch (e) {
            console.log(e);
            toast.error(e.response.data.message);
        }finally {
            setloading(false);
        }
    }
    useEffect(() => {
        if(user){
            navigate('/');
        }
    }, []);
    return (
       <div className="flex items-center w-screen h-screen justify-center">
           <form onSubmit={SignupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
               <div className='my-4'>
                   <h1 className='text-center font-bold text-xl'>LOGO</h1>
                   <p className='text-sm text-center'>Login to see photos & videos from your friends</p>
               </div>
               <div>
                  <Label className='py-1 font-medium'>Email</Label>
                   <Input type='email' name="email" value={input.email} onChange={changeEventHandler} className='focus-visible:ring-transparent my-2' />
                   <Label className='py-1 font-medium'>Password</Label>
                   <Input type='password' name='password' value={input.password} onChange={changeEventHandler} className='focus-visible:ring-transparent my-2' />
               </div>
               {
                   loading ? (<Button>
                        <Loader2 className='animate-spin mr-2 h-4 w-4'/>
                       Processing
                   </Button>):(
                      <Button className='w-full' type='submit'>Login</Button>
                   )
               }

               <span className='text-center'>New ? Register here <NavLink className='text-blue-300' to="/signup">Signup</NavLink></span>

           </form>
       </div>
    );
};

export default Login;