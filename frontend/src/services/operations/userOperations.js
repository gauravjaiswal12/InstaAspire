import axios from "axios";
import {toast} from "sonner";
import {setSuggestedUsers} from "@/redux/authSlice.js";
import {useDispatch} from "react-redux";


export const followOrUnfollow =async (id) => {
    const dispatch=useDispatch();
    try{

        const response=await axios.post(`http://localhost:8000/api/v1/user/${id}/followOrUnfollow`,{},{
            withCredentials:true
        });
        try {
            const res = await axios.get('http://localhost:8000/api/v1/user/suggested', { withCredentials: true });
            if (res.data.success) {
                dispatch(setSuggestedUsers(res.data.users));
            }
        } catch (err) {
            console.log("Error fetching suggested users:", err);
        }
        console.log(response);
        toast.success(response.data.message);
    }catch (e) {
        toast.error(e.response.data.message);
        console.log(e);
    }
};
// major problem is when follow and unfollow we need to update the redux store mainly the user we are working with
