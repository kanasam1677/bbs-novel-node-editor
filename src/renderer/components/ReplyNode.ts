
import { markRaw } from "vue";
import { defineDynamicNode, Node, NodeInterface, CalculateFunction, IntegerInterface, TextInputInterface, INodeState } from "baklavajs";
import MultiLineTextComponent from "./MultiLineTextComponent.vue"

export default defineDynamicNode({
    type:"ReplyNode",
    inputs:{
        contents:()=> new TextInputInterface("内容", "").setPort(false).setComponent(markRaw(MultiLineTextComponent)),
        nodeNum: ()=>new IntegerInterface("アンカー数", 0, 0 ,20),
    },
    outputs:{
        output: ()=>new NodeInterface("Output", 0),
    },
    onUpdate({nodeNum}){
        let result: Record<string, (() => NodeInterface<any>) | undefined> = {};
        for (let i = 0; i < nodeNum; i++) {
            result[`anchor${i}`] = (()=>new IntegerInterface(`anchor${i}`,0));
        }
        return {
            inputs:result
        };
    }
});