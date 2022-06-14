import useStore from '../store'
import "./Header.scss"

export default function Header(props: Props) {
    const store = useStore();
    const onLogin = () => {
        props.cv("login");
    }
    const onRegiste = () => {
        props.cv("registe");
    }
    const onHome = () => {
        props.cv("/");
    }
    const onUser = () => {
        props.cv("/userPage")
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
            <span>Search</span>
        </div>
    )
}
