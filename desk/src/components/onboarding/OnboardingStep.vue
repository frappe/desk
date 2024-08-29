<template>
  <div class="mb-1 flex items-center justify-between gap-2 py-1">
    <div class="flex items-center gap-2">
      <FeatherIcon
        class="h-4 w-4"
        :name="isCompleted ? 'check-circle' : 'circle'"
      />
      <h3 class="">{{ title }}</h3>
    </div>
    <Button label="Proceed" icon-right="arrow-right" @click="action" />
  </div>
</template>

<script setup lang="ts">
import { FeatherIcon } from "frappe-ui";

interface Props {
  title: string;
  isCompleted: boolean;
  action: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  isCompleted: false,
});
</script>

<style scoped></style>
