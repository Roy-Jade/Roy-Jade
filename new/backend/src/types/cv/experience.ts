export interface Experience {
    id?:number,
    slug:string,
    type:"detail"|"summary",
    title:string,
    compagny?:string,
    location?:string,
    start_date?:string,
    end_date?:string,
    description?:string,
};