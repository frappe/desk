<template>
  <div
    class="progressbar"
    role="progressbar"
    :class="{
      completed: isCompleted,
      fillOuter: isOuterCircleFilledOnComplete,
    }"
  >
    <div v-if="!isCompleted">
      <p v-if="!showPercentage">{{ step }}</p>
      <p v-else>{{ progress.toFixed(0) }}%</p>
    </div>
    <div v-else class="check-icon"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  step: number;
  totalSteps: number;
  ringSize: string;
  ringBarWidth: string;
  innerTextFontSize: string;
  progressColor: string;
  progressRemainingColor: string;
  progressCompleteColor: string;
  isOuterCircleFilledOnComplete: boolean;
  showPercentage: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  totalSteps: 4,
  ringSize: "42px",
  ringBarWidth: "10px",
  innerTextFontSize: "16px",
  progressColor: "#333",
  progressRemainingColor: "#888",
  progressCompleteColor: "#76f7be",
  isOuterCircleFilledOnComplete: false,
  showPercentage: false,
});

const progress = computed(() => (props.step / props.totalSteps) * 100);
const isCompleted = computed(() => props.step === props.totalSteps);
</script>

<style scoped>
.progressbar {
  --size: v-bind($props.ringSize);
  --bar-width: v-bind($props.ringBarWidth);
  --font-size: v-bind($props.innerTextFontSize);
  --color-incomplete: v-bind($props.progressColor);
  --color-remaining-circle: v-bind($props.progressRemainingColor);
  --color-complete: v-bind($props.progressCompleteColor);
  --progress: v-bind(progress + "%");

  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  display: grid;
  place-items: center;

  position: relative;
  font-size: var(--font-size);
}
@property --progress {
  syntax: "<length-percentage>";
  inherits: true;
  initial-value: 0%;
}

.progressbar::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: conic-gradient(
    var(--color-incomplete) var(--progress),
    var(--color-remaining-circle) 0%
  );
  transition: --progress 500ms linear;
  aspect-ratio: 1 / 1;
  align-self: center;
}

.progressbar::after {
  content: "";
  position: absolute;
  background: white;
  border-radius: inherit;
  z-index: 1;
  width: calc(100% - var(--bar-width));
  aspect-ratio: 1 / 1;
}

.progressbar > div {
  z-index: 2;
  position: relative;
}

.progressbar.completed:not(.fillOuter)::after {
  background: var(--color-complete);
}
.progressbar.completed.fillOuter::before {
  background: var(--color-complete);
}

.check-icon {
  width: 15px;
  height: 15px;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODUiIGhlaWdodD0iODUiIHZpZXdCb3g9IjUgMzAgNzUgMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0zNS40MjM3IDUzLjczMjdMNjcuOTc4NyAyMS4xNzc3TDcyLjk4OTUgMjYuMTg0MkwzNS40MTk1IDYzLjc1TDEyLjg4NiA0MS4yMTIyTDE3Ljg5MjUgMzYuMjAxNUwzNS40MjM3IDUzLjczMjdaIiBmaWxsPSIjMWYxYTM4Ii8+Cjwvc3ZnPgo=");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
