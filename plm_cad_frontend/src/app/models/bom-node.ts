export interface BomNode {
    id:string,
    name?:string,
    part_number?:string,
    children?:BomNode[]
    cycle?:boolean
}
