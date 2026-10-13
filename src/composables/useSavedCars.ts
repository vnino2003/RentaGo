import { ref, watch } from 'vue'
function load(): string[] {
  try { const value: unknown = JSON.parse(localStorage.getItem('rentago-saved') || '[]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [] } catch { return [] }
}
const saved = ref<string[]>(load())
watch(saved, value => { try { localStorage.setItem('rentago-saved', JSON.stringify(value)) } catch { /* Saving remains available for this session. */ } }, { deep: true })
export function useSavedCars() {
  function toggle(id: string) { saved.value = saved.value.includes(id) ? saved.value.filter(item => item !== id) : [...saved.value, id] }
  return { saved, toggle }
}
