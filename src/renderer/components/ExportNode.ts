import { from } from "linq-to-typescript";
import { AbstractNode } from "baklavajs";
import ReplyNode from "./ReplyNode";

function GetNextNum(nowNum:number, randPlus:number, randFix:number):number
{
    return nowNum + Math.floor(Math.random() * (randPlus)) + randFix;
}

function SetResNumber(sortedNodes:readonly AbstractNode[]):void
{
    let nowNum = 1;
    let randPlus = 4;
    let randFix = 1;
    for ( const node of sortedNodes){
        if(node instanceof ReplyNode){
            node.inputs.resNumber.value = nowNum;
            nowNum = GetNextNum(nowNum, randPlus, randFix);
        }
        else{
            throw new Error('not implemented');
        }
    }
}

function MakeNodeString(node:AbstractNode):string
{
    if(node instanceof ReplyNode){
        const resNum = node.inputs.resNumber.value;
        const handleName = (!node.inputs.handleName.value)?node.inputs.handleName.name:node.inputs.handleName.value;
        const contents = node.inputs.contents.value;
        return `《id:r${resNum}》${resNum}：${handleName}`+"\n"+
        `${contents}`+"\n"+
        `《id:r${resNum}e》　`
    }
    else{
        throw new Error('not implemented');
    }
}

export function ExportNode(nodes:readonly AbstractNode[]):string
{
    //HACK:Typescriptのpositionが存在しない旨の警告を抑制
    //     positionはAbstructNodeにrenderer-vueにて後付けされている？？がそれを参照する方法がわからない
    //     https://github.com/newcat/baklavajs/blob/60f0c88a462c21536ffe99803974f6d38c945b70/packages/renderer-vue/src/overrides.d.ts#L14
    // @ts-ignore
    const sortedNodes = from(nodes).orderBy(n=>(n.position.y), (a,b)=>(Number(a)-Number(b))).toArray();

    SetResNumber(sortedNodes);

    return from(sortedNodes)
        .select(n=>MakeNodeString(n))
        .aggregate((a,b)=>a+"\n"+b);
}