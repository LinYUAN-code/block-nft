import ShowCraft from "../components/ShowCraft";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import "./Home.scss";
gsap.registerPlugin(ScrollTrigger);

function Home(props: Props) {
    const el = useRef();
    const q = gsap.utils.selector(el);
    // animation
    useEffect(()=>{
        // cloundText
        let cloundText = gsap.timeline();
        ScrollTrigger.create({
            animation: cloundText,
            trigger: ".cloundText",
            start: "top 80%",
            end: "bottom 60%",
            scrub: 2,
        });
        cloundText.fromTo(".cloundText1",{x:0,color: "#222"},{x:200,fontSize: "23px",y:20,color: "#fff"});
        cloundText.fromTo(".cloundText2",{x:700,color: "#222"},{x:300,y:20,color: "#fff"});
        cloundText.fromTo(".cloundText3",{x:600,color: "#222"},{x:200,fontSize:"25px",color: "#fff"});
        cloundText.fromTo(".cloundText4",{x:100,color: "#222"},{x:250,color: "#fff"});
        cloundText.fromTo(".cloundText5",{x:1000,color: "#222"},{x:200,color: "#fff"});
        

        let craftImage = gsap.timeline();
        ScrollTrigger.create({
            animation: craftImage,
            trigger: ".craftImage",
            start: "top bottom",
            end: "bottom 60%",
            scrub: 1
        });
        craftImage.fromTo(".craftImage1",{x:70,y:-50,opacity:0},{x:70,y:10,opacity:1,zIndex:0},0);
        craftImage.fromTo(".craftImage2",{x:60,y:-50,opacity:0},{x:60,y:-10,opacity:1,zIndex:1},0.3);
        craftImage.fromTo(".craftImage3",{x:60,y:-50,opacity:0},{x:60,y:10,opacity:1,zIndex:2},0.3);
        craftImage.fromTo(".craftImage4",{x:60,y:-50,opacity:0},{x:60,y:10,opacity:1,zIndex:3},0.3);
        craftImage.fromTo(".craftImage5",{x:-37,y:-50,opacity:0},{x:-37,y:100,opacity:1,zIndex:4},0.3);
        craftImage.fromTo(".craftImage6",{x:-140,y:-50,opacity:0},{x:-140,y:200,opacity:1,zIndex:5},0.3);


    },[]);

    return (
        <div className="Home-container">
            <h2>What is Nft?</h2>
            <p>A non-fungible token (NFT) is a financial security consisting of 
                digital data stored in a blockchain, a form of distributed ledger. 
                The ownership of an NFT is recorded in the blockchain, and can be transferred by the owner, 
                allowing NFTs to be sold and traded. NFTs can be created by anybody, 
                and require few or no coding skills to create. 
                NFTs typically contain references to digital files such as photos, videos, and audio. 
                Because NFTs are uniquely identifiable, they differ from cryptocurrencies, which are fungible. 
                The market value of an NFT is associated with the digital file it references.</p>

            <h2>Nft Characteristic</h2>
            <div className="cloundText">
                <div className="cloundText1">Rare</div>
                <div className="cloundText2">Indivisible</div>
                <div className="cloundText3">Unique</div>
                <div className="cloundText4">Ownership</div>
                <div className="cloundText5">Transferable</div>
            </div>

            <h2>Eternal Craft</h2>
            <div className="craftImage">
                <div className="craftImage1 bii"><img src="/img/1.jpg" alt="" /></div>
                <div className="craftImage2 bii"><img src="/img/4.jpg" alt="" /></div>
                <div className="craftImage3 bii"><img src="/img/5.jpg" alt="" /></div>
                <div className="craftImage4 bi"><img src="/img/2.jpg" alt="" /></div>
                <div className="craftImage5 bi"><img src="/img/3.jpg" alt="" /></div>
                <div className="craftImage6 bi"><img src="/img/6.jpg" alt="" /></div>
            </div>
            
            <h2>Craft List</h2>
            <ShowCraft></ShowCraft>
        </div>
    )
}

export default Home;