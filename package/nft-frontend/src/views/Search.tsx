
import { useState } from "react";
import { httpQueryCraftListsByName } from "../apis";
import ShowCraft from "../components/ShowCraft";
import "./Search.scss";

export default function Search() {
    const [text,setText] = useState("");
    const [list,setList] = useState<Array<Craft>>([]);
    const onSearch = () => {
        (async()=>{
            let res = await httpQueryCraftListsByName({pattern:text});
            setList(res);
        })();
    }
    return (
        <div className="Search-container">
            <div className="input-container">
                <input type="text" value={text} onChange={(e)=>{setText(e.target.value)}}/>
                <div>
                    <button onClick={onSearch}>Search</button>
                </div>
            </div>
            {
                list.length?
                <div className="result">
                    <h4>
                        Result List✨:
                    </h4>
                    <ShowCraft list={list} banAutoPlay={true}></ShowCraft>
                </div>
                :<div className="result">
                    <h4>No Result🎃</h4>
                </div>
            }

        </div>
    )
}
