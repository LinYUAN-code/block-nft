import axios from "axios";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { httpUploadCraft } from "../apis";
import ImageUpload from "../components/ImageUpload";
import useStore from "../store";
import user from "../store";
import "./UserPage.scss"


function UserPage() {
    let store = useStore();
    let [name,setName] = useState("");
    const onNameChange = (event: any) => {
        setName(event.target.value);
    }
    let [amount,setAmount] = useState("");
    const onAmountChange = (event: any) => {
        setAmount(event.target.value);
    }
    const onTransfer = () => {
        axios.post("/transfer",{
            fName: user.name,
            tName: name,
            amount,
        }).then((res)=>{
            console.log(res);
            // user.assets 
            store.user.assets -= parseInt(amount);
        })
    }
    
    const [formName,setFormName] = useState("");
    const form:any = useRef(null);
    const onUploaded = () => {
        console.log(form);
    }
    const onChangeFromName = (e:any) => {
        setFormName(e.target.value);
    }
    const onSubmit = async () => {
        console.log(form,formName)
        if(!form.file || !formName) {
            toast.error('👻please fullfill the form!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        let formData = new FormData();
        formData.append("file",form.file);
        formData.append("name",formName);
        formData.append("owner",store.user.name);
        await httpUploadCraft(formData);
        toast.success('🧙🏻‍♂️upload success!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }
    return (
        <div className="UserPage-container">
            <div>
                <h3>User Info</h3>
                <div>
                    name: {store.user.name}
                </div>
                <div>
                    assets: {store.user.assets}
                </div>
            </div>                    
            
            <div>
                <h3>Transfer</h3>
                <div className="row">
                    <label htmlFor="toName">toName: </label><input id="toName" type="text" value={name} onChange={onNameChange} />
                </div>
                <div className="row">
                    <label htmlFor="amount">amount: </label><input id="amount" type="text" value={amount} onChange={onAmountChange} />
                </div>
                <button onClick={onTransfer}>transfer</button>
            </div>
            
            <div className="upload-container">
                <h3>Submit Craft</h3>
                <div className="row">
                    <label htmlFor="name">name:</label><input id="name" type="text" value={formName} onChange={onChangeFromName}/>
                </div>
                <div className="upload">
                    <ImageUpload form={form}></ImageUpload>
                </div>
                <button onClick={onSubmit}>onSubmit</button>
            </div>
        </div>
    )
}

export default UserPage