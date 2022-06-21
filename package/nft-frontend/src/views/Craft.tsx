import moment from "moment";
import { useEffect, useState } from "react"
import { toast } from "react-toastify";
import { httpMakeAnOffer, httpQueryCraftById, httpQueryCraftHistoryById, httpUPdateLikesById } from "../apis"
import {useStore} from "../store";
import { accToast, errToast, shallowClone } from "../util";

import "./Craft.scss"

export default function Craft() {
    const [craft,setCraft] = useState<Craft>();
    const store = useStore();
    console.log(store.routerParam.id);
    const updateCraft = async () => {
        let res = await httpQueryCraftById({id:store.routerParam.id})
        setCraft(res);
    }
    useEffect(()=>{
        updateCraft();
    },[store.routerParam.id])

    const onLikeClick = async () => {
        await httpUPdateLikesById({
            id: craft!.id,
            likes: craft!.likes + 1,
            dislikes: craft!.dislikes
        });

        await updateCraft();

        // animation
        
    }
    const onDislikeClick = async () => {
        await httpUPdateLikesById({
            id: craft!.id,
            likes: craft!.likes,
            dislikes: craft!.dislikes + 1
        });

        await updateCraft();

        // animation
    }



    const [historyList,setHistoryList] = useState<Array<CraftHistory>>([]);
    useEffect(()=>{
        if(!craft)return ;
        (async ()=>{
            let res = await httpQueryCraftHistoryById({craftId: craft.id})
            res.sort((a,b)=>{ //时间从大到小排序
                return b.time - a.time;
            });
            setHistoryList(res);
            console.log(res);
        })();
    },[craft]);


    const [showModal,setShowModal] = useState(false);
    const [price,setPrice] = useState("");
    const [intro,setIntro] = useState("");
    const onBuy = () => {
        if(!store.user.name) {
            errToast("You must login!");
            return ;
        }
        setShowModal(true);
    }
    const onClose = () => {
        setShowModal(false);
    }
    const onOffer = async () => {
        let pri = parseInt(price);
        if(!pri || pri > store.user.assets) {
            errToast("You are poor");
            setPrice("");
            return ;
        }
        await httpMakeAnOffer({
            craftId: craft!.id,
            fromName: store.user.name,
            toName: craft!.owner,
            price: pri,
            intro,
            craft_id: craft!.craft_id,
        });
        let user = shallowClone(store.user);
        user.assets -= pri;
        store.user = user;
        accToast("success");
        setShowModal(false);
        setPrice("");
        setIntro("");
    }
    return (
        <div className='Craft-container'>
            {
                showModal ? 
                <div className="modal-container" >
                    <div className="modal">
                        <div className="contro">
                            <div onClick={onClose}>×</div>
                        </div>
                        <div className="editor">
                            <div className="ed"><span>price:</span><input type="text" value={price} onChange={(e)=>{setPrice(e.target.value)}}></input></div>
                            <div className="ed"><span>intro:</span><textarea value={intro} onChange={(e)=>{setIntro(e.target.value)}}></textarea></div>
                            <div className="row">
                                <button onClick={onOffer}>offer</button>
                            </div>
                        </div>
                    </div>
                </div>
                : null
            }
            <div className="img-container">
                <img src={craft?.url} alt="network error" />
            </div>
            <div className="des-container">
                <div>name: {craft?.name}</div>
                <div>id: {craft?.id}</div>
                <div>owner: {craft?.owner}</div>
                <div className="like-container">   
                    <span className="like" onClick={onLikeClick}>💖{craft?.likes} &nbsp;&nbsp;&nbsp;</span>
                    <span className="like dislike" onClick={onDislikeClick}>🖤{craft?.dislikes}</span>
                    {
                        craft?.owner !== store.user.name ?
                        <button onClick={onBuy}>Buy</button>
                        :null
                    }
                </div>
                <div className="history-container">
                    <h4 className="h">Ownership History</h4>
                    {
                        historyList.map((v,index)=>{
                            return (
                                <div key={index} className="history-row">
                                    <div>{moment(v.time).format("YYYY-MM-DD HH:mm")}</div>
                                    <div>----{v.owner}</div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

        </div>
    )
}
