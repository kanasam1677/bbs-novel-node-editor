
import { markRaw } from "vue";
import { Node, NodeInterface, CalculateFunction, NumberInterface, TextInputInterface } from "baklavajs";
import MultiLineTextComponent from "./MultiLineTextComponent.vue"
interface Inputs {
    contents: string;
    number1: number;
    number2: number;
}

interface Outputs {
    output: number;
}

export default class ReplyNode extends Node<Inputs, Outputs> {
    public type = "ReplyNode";

    width = 400;

    public inputs = {
        contents: new TextInputInterface("内容", "").setPort(false).setComponent(markRaw(MultiLineTextComponent)),
        number1: new NumberInterface("Number", 1),
        number2: new NumberInterface("Number", 2),
    };

    public outputs = {
        output: new NodeInterface("Output", 0),
    };

    public constructor() {
        super();
        this.title = this.type;
        outerWidth = 400;
        this.initializeIo();
    }

    public calculate: CalculateFunction<Inputs, Outputs> = ({ number1, number2, contents: operation }) => {
        let output;
        if (operation === "Add") {
            output = number1 + number2;
        } else if (operation === "Subtract") {
            output = number1 - number2;
        } else {
            throw new Error("Unknown operation: " + operation);
        }
        return { output };
    }
}
