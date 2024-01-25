
import { markRaw } from "vue";
import { defineDynamicNode, NodeInterface, IntegerInterface, TextInputInterface, TextInterface } from "baklavajs";
import MultiLineTextComponent from "./MultiLineTextComponent.vue"

export default defineDynamicNode({
    type:"ReplyNode",
    title:"レス内容",
    inputs:{
        resNumber:()=>new IntegerInterface("自身のレス番号",0).setPort(false).setHidden(true),
        handleName:()=>new TextInputInterface("名無しさん", "").setPort(false),
        contents:()=> new TextInputInterface("内容", "").setPort(false).setComponent(markRaw(MultiLineTextComponent)),
        nodeNum: ()=>new IntegerInterface("アンカー数", 0, 0 ,20).setPort(false),
    },
    outputs:{
        output: ()=>new NodeInterface("レス番", 0),
    },
    onUpdate({nodeNum}){
        let result: Record<string, (() => NodeInterface<any>) | undefined> = {};
        for (let i = 1; i < nodeNum+1; i++) {
            result[`anchor${i}`] = (()=>new IntegerInterface(`アンカー${i}`, 0));
        }
        return {
            inputs:result
        };
    }
});