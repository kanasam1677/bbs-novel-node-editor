<template>
    <div>
        <textarea v-model="v" rows="5" class="baklava-input" :placeholder="intf.name" :title="intf.name"></textarea>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import type { TextInputInterface } from "baklavajs";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => TextInputInterface,
            required: true,
        },
        modelValue: {
            type: String,
            required: true,
        },
    },    
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const v = computed({
            get: () => props.modelValue,
            set: (v) => {
                emit("update:modelValue", v);
            },
        });
        return { v };
    },
});
</script>
<style scoped>
textarea{
    width:100%;
    resize: vertical;
}
</style>