
let user:User = {
    "name": '',
    "assets": 0,
    "tocken": ''
};
let routerParam:any = {

}

const _store: Store = {
    user,
    routerParam,
}
 
function initUser() {

}

function useStore() {
    return _store
}

initUser();

export default useStore
