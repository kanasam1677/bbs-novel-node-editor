import { markRaw } from "vue";
import { defineNode , IntegerInterface, TextInputInterface } from "baklavajs";
import MultiLineTextComponent from "./MultiLineTextComponent.vue"

export default defineNode({
    type:"DescriptiveNode",
    title:"地の文",
    inputs:{
        contents:()=> new TextInputInterface("内容", "").setPort(false).setComponent(markRaw(MultiLineTextComponent)),
    },
    outputs:{
    },
});