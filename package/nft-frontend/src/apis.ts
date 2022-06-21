import axios, { Axios, AxiosInstance } from 'axios';
import { getStore } from './store';
import { errToast } from './util';

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
            console.log(config);
            return config
        }, function (error) {
            return Promise.reject(error)
        })
        this.instance.interceptors.response.use(function (res) {
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
                    errToast("network or server error");
                    return '网络或系统异常';
            }
        })
    }
    get<T>(url: string, params = {}):T {
        return this.instance.get(url, params) as any as T;
    }
    post<T>(url: string, data:any = {},withTocken:boolean=false):T {
        if(withTocken) {
            let user = getStore();
            data.tocken = user.tocken;
        }
        return this.instance.post(url, data) as any as T;
    }
}

function notLoginHandler() { //未登录或登录失效
    errToast("please login your account");
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

type QueryCraftByIdData = {
    id: number
}
export async function httpQueryCraftById(data: QueryCraftByIdData):Promise<Craft> {
    return await fetch.post<Craft>("/queryCraftById",data);    
}

type UpdateLikesByIdData = {   
    id: number,
    likes: number,
    dislikes: number,
}
export async function httpUPdateLikesById(data:UpdateLikesByIdData):Promise<string> {
    return await fetch.post<string>("/updateLikesById",data);
}

type QueryCraftHistoryByIdData = {
    craftId: number
}
export async function httpQueryCraftHistoryById(data:QueryCraftHistoryByIdData):Promise<Array<CraftHistory>> {
    return await fetch.post<Array<CraftHistory>>("/queryCraftHistoryById",data)
}

type QueryCraftByOwnerData = {
    owner: string
}
export async function httpQueryCraftByOwner(data:QueryCraftByOwnerData):Promise<Array<Craft>> {
    return await fetch.post<Array<Craft>>("/queryCraftByOwner",data);
}

type MakeAnOfferData = {
    craftId: number,
    craft_id: String,
    price: number,
    intro: string,
    fromName: string,
    toName: string,
}
export async function httpMakeAnOffer(data:MakeAnOfferData):Promise<string> {
    return await fetch.post<string>("/makeAnOffer",data);
}

type QueryTransactionByToNameData = {
    toName: string
}
export async function httpQueryTransactionByToName(data:QueryTransactionByToNameData):Promise<Array<Transaction>> {
    return await fetch.post<Array<Transaction>>("/queryTransactionByToName",data);
}


type QueryTransactionByFromNameData = {
    toName: string
}
export async function httpQueryTransactionByFromName(data:QueryTransactionByFromNameData):Promise<Array<Transaction>> {
    return await fetch.post<Array<Transaction>>("/queryTransactionByFromName",data);
}



export async function httpAccOffer(data:Transaction):Promise<string> {
    return await fetch.post<string>("/accOffer",data);
}

export async function httpRejectOffer(data:Transaction):Promise<string> {
    return await fetch.post<string>("/rejectOffer",data)
}


type TransferDataType = {
    fName: string,
    tName: string,
    amount: number
}
export async function httpTransfer(data: TransferDataType):Promise<String> {
    return await fetch.post<string>("/transfer",data);
}