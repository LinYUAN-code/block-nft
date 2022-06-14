import { useEffect, useState } from 'react'
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './views/Home';
import Login from './views/Login';
import Registe from './views/Registe';
import UserPage from './views/UserPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss'
import { gsap } from "gsap";
import Craft from './views/Craft';
import useStore from './store';
import { initCv } from './hook';
import Search from './views/Search';


const routes: Record<string,any> = {
    '/login': Login,
    '/': Home,
    '/userPage': UserPage,
    '/registe': Registe,
    '/craft': Craft,
    '/search': Search
}

function App() {   
    let [view,setView] = useState('/');
    const TargetView = routes[view];
    const changeView = (r: string,param: any = null) => {
        if(r[0]!=='/')r = '/' + r;
        console.log(r);
        if(r===view)return ;
        let store = useStore();
        store.routerParam = param;
        setView(r);
        window.history.pushState(null,"",r);
    }
    initCv(changeView);
    window.onpopstate = function (e) {
        changeView(document.location.pathname);
    }

    // ghost
    useEffect(()=>{
        let ghost = gsap.timeline({repeat:9999,yoyo:true});
        ghost.fromTo(".ghost",2,{y:-3,x:-3,scale:0.9},{y:10,x:10,scale:1.1,ease:"elastic"},"0")
    },[])
    return (
        <>
            <div className='App-container'>
                <h1>Nft Community<div className='ghost' style={{display:"inline-block"}}>👻</div> enjoying...</h1>
                <Header cv={changeView}></Header>
                <TargetView cv={changeView}></TargetView>
                <Footer></Footer>
            </div>
            <ToastContainer/>
        </>
    )
}

export default App
