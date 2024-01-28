import { from } from "linq-to-typescript";
import { AbstractNode, DependencyEngine, Editor, applyResult } from "baklavajs";
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
        let contents = node.inputs.contents.value;
        const nodeNum = node.inputs.nodeNum.value;
        if(nodeNum>0){
            let ancStr = '';
            for(let i=1; i<nodeNum + 1; i++){
                const ancNum = node.outputs[`anchor${i}`].value;
                ancStr = ancStr + `>>${ancNum} `
            }
            contents = ancStr + "\n" + contents;
        }
        return `《id:r${resNum}》${resNum}：${handleName}`+"\n"+
        `${contents}`+"\n"+
        `《id:r${resNum}e》　`
    }
    else{
        throw new Error('not implemented');
    }
}

export function ExportNode(nodes:readonly AbstractNode[], editor:Editor, engine:DependencyEngine):Promise<string>
{
    //HACK:Typescriptのpositionが存在しない旨の警告を抑制
    //     positionはAbstructNodeにrenderer-vueにて後付けされている？？がそれを参照する方法がわからない
    //     https://github.com/newcat/baklavajs/blob/60f0c88a462c21536ffe99803974f6d38c945b70/packages/renderer-vue/src/overrides.d.ts#L14
    // @ts-ignore
    const sortedNodes = from(nodes).orderBy(n=>(n.position.y), (a,b)=>(Number(a)-Number(b))).toArray();

    SetResNumber(sortedNodes);
    return engine.runOnce({}).then((result)=>{
        if(!result) return "";
        applyResult(result, editor);
        return from(sortedNodes)
            .select(n=>MakeNodeString(n))
            .aggregate((a,b)=>a+"\n"+b);
    });

}