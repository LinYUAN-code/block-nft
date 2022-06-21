import { useState } from "react";
import {useStore} from "../store";
import { httpLogin } from "../apis";
import "./Box.scss"
import { toast } from "react-toastify";


function Login(props: Props) {
    let [name,setName] = useState("");
    let [pwd,setPwd] = useState("");
    const store = useStore();

    const onNameChange = (event: React.FormEvent<HTMLInputElement>) => {
        setName(event.currentTarget.value);
    }
    const onPwdChange = (event: any) => {
        setPwd(event.target.value);
    }

    const onLogin = async () => {
        let user = await httpLogin({name,pwd});
        if(!user.name) {
            toast.error('👻username or pwd error!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setName("");
            setPwd("");
            return ;
        }
        store.user = user;
        console.log(user);
        props.cv('userPage',null);
    }
    return ( 
        <div className="Login-container">
            <div className="login-box">
                <h2>Login</h2>
                <div className="user-box">
                    <input type="text" name="" value={name} onChange={onNameChange} required/>
                    <label>Username</label>
                </div>
                <div className="user-box">
                    <input type="password" name="" value={pwd} onChange={onPwdChange} required/>
                    <label>Password</label>
                </div>
                <a href="#" onClick={onLogin}>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    Submit
                </a>
            </div>
        </div>
    )
}

export default Login