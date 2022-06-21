
type Cv = (path:string,param:any)=>void

type Props = {
    cv: Cv
}

type User = {
    'name': string,
    'assets': number,
    'tocken': string,
    'address': String,
    "pwd": string,
}

type Store = {
    "user": User,
    "routerParam": any,
}

type Craft = {
    "id": number,
    "name": string,
    "owner": string,
    "url": string,
    "time": number,
    "likes": number,
    "dislikes": number,
    "craft_id": string,
}

type CraftHistory = {
    time: number,
    owner: string,
}

type Transaction = {
    "id": number,
    "fromName": string,
    "toName": string,
    "intro": string,
    "craftId": number,
    "price": number,
    "status": string
}