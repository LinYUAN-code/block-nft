import {useStore} from '../store'
import "./Header.scss"

export default function Header(props: Props) {
    const store = useStore();
    const onLogin = () => {
        props.cv("login",null);
    }
    const onRegiste = () => {
        props.cv("registe",null);
    }
    const onHome = () => {
        props.cv("/",null);
    }
    const onUser = () => {
        props.cv("/userPage",null)
    }
    const onSearch = () => {
        props.cv("/search",null);
    }
    return (
        <div className='Header-container'>
            <span onClick={onHome}>Home</span>
            {
                store.user.name ? 
                <span onClick={onUser}>User</span>
                :<span onClick={onLogin}>Login</span>
            }
            <span onClick={onRegiste}>registe</span>
            <span onClick={onSearch}>Search</span>
        </div>
    )
}
