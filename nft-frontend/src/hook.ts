
let cv = (path:string,param: any) => {

}

export function initCv(f: Cv) {
    cv = f
}

export function useCv(): Cv {
    return cv;
}