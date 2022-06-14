import { useState } from "react";
import useStore from "../store";
import { httpLogin } from "../apis";
import "./Box.scss"


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
        store.user = user;
        console.log(user);
        props.cv('userPage');
    }
    return ( 
        <div className="Login-container">
            <div className="sm-container">
                <div className="row">
                    <label htmlFor="name">name: </label><input id="name" type="text" value={name} onChange={onNameChange}/>
                </div>
                <div className="row">
                    <label htmlFor="pwd">pasw: </label><input id="pwd" type="text" value={pwd} onChange={onPwdChange}/>
                </div>
                <div className="row">
                    <button onClick={onLogin}>Login</button>
                </div>
            </div>
        </div>
    )
}

export default Login