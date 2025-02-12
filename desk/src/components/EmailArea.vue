<template>
  <div
    class="grow cursor-pointer border-transparent bg-white rounded-md shadow text-base leading-6 transition-all duration-300 ease-in-out"
  >
    <div class="mb-1 flex items-center justify-between gap-2">
      <!-- email design for mobile -->
      <div v-if="isMobileView" class="flex items-center gap-2">
        <div class="leading-tight">
          <span>{{ sender.full_name || "No name found" }}</span>
          <span
            class="sm:flex hidden text-sm text-gray-600"
            v-if="sender.name"
            >{{ "<" + sender.name + ">" }}</span
          >
        </div>
      </div>
      <!-- email design for desktop -->
      <div v-else class="flex items-center gap-2">
        <span>{{ sender.full_name || "No name found" }}</span>
        <span class="sm:flex hidden text-sm text-gray-600" v-if="sender.name">{{
          "<" + sender.name + ">"
        }}</span>
      </div>

      <div class="flex gap-0.5 items-center">
        <Tooltip :text="dateFormat(creation, dateTooltipFormat)">
          <div class="text-sm text-gray-600">
            {{ timeAgo(creation) }}
          </div>
        </Tooltip>
        <Button
          variant="ghost"
          class="text-gray-700"
          @click="
            emit('reply', {
              content: content,
              to: to && sender.name,
            })
          "
        >
          <ReplyIcon class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          class="text-gray-700"
          @click="
            emit('reply', {
              content: content,
              to: to ?? sender.name,
              cc: cc,
              bcc: bcc,
            })
          "
        >
          <ReplyAllIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>
    <!-- <div class="text-sm leading-5 text-gray-600">
      {{ subject }}
    </div> -->
    <div class="mb-3 text-sm leading-5 text-gray-600">
      <span v-if="to" class="text-2xs mr-1 font-bold text-gray-500">TO:</span>
      <span v-if="to"> {{ to }} </span>
      <span v-if="cc">, </span>
      <span v-if="cc" class="text-2xs mr-1 font-bold text-gray-500"> CC: </span>
      <span v-if="cc">{{ cc }}</span>
      <span v-if="bcc">, </span>
      <span v-if="bcc" class="text-2xs mr-1 font-bold text-gray-500">
        BCC:
      </span>
      <span v-if="bcc">{{ bcc }}</span>
    </div>
    <EmailContent :content="content" />
    <div class="flex flex-wrap gap-2">
      <AttachmentItem
        v-for="a in attachments"
        :key="a.file_url"
        :label="a.file_name"
        :url="a.file_url"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AttachmentItem } from "@/components";
import { dateFormat, timeAgo, dateTooltipFormat } from "@/utils";
import { ReplyIcon, ReplyAllIcon } from "./icons";
import { useScreenSize } from "@/composables/screen";

const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
});

const { sender, to, cc, bcc, creation, subject, attachments, content } =
  props.activity;

const emit = defineEmits(["reply"]);

const { isMobileView } = useScreenSize();

// TODO: Implement reply functionality using this way instead of emit drillup
// function reply(email, reply_all = false) {
//   emailBox.toggleEmailBox();
//   let editor = emailBox.editor;
//   let message = email.content;
//   let recipients = sender.name;
//   editor.toEmails = [email.sender];
//   editor.cc = editor.bcc = false;
//   editor.ccEmails = [];
//   editor.bccEmails = [];
//   console.log(recipients);

//   if (!email.subject.startsWith("Re:")) {
//     editor.subject = `Re: ${email.subject}`;
//   } else {
//     editor.subject = email.subject;
//   }

//   if (reply_all) {
//     let cc = email.cc?.split(",").map((r) => r.trim());
//     let bcc = email.bcc?.split(",").map((r) => r.trim());

//     if (cc?.length) {
//       recipients = recipients.filter((r) => !cc?.includes(r));
//       cc.push(...recipients);
//     } else {
//       cc = recipients;
//     }

//     editor.cc = cc ? true : false;
//     editor.bcc = bcc ? true : false;

//     editor.ccEmails = cc;
//     editor.bccEmails = bcc;
//   }

//   let repliedMessage = `<blockquote>${message}</blockquote>`;

//   editor.editor
//     .chain()
//     .clearContent()
//     .insertContent("<p>.</p>")
//     .updateAttributes("paragraph", { class: "reply-to-content" })
//     .insertContent(repliedMessage)
//     .focus("all")
//     .insertContentAt(0, { type: "paragraph" })
//     .focus("start")
//     .run();
// }
</script>

<style>
.email-content {
  max-width: 100%;
}
.email-content > * {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}
</style>
