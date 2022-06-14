
import { useState } from "react"
import "./ImageUpload.scss"

type UploaderProps = {
    width?: number,
    height?: number,
    onUploaded?: () => void,
    form: any
} 

export default function ImageUpload(props: UploaderProps) {
    const [url,setUrl] = useState("");
    const width:number = props.width || 200;
    const height:number = props.width || 200;
    const form = props.form;
    const onUpload = (e: any) => {
        const file = e.target.files[0];
        if(!file.type.match("image")){
            return;
        }
        setUrl(window.URL.createObjectURL(file));
        form.file = file;
    }   
    return (
        <div className="ImageUpload-container"> 
            {
                !url? 
                <div className="uploader" style={{
                    width,
                    height,
                }}></div>
                : <img src={url} alt="error" style={{
                    width,
                    height,
                }}/>
            }
            <div className="progress"></div>
            <input type="file" style={{
                width,
                height,
            }} onChange={onUpload}/>
        </div>
    )
}
