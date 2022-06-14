
type Cv = (path:string,param:any)=>void

type Props = {
    cv: Cv
}

type User = {
    'name': string,
    'assets': number,
    'tocken': string,
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
}

type CraftHistory = {
    time: number,
    owner: string,
}