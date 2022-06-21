
import { useState } from "react";
import { httpAccOffer, httpRejectOffer } from "../apis";
import { accToast } from "../util";
import "./OfferCard.scss"

type OfferCardProp = {
    "offer": Transaction,
    "onAcc": any,
    "onReject": any,
}

export default function OfferCard(props: OfferCardProp) {
    const offer = props.offer;
    console.log(offer);
    const [showIntro,setShowIntro] = useState(false);
    const onShow = () => {
        setShowIntro(!showIntro);
    }
    const onAcc = props.onAcc;
    const onReject = props.onReject;

    return (
        <div className="OfferCard-container">
            <div>
                <span className="name">{offer.fromName}</span>
                <span>offer: {offer.price}</span>
                <span className="btn-container">
                    <span className="button" onClick={onShow}>{showIntro?"🔼":"🔽"}</span>
                    <span className="button" onClick={()=>{onAcc(offer)}}>✅</span>
                    <span className="button" onClick={()=>{onReject(offer)}}>❎</span>
                </span>
            </div>
            {
                showIntro?
                <div className="intro">
                    {offer.intro}
                </div>
                :null
            }

        </div>
    )
}
