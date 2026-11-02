import { ref } from 'vue'

export const toastMessage = ref('')
let timer
export function toast(msg, ms = 3200) {
  toastMessage.value = msg
  clearTimeout(timer)
  timer = setTimeout(() => (toastMessage.value = ''), ms)
}
