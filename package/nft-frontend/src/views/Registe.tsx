import axios from "axios";
import { useState } from "react";
import { httpRegiste } from "../apis";
import {useStore} from "../store";
import "./Box.scss"


function Registe(props: Props) {
    let [name,setName] = useState("");
    let [pwd,setPwd] = useState("");
    const store = useStore();

    const onNameChange = (event: any) => {
        setName(event.target.value);
    }
    const onPwdChange = (event: any) => {
        setPwd(event.target.value);
    }
    const onRegiste = async() => {
        let user = await httpRegiste({name,pwd});
        store.user = user;
        props.cv('userPage',null);
    }
    return (
        <div className="Login-container">
            <div className="login-box">
                <h2>Registe</h2>
                <div className="user-box">
                    <input type="text" name="" value={name} onChange={onNameChange} required/>
                    <label>Username</label>
                </div>
                <div className="user-box">
                    <input type="password" name="" value={pwd} onChange={onPwdChange} required/>
                    <label>Password</label>
                </div>
                <a href="#" onClick={onRegiste}>
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

export default Registe