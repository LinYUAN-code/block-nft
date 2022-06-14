import { useEffect, useState } from "react"
import { httpGetCraftList } from "../apis"
import CraftCard from "./CraftCard"
import "./ShowCraft.scss"

export default function ShowCraft() {
    const [list,setList] = useState<Array<Craft>>([]);
    const [activeList,setActiveList] = useState<Array<Craft>>([]);
    const [backList,setBackList] = useState<Array<Craft>>([]);
    const [con,setCon] = useState<Array<boolean>>([]);
    useEffect(()=>{
        (async ()=>{
            let res = await httpGetCraftList();
            res = res.slice(0,Math.min(3*4*3,res.length));
            setList(res);
            setActiveList(res.slice(0,Math.min(res.length,4*3)));
            setBackList(res.slice(0,Math.min(res.length,4*3)));

            let n = res.length;
            let cc = [];
            for(let i=0;i<Math.ceil(n/12);i++) {
                cc[i] = false;
            }
            cc[0] = true;
            setCon(cc);
        })();
    },[]);

    const [backX,setBackX] = useState(0);
    const [nowX,setNowX] = useState(0);
    const [transition,setTransition] = useState("");
    const [overflow,setOverflow] = useState("");
    const setPage = (index:number,setF: any) => {
        console.log(index);
        setF(list.slice(index*12,Math.min(list.length,index*12+12)));
    }
    const goBack = (index:number,delay:number) => {
        return new Promise(r=>{
            setPage(index-1,setBackList);
            setBackX(-400);
            setOverflow("hidden");
            setTimeout(()=>{
                setTransition(`transform ${delay/1000}s ease`);
                setNowX(400);
                setBackX(0);
                setTimeout(()=>{
                    setTransition("");
                    setOverflow("");
                    setBackX(0);
                    setNowX(0);
                    setPage(index-1,setActiveList);
                    setBackList([]);
                    r(1);
                },delay);
            },0);
        })
    }
    const goAhead = (index:number,delay:number) => {
        return new Promise(r=>{
            const ne = (index+1)%3;
            setPage(ne,setBackList);
            setBackX(400);
            setOverflow("hidden");
            setTimeout(()=>{
                setTransition(`transform ${delay/1000}s ease`);
                setNowX(-400);
                setBackX(0);
                setTimeout(()=>{
                    setTransition("");
                    setOverflow("");
                    setBackX(0);
                    setNowX(0);
                    setPage(ne,setActiveList);
                    setBackList([]);
                    r(1);
                },delay);
            },50);
        })
    }
    
    const totDelay = 500;
    const onChangeActive = async (position:number) => {
        let now:number = 0;
        for(let i=0;i<con.length;i++) {
            if(con[i]) {
                now = i;
                break;
            }
        }
        if(position === con.length) {
            con[now] = false;
            con[0] = true;
            setCon(con.slice(0));
            goAhead(now,totDelay);
        } else if(now < position) {
            const delay = Math.floor(totDelay/(position-now));
            while(now<position) {
                con[now] = false;
                now = now + 1;
                con[now] = true;
                setCon(con.slice(0));
                await goAhead(now-1,delay);
            }
        } else if(now>position) {
            const delay = Math.floor(totDelay/(now-position));
            while(now>position) {
                con[now] = false;
                now = now - 1;
                con[now] = true;
                setCon(con.slice(0));
                await goBack(now+1,delay);
            }
        }
    }
    useEffect(()=>{
        if(!list.length)return ;
        let timer = setInterval(()=>{
            let now = 0;
            for(let i=0;i<con.length;i++) {
                if(con[i]) {
                    now = i;
                    break;
                }
            }
            onChangeActive(now+1);
        },3000);
        return () => {
            clearInterval(timer);
        }
    },[list,con]);
    return (
        <div className="ShowCraft-container"
            style={{
                overflow: `${overflow}`
            }}
        >
            <div className="back-content content"
                style={{
                    transform: `translate(${backX}px,0)`,
                    transition: `${transition}`,
                }}
            >
                {
                    backList.map((v)=>{
                        return (
                            <CraftCard key={v.id} url={v.url} id={v.id}></CraftCard>
                        )
                    })
                }
            </div>
            <div className="content"
                style={{
                    transform: `translate(${nowX}px,0)`,
                    transition: `${transition}`,
                }}
            >
                {
                    activeList.map((v)=>{
                        return (
                            <CraftCard key={v.id} url={v.url} id={v.id} ></CraftCard>
                        )
                    })
                }
            </div>
            <div className="Control">
                {
                    con.map((v,index)=>{
                        return (
                            v 
                            ?<div key={index} className="active control-bar"></div>
                            :<div key={index} className="control-bar" onClick={(e)=>{onChangeActive(index)}}></div>
                        )
                    })                 
                }
            </div>
        </div>
    )
}
