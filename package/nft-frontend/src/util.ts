import { toast } from "react-toastify";


export function accToast(text: string):void {
    toast.success(`🧙🏻‍♂️${text}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

export function errToast(text: string):void {
    toast.error(`👻${text}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

export function shallowClone(obj: any):any {
    let ans:any = {};
    for(let x in obj) {
        ans[x] = obj[x];
    }
    return ans;
}