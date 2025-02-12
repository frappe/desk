<template>
  <div
    v-if="_avatars?.length"
    class="mr-1.5 flex cursor-pointer items-center"
    :class="[
      _avatars?.length > 1 ? 'flex-row-reverse' : 'truncate [&>div]:truncate',
    ]"
  >
    <div v-if="_avatars?.length == 1" class="flex items-center gap-2 text-base">
      <Tooltip :text="_avatars[0].name">
        <Avatar
          shape="circle"
          :image="_avatars[0].image"
          :label="_avatars[0].label"
          size="sm"
        />
        <div class="truncate">{{ _avatars[0].label }}</div>
      </Tooltip>
    </div>
    <Tooltip
      v-for="avatar in _avatars"
      v-else
      :key="avatar.name"
      :text="avatar.name"
    >
      <Avatar
        class="user-avatar -mr-1.5 ring-2 ring-white transition hover:z-10 hover:scale-110"
        shape="circle"
        :image="avatar.image"
        :label="avatar.label"
        :size="size"
        :data-name="avatar.name"
      />
    </Tooltip>
  </div>
</template>
<script setup lang="ts">
import { Avatar, Tooltip } from "frappe-ui";
import { computed } from "vue";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  avatars: {
    type: String,
  },
  size: {
    type: String,
    default: "md",
  },
});
const { getUser } = useUserStore();
const _avatars = computed(() => {
  let result: any;
  try {
    result = JSON.parse(props.avatars);
  } catch (error) {
    result = props.avatars;
  }
  if (!result) return;
  if (result[0].hasOwnProperty("name")) {
    return result;
  }
  result = result.map((a: string) => {
    let _user = getUser(a);
    return {
      name: _user.name,
      label: _user.full_name,
      image: _user.user_image,
    };
  });
  return result;
});
</script>
