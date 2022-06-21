import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { httpAccOffer, httpQueryCraftByOwner, httpQueryTransactionByToName, httpRejectOffer, httpTransfer, httpUploadCraft } from "../apis";
import ImageUpload from "../components/ImageUpload";
import OfferCard from "../components/OfferCard";
import ShowCraft from "../components/ShowCraft";
import {useStore} from "../store";
import { accToast, errToast, shallowClone } from "../util";
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
    const onTransfer = async () => {
        if(parseInt(amount) > store.user.assets) {
            errToast("money not enough");
            setAmount("");
            return ;
        }
        let res = await httpTransfer({
            fName: store.user.name,
            tName: name,
            amount: parseInt(amount)
        });
        if(res === "转账成功") {
            // user.assets 
            let user = shallowClone(store.user);
            user.assets -= parseInt(amount);
            store.user = user;
            accToast("transfer success");
        }
        setName("");
        setAmount("");
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
            errToast("please fullfill the form");
        }
        let formData = new FormData();
        formData.append("file",form.file);
        formData.append("name",formName);
        formData.append("owner",store.user.name);
        await httpUploadCraft(formData);
        accToast("upload success")
    }

    const [myCrafts,setMyCrafts] = useState<Array<Craft>>([]);
    useEffect(()=>{
        (async ()=>{
            let res = await httpQueryCraftByOwner({owner:store.user.name})
            console.log(res);
            setMyCrafts(res);
        })();
    },[store.user]);


    const [notiNum,setNotiNum] = useState(99);
    const [showModal,setShowModal] = useState(false);
    const [offerList,setOfferList] = useState<Array<Transaction>>([]);
    const getOfferList = async ()=>{
        let res = await httpQueryTransactionByToName({toName:store.user.name});
        setNotiNum(res.length);
        setOfferList(res);
    }
    useEffect(()=>{
        getOfferList();
    });
    const clickNoti = () => {
        setShowModal(!showModal);
    }
    const onAcc = async (offer: Transaction) => {
        await httpAccOffer(offer);
        await getOfferList(); 
        // -不做错误处理了...
        accToast("accept the offer!");
    }

    const onReject = async (offer: Transaction) => {
        await httpRejectOffer(offer);
        await getOfferList(); 
        accToast("reject the offer");
    }   

    // 定时更新用户信息
    // 需要使用tocken重新获取用户信息
    // todo：接口设置tocken
    useEffect(()=>{
        // let timer = setInterval(()=>{
            

        // },2000);
        // return ()=>{
        //     clearInterval(timer);
        // }
    },[]);

    return (
        <div className="UserPage-container">
            <div className="head-container">
                <div>
                    <h3>User Info</h3>
                    <div>
                        name: {store.user.name}
                    </div>
                    <div>
                        assets: {store.user.assets}
                    </div>
                    <div>
                        address: {store.user.address}
                    </div>
                </div>  
                <div className="notification-container" >
                    <div className="icon-container" onClick={clickNoti}>
                        {
                            showModal?
                            <svg className="icon" t="1655360497195" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3325" width="200" height="200"><path d="M71.686667 333.7l429.726666-245.553333a21.333333 21.333333 0 0 1 21.173334 0l429.726666 245.553333L512 593.886667zM981.333333 366.113333L640.406667 567.566667l337.233333 337.233333a53.073333 53.073333 0 0 0 3.693333-19.466667zM603.58 591.086667c-0.366667-0.366667-0.72-0.746667-1.053333-1.133334l-79.673334 47.08a21.333333 21.333333 0 0 1-21.706666 0l-79.673334-47.08c-0.333333 0.386667-0.666667 0.766667-1.053333 1.133334L76.533333 934.973333A53.073333 53.073333 0 0 0 96 938.666667h832a53.073333 53.073333 0 0 0 19.466667-3.693334zM42.666667 366.113333V885.333333a53.073333 53.073333 0 0 0 3.693333 19.466667l337.233333-337.233333z" fill="#5C5C66" p-id="3326"></path></svg>
                            :<svg className="icon" t="1655358919949" class="icon" viewBox="0 0 1365 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2176" width="200" height="200"><path d="M838.72628 639.836488c-77.296481 61.718267-124.863547 92.280107-172.965741 92.280107-46.021136 0-92.517942-28.659157-164.40367-84.669376l-428.103588 376.552781H1278.364882l-434.881895-387.849959-4.875624 3.686447zM331.245152 515.864824A36039.187086 36039.187086 0 0 1 0 257.932412v709.819533a53.512949 53.512949 0 0 0 1.308094 6.302636l431.373824-379.64464c-31.275345-24.734874-64.810127-50.242713-101.436766-78.604576z m1030.837765 468.416676a51.134595 51.134595 0 0 0 3.329695-16.470096V227.786784a96934.068517 96934.068517 0 0 0-453.908722 354.612473z" p-id="2177"></path><path d="M1280.089188 0H85.323424A118.56091 118.56091 0 0 0 0 85.323424v67.247938c125.874347 100.188131 262.510742 205.60864 378.336546 294.975264 63.858785 49.291372 121.11764 93.588201 166.484729 128.847289 121.771687 95.490884 121.771687 95.490884 246.040646-3.864824 112.377192-89.842295 414.78481-325.120892 574.788526-449.568227v-37.518523A118.382534 118.382534 0 0 0 1280.089188 0z" p-id="2178"></path></svg>
                        }
                        
                        {
                            notiNum ? 
                            <div className="num">{notiNum}</div>
                            :null
                        }
                    </div>
                    {
                            showModal ?
                            <div className="modal">
                                {
                                    offerList.map((v)=>{
                                        return <OfferCard key={v.id} offer={v} onAcc={onAcc} onReject={onReject}></OfferCard>
                                    })
                                }
                            </div>
                            : null
                    }

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

            <div className="MyCraft-container">
                <h3>MyCrafts</h3>
                <ShowCraft list={myCrafts} banAutoPlay={true}></ShowCraft>
            </div>
        </div>
    )
}

export default UserPage