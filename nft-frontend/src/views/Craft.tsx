import moment from "moment";
import { useEffect, useState } from "react"
import { httpQueryCraftById, httpQueryCraftHistoryById, httpUPdateLikesById } from "../apis"
import useStore from "../store";

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
        (async ()=>{
            let res = await httpQueryCraftHistoryById({id:store.routerParam.id})
            res.sort((a,b)=>{ //时间从大到小排序
                return b.time - a.time;
            });
            setHistoryList(res);
            console.log(res);
        })();
    },[store.routerParam.id]);
    return (
        <div className='Craft-container'>
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
