import { defineNode , IntegerInterface, TextInputInterface } from "baklavajs";

export default defineNode({
    type:"SettingNode",
    title:"レス設定",
    inputs:{
        startNum:()=>new IntegerInterface("開始番号", 1, 0 ,1000).setPort(false),
        randPlus:()=>new IntegerInterface("連番増加乱数幅", 4, 0 ,50).setPort(false),
        randFix: ()=>new IntegerInterface("連番増加固定値", 1, 0 ,20).setPort(false),
        defaultName:()=>new TextInputInterface("デフォルト名", "").setPort(false),
    },
    outputs:{
    },
});