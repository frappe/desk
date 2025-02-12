<template>
  <Dialog v-model="show" :options="{ title: 'Export' }">
    <template #body-content>
      <FormControl
        v-model="form.export_type"
        variant="outline"
        :label="'Export Type'"
        type="select"
        :options="[
          {
            label: 'Excel',
            value: 'Excel',
          },
          {
            label: 'CSV',
            value: 'CSV',
          },
        ]"
        :placeholder="'Excel'"
      />

      <div class="mt-3">
        <FormControl
          v-model="form.export_all"
          type="checkbox"
          :label="`Export All ${rowCount} Record(s)`"
        />
      </div>
    </template>
    <template #actions>
      <Button
        label="Download"
        variant="solid"
        @click="() => emit('update', form)"
        class="w-full"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive } from "vue";

defineProps<{
  rowCount: number;
}>();

interface R {
  export_type: "CSV" | "Excel";
  export_all: boolean;
}

interface E {
  (event: "update", value: R);
}

const emit = defineEmits<E>();

const show = defineModel();

const form: R = reactive({
  export_type: "Excel",
  export_all: false,
});
</script>

<style scoped></style>
