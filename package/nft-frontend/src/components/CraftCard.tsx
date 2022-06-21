import { useCv } from "../hook";
import "./CraftCard.scss"

type CraftCardProps = {
    url: string,
    id: number,
    width?: number,
    height?: number,
}

export default function CraftCard(props: CraftCardProps) {
    const url = props.url;
    const id = props.id;
    const width = props.width || 100;
    const height = props.height || 100;
    const cv = useCv();
    const onClick = () => {
        cv("/craft",{id:id});
    }
    return (
        <div className="CraftCard-container" onClick={onClick}
            style={{
                width,
                height
            }}
        >
            <img src={url} alt="network error" />
        </div>
    )
}
