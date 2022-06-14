import axios from "axios";
import { useState } from "react";
import { httpRegiste } from "../apis";
import useStore from "../store";
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
                    <button onClick={onRegiste}>Registe</button>
                </div>
            </div>
        </div>
    )
}

export default Registe