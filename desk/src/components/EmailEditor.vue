<template>
  <TextEditor
    ref="editorRef"
    :editor-class="[
      'prose-sm max-w-none mx-10 max-h-[50vh] overflow-y-auto py-3',
      true && 'min-h-[7rem]',
    ]"
    :content="newEmail"
    :starterkit-options="{ heading: { levels: [2, 3, 4, 5, 6] } }"
    :placeholder="placeholder"
    :editable="editable"
    @change="editable ? (newEmail = $event) : null"
    :extensions="[PreserveVideoControls]"
  >
    <template #top>
      <div class="mx-10 flex items-center gap-2 border-y py-2.5">
        <span class="text-xs text-gray-500">TO:</span>
        <MultiSelectInput
          v-model="toEmailsClone"
          class="flex-1"
          :validate="validateEmail"
          :error-message="(value) => `${value} is an invalid email address`"
        />
        <Button
          :label="'CC'"
          :class="[cc ? 'bg-gray-300 hover:bg-gray-200' : '']"
          @click="toggleCC()"
        />
        <Button
          :label="'BCC'"
          :class="[bcc ? 'bg-gray-300 hover:bg-gray-200' : '']"
          @click="toggleBCC()"
        />
      </div>
      <div
        v-if="showCC || cc"
        class="mx-10 flex items-center gap-2 py-2.5"
        :class="cc || showCC ? 'border-b' : ''"
      >
        <span class="text-xs text-gray-500">CC:</span>
        <MultiSelectInput
          ref="ccInput"
          v-model="ccEmailsClone"
          class="flex-1"
          :validate="validateEmail"
          :error-message="(value) => `${value} is an invalid email address`"
        />
      </div>
      <div
        v-if="showBCC || bcc"
        class="mx-10 flex items-center gap-2 py-2.5"
        :class="bcc || showBCC ? 'border-b' : ''"
      >
        <span class="text-xs text-gray-500">BCC:</span>
        <MultiSelectInput
          ref="bccInput"
          v-model="bccEmailsClone"
          class="flex-1"
          :validate="validateEmail"
          :error-message="(value) => `${value} is an invalid email address`"
        />
      </div>
    </template>
    <template #bottom>
      <div class="flex flex-wrap gap-2 px-10">
        <AttachmentItem
          v-for="a in attachments"
          :key="a.file_url"
          :label="a.file_name"
        >
          <template #suffix>
            <FeatherIcon
              class="h-3.5"
              name="x"
              @click.stop="removeAttachment(a)"
            />
          </template>
        </AttachmentItem>
      </div>
      <div class="flex justify-between gap-2 overflow-hidden px-10 py-2.5">
        <div class="flex items-center overflow-x-auto">
          <TextEditorFixedMenu class="-ml-1" :buttons="textEditorMenuButtons" />
          <div class="flex gap-1">
            <FileUploader
              :upload-args="{
                doctype: doctype,
                docname: modelValue?.name,
                private: true,
              }"
              @success="
                (f) => {
                  attachments.push(f);
                }
              "
            >
              <template #default="{ openFileSelector }">
                <Button variant="ghost" @click="openFileSelector()">
                  <template #icon>
                    <AttachmentIcon
                      class="h-4"
                      style="color: #000000; stroke-width: 1.5 !important"
                    />
                  </template>
                </Button>
              </template>
            </FileUploader>
            <Button
              variant="ghost"
              @click="showCannedResponseSelectorModal = true"
            >
              <template #icon>
                <EmailIcon
                  class="h-4"
                  style="color: #000000; stroke-width: 1.2"
                />
              </template>
            </Button>
          </div>
        </div>
        <div class="mt-2 flex items-center justify-end space-x-2 sm:mt-0">
          <Button
            label="Discard"
            @click="
              () => {
                ccEmailsClone = [];
                bccEmailsClone = [];
                cc = false;
                bcc = false;
                newEmail = null;
                attachments = null;
                emit('discard');
              }
            "
          />
          <Button
            variant="solid"
            :disabled="emailEmpty"
            :loading="loading"
            label="Submit"
            @click="
              () => {
                loading = true;
                submitMail();
              }
            "
          />
        </div>
      </div>
    </template>
  </TextEditor>
  <CannedResponseSelectorModal
    v-model="showCannedResponseSelectorModal"
    :doctype="doctype"
    @apply="applyCannedResponse"
  />
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useStorage } from "@vueuse/core";
import {
  FileUploader,
  TextEditor,
  TextEditorFixedMenu,
  createResource,
} from "frappe-ui";
import {
  createToast,
  validateEmail,
  textEditorMenuButtons,
  isContentEmpty,
} from "@/utils";
import {
  MultiSelectInput,
  AttachmentItem,
  CannedResponseSelectorModal,
} from "@/components";
import { AttachmentIcon, EmailIcon } from "@/components/icons";
import { PreserveVideoControls } from "@/tiptap-extensions";

const editorRef = ref(null);
const showCannedResponseSelectorModal = ref(false);
const loading = ref(false);

const props = defineProps({
  placeholder: {
    type: String,
    default: null,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  doctype: {
    type: String,
    default: "HD Ticket",
  },
  toEmails: {
    type: Array,
    default: () => [],
  },
  ccEmails: {
    type: Array,
    default: () => [],
  },
  bccEmails: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["submit", "discard"]);
const doc = defineModel();

const newEmail = useStorage("emailBoxContent" + doc.value.name, "");
const attachments = useStorage("emailBoxAttachments" + doc.value.name, []);
const emailEmpty = computed(() => {
  return isContentEmpty(newEmail.value);
});

const toEmailsClone = ref([...props.toEmails]);
const ccEmailsClone = ref([...props.ccEmails]);
const bccEmailsClone = ref([...props.bccEmails]);
const showCC = ref(false);
const showBCC = ref(false);
const cc = computed(() => (ccEmailsClone.value?.length ? true : false));
const bcc = computed(() => (bccEmailsClone.value?.length ? true : false));
const ccInput = ref(null);
const bccInput = ref(null);

function applyCannedResponse(template) {
  newEmail.value = template.message;
  showCannedResponseSelectorModal.value = false;
}

function submitMail() {
  if (isContentEmpty(newEmail.value)) {
    return;
  }
  if (!toEmailsClone.value.length) {
    createToast({
      text: "Please enter a recipient email address",
      icon: "x",
      iconClasses: "text-red-600",
    });
    return;
  }
  const sendMail = createResource({
    url: "run_doc_method",
    makeParams: () => ({
      dt: props.doctype,
      dn: doc.value.name,
      method: "reply_via_agent",
      args: {
        attachments: attachments.value.map((x) => x.name),
        to: toEmailsClone.value.join(","),
        cc: ccEmailsClone.value?.join(","),
        bcc: bccEmailsClone.value?.join(","),
        message: newEmail.value,
      },
    }),
    onSuccess: () => {
      resetState();
      emit("submit");
    },
    onError: (err) => {
      loading.value = false;
      createToast({
        title: err.exc_type,
        text: err.messages[0],
        icon: "x",
        iconClasses: "text-red-500",
      });
    },
  });

  sendMail.submit();
}

function toggleCC() {
  showCC.value = !showCC.value;

  showCC.value &&
    nextTick(() => {
      ccInput.value.setFocus();
    });
}

function toggleBCC() {
  showBCC.value = !showBCC.value;
  showBCC.value &&
    nextTick(() => {
      bccInput.value.setFocus();
    });
}

function removeAttachment(attachment) {
  attachments.value = attachments.value.filter((a) => a !== attachment);
}

function addToReply(
  body: string,
  toEmails: string[],
  ccEmails: string[],
  bccEmails: string[]
) {
  toEmailsClone.value = toEmails;
  ccEmailsClone.value = ccEmails;
  bccEmailsClone.value = bccEmails;
  editorRef.value.editor
    .chain()
    .clearContent()
    .insertContent(body)
    .focus("all")
    .setBlockquote()
    .insertContentAt(0, { type: "paragraph" })
    .focus("start")
    .run();
}

function resetState() {
  newEmail.value = null;
  attachments.value = null;
  loading.value = false;
}

const editor = computed(() => {
  return editorRef.value.editor;
});

defineExpose({
  addToReply,
  editor,
  submitMail,
});
</script>
