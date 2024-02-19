import { from } from "linq-to-typescript";
import { AbstractNode, DependencyEngine, Editor, applyResult } from "baklavajs";
import ReplyNode from "./ReplyNode";
import SettingNode from "./SettingNode";
import DescriptiveNode from "./DescriptiveNode";

function GetNextNum(nowNum:number, randPlus:number, randFix:number):number
{
    const result = nowNum + Math.floor(Math.random() * (randPlus)) + randFix;
    return (result > nowNum)?result:nowNum+1;
}

function SetResNumber(sortedNodes:readonly AbstractNode[]):void
{
    let lastNum:(number|undefined) = undefined;
    let nowNum = 1;
    let randPlus = 4;
    let randFix = 1;
    let defaultName = "名無しさん";
    for ( const node of sortedNodes){
        if(node instanceof ReplyNode){
            node.inputs.resNumber.value = nowNum;
            node.inputs.defaultName.value = defaultName;
            lastNum = nowNum;
            nowNum = GetNextNum(nowNum, randPlus, randFix);
        }
        else if(node instanceof SettingNode){
            randPlus = node.inputs.randPlus.value;
            randFix = node.inputs.randFix.value;
            const dn = node.inputs.defaultName.value;
            if(dn)
            defaultName = node.inputs.defaultName.value;
            const nn = node.inputs.startNum.value;
            if(nn>0){
                nowNum = nn;
            }
            else{
                if(lastNum != undefined)
                    nowNum = GetNextNum(lastNum, randPlus, randFix);//計算済みの場合前回の結果から再計算
            }
        }
        else if(node instanceof DescriptiveNode){
            //処理なし
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
        let handleName = (!node.inputs.handleName.value)?node.inputs.defaultName.value:node.inputs.handleName.value;
        let contents = node.inputs.contents.value;
        const nodeNum = node.inputs.nodeNum.value;
        if(nodeNum>0){
            const ancList:Map<number, number> = new Map();
            const hitList:Set<number> = new Set();
            for(let i=1; i<nodeNum + 1; i++){
                ancList.set(i, node.outputs[`anchor${i}`].value);
            }
            const ancPat = /\$\$(\d+)/g;
            const noAncPat = /\$\$r(\d+)/g;
            function SetActuallyNum(match:string, matchNum:string, head:string):string{
                const key = parseInt(matchNum);
                if(ancList.has(key)){
                    hitList.add(key);//重複時自動無視
                    return head + ancList.get(key)?.toString();
                }
                else{
                    return match;
                }
            }
            handleName = handleName.replaceAll(ancPat,(match,matchNum)=>SetActuallyNum(match, matchNum, '>>'));
            contents = contents.replaceAll(ancPat,(match,matchNum)=>SetActuallyNum(match, matchNum, '>>'));
            handleName = handleName.replaceAll(noAncPat,(match,matchNum)=>SetActuallyNum(match, matchNum, ''));
            contents = contents.replaceAll(noAncPat,(match,matchNum)=>SetActuallyNum(match, matchNum, ''));
            const noHitAncList = from(ancList).where(n=>!hitList.has(n[0]));
            if(noHitAncList.any()){
                const noHitAncStr = noHitAncList
                    .select(n=>`>>${n[1]}`)
                    .aggregate((a,b)=>`${a} ${b}`);
                contents = noHitAncStr + '\n' + contents;
            }            
        }
        return `《id:r${resNum}》${resNum}：${handleName}`+"\n"+
        `${contents}`+"\n"+
        `《id:r${resNum}e》`+"\n";
    }
    else if(node instanceof SettingNode){
        return '';
    }        
    else if(node instanceof DescriptiveNode){
        return node.inputs.contents.value + "\n";
    }
    else{
        throw new Error('not implemented');
    }
}

export function ExportNode(nodes:readonly AbstractNode[], editor:Editor, engine:DependencyEngine):Promise<string>
{
    if((nodes?.length??0)<=0)
        return new Promise<string>((resolve, reject)=>reject("ノードを配置してください。"));
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
            .aggregate((a,b)=>a+b);
    });

}