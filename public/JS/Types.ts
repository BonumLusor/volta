export type blank = {
  id: number,
  blkCompr: number,
  blkLarg:	number,
  blkQtd: number,
  blkOp: string,
}

export type response = {
  px: number,
  tx: number,
  py: number,
  ty: number,
  plate: number,
}

export type cut = {
  px: number,
  py: number,
  tx: number,
  ty: number,
  op: string,
  color: string,
  plate: number,
  colision: boolean,
  draggable: boolean,
}

export type cutAdd =  {
  x: number,
  oX: number,
  y: number,
  oY: number,
  qtd: number,
  op: string,
  positionX: number[],
  positionY: number[],
  color: string[],
  plate: number
}

export type upload = {
  cortes: response[]
  codPlano: number
  id: number
}

export type maxArrange = {
  x: number,
  y: number,
}

export type stage = 'OPs' | 'MPs' | 'CNV'

export type OPs = {
  id: number,
  materiaPrimaCode:string,
  materiaPrimaName:string,
  materiaPrimaNumOp:number
}

export type MPs = {
  id: number,
  data:string,
  comercialDescription:string,
  mpCompr:number,
  mpLarg:number,
  mpLote:number,
  mpEmbalagem:string,
  mpCondicao: "novo" | "usada",
  mpStatus: "disponivel" | "indisponivel",
  mpCortes: number,

}

export type occupiedGrid = {
  index: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
}