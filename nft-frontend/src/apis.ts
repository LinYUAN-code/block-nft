import axios, { Axios, AxiosInstance } from 'axios';
import { toast } from 'react-toastify';

export const BASE_ADDR = "http://127.0.0.1:7898/";

class Http {
    public instance: AxiosInstance
    constructor() {
        // 创建 axios 实例
        this.instance = axios.create({
            baseURL: BASE_ADDR,
            timeout: 10000, // 请求超时时间
        })
        // this.instance.defaults.withCredentials = true;
        // 拦截器配置---------------------------------------------------------------------------------------------------------------
        this.instance.interceptors.request.use(function (config) {
            // 在发送请求之前做些什么
            return config
        }, function (error) {
            return Promise.reject(error)
        })
        this.instance.interceptors.response.use(function (res) {
            console.log(res);
            let code:number = res.status;
            // do something
            if (code === 200) {
                return res.data;
            } else {
                return Promise.reject(res.data);
            }
        }, function (error) {
            let code:number = error.response.status;
            console.log(code,error);
            switch (code) {
                case 301: //未登录或登录token失效
                    notLoginHandler();
                    return "未登录或登录token失效";
                default:
                    toast.error('👻network or server error!', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                    return '网络或系统异常';
            }
        })
    }
    get<T>(url: string, params = {}):T {
        return this.instance.get(url, params) as any as T;
    }
    post<T>(url: string, data = {}):T {
        return this.instance.post(url, data) as any as T;
    }
}

function notLoginHandler() { //未登录或登录失效
    toast.error('👻please login your account!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
    // 返回首页
    window.history.go(-99);
    if(document.location.pathname!=='/') {
        window.history.pushState(null,"","/");
    }
}

let fetch = new Http();


type LoginData = {
    name: string,
    pwd: string
}
export async function httpLogin(data: LoginData): Promise<User> {
    let res = await fetch.post<User>("/login",data);
    return res;
}


type RegisteData = LoginData
export async function httpRegiste(data: RegisteData): Promise<User> {
    return await fetch.post<User>("/registe",data);
}

type UploadCraftData = {
    file: Object,
    name: string,
    owner: string,
}
export async function httpUploadCraft(data: FormData): Promise<Craft> {
    return await fetch.post<Craft>("/uploadCraft",data);
}


export async function httpGetCraftList():Promise<Array<Craft>> {
    return await fetch.post<Array<Craft>>("/getCraftLists",{});
}

type QueryCraftListsByNameData = {
    pattern: string
}
export async function httpQueryCraftListsByName(data: QueryCraftListsByNameData):Promise<Array<Craft>> {
    return await fetch.post<Array<Craft>>("/queryCraftListsByName",data);
}