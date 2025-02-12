import { useClipboard, useDateFormat, useTimeAgo } from "@vueuse/core";
import { toast } from "frappe-ui";
import { ref, h } from "vue";
import zod from "zod";
import { gemoji } from "gemoji";
/**
 * Wrapper to create toasts, supplied with default options.
 * https://frappeui.com/components/toast.html
 * @param options - `Toast` options
 */
export function createToast(options?: Record<string, string>) {
  toast({
    position: "bottom-right",
    ...options,
  });
}

/**
 * Copy a string to clipboard, and create a toast
 * @param s - String to copy
 */
export async function copy(s: string) {
  const { copy: c } = useClipboard();
  c(s).then(() =>
    createToast({
      title: "Copied to clipboard",
      icon: "check",
      iconClasses: "text-green-600",
    })
  );
}

/**
 * Get assigned user from `_assign` string. The return value is a `string`,
 * not a `User` object.
 * @param s - `_assign` string (JSON)
 * @returns user id
 */
export function getAssign(s: string): string | undefined {
  const assignJson = JSON.parse(s);
  const arr = Array.isArray(assignJson) ? assignJson : [];
  return arr.slice(-1).pop();
}

export function validateEmail(email) {
  const regExp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regExp.test(email);
}

export function validateEmailWithZod(email: string) {
  const success = zod.string().email().safeParse(email).success;
  return success;
}

export function dateFormat(date, format) {
  const _format = format || "DD-MM-YYYY HH:mm:ss";
  return useDateFormat(date, _format).value;
}

export function timeAgo(date) {
  return useTimeAgo(date).value;
}

export const dateTooltipFormat = "ddd, MMM D, YYYY h:mm A";

export function errorMessage(title, message) {
  createToast({
    title: title || "Error",
    text: message,
    icon: "x",
    iconClasses: "text-red-600",
  });
}

export function formatTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let formattedTime = "";

  if (days > 0) {
    formattedTime += `${days}d `;
  }

  if (hours > 0 || days > 0) {
    formattedTime += `${hours}h `;
  }

  if (minutes > 0 || hours > 0 || days > 0) {
    formattedTime += `${minutes}m `;
  }

  formattedTime += `${remainingSeconds}s`;

  return formattedTime.trim();
}

function getActionsFromScript(script, obj) {
  const scriptFn = new Function(script + "\nreturn setupForm")();
  const formScript = scriptFn(obj);
  return formScript?.actions || [];
}

export function setupCustomActions(data, obj) {
  if (!data._form_script) return [];

  let actions = [];
  if (Array.isArray(data._form_script)) {
    data._form_script.forEach((script) => {
      actions = actions.concat(getActionsFromScript(script, obj));
    });
  } else {
    actions = getActionsFromScript(data._form_script, obj);
  }

  data._customActions = actions;
}

export const isCustomerPortal = ref(false);

export async function copyToClipboard(text: string, message?: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    let input = document.createElement("input");
    let body = document.querySelector("body");
    body.appendChild(input);
    input.value = text;
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  createToast({
    title: "Copied to clipboard",
    text: message,
    icon: "check",
    iconClasses: "text-green-600",
  });
}

export const textEditorMenuButtons = [
  "Paragraph",
  ["Heading 2", "Heading 3", "Heading 4", "Heading 5", "Heading 6"],
  "Separator",
  "Bold",
  "Italic",
  "Separator",
  "Bullet List",
  "Numbered List",
  "Separator",
  "Align Left",
  "Align Center",
  "Align Right",
  "FontColor",
  "Separator",
  "Image",
  "Video",
  "Link",
  "Blockquote",
  "Code",
  "Horizontal Rule",
  [
    "InsertTable",
    "AddColumnBefore",
    "AddColumnAfter",
    "DeleteColumn",
    "AddRowBefore",
    "AddRowAfter",
    "DeleteRow",
    "MergeCells",
    "SplitCell",
    "ToggleHeaderColumn",
    "ToggleHeaderRow",
    "ToggleHeaderCell",
    "DeleteTable",
  ],
];

export function isContentEmpty(content: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  return doc.body.textContent === "";
}

export function isTouchScreenDevice() {
  return "ontouchstart" in document.documentElement;
}

export function isEmoji(str) {
  const emojiList = gemoji.map((emoji) => emoji.emoji);
  return emojiList.includes(str);
}

export function getIcon(icon) {
  if (isEmoji(icon)) {
    return h("div", icon);
  }
  return icon || "align-justify";
}
