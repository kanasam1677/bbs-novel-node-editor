import { from } from "linq-to-typescript";
import { AbstractNode } from "baklavajs";



export function ExportNode(nodes:readonly AbstractNode[]):string
{
    //HACK:Typescriptのpositionが存在しない旨の警告を抑制
    //     positionはAbstructNodeにrenderer-vueにて後付けされている？？がそれを参照する方法がわからない
    //     https://github.com/newcat/baklavajs/blob/60f0c88a462c21536ffe99803974f6d38c945b70/packages/renderer-vue/src/overrides.d.ts#L14
    // @ts-ignore
    const sortedNodes = from(nodes).orderBy(n=>(n.position.y), (a,b)=>(Number(a)-Number(b))).toArray();

    return from(sortedNodes)
        .select(n=>n.inputs["contents"].value)
        .aggregate((a,b)=>`${a},${b}`);
}