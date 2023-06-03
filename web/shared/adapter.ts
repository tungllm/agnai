import { getAdapter, getChatPreset } from '../../common/prompt'
import { presetStore, userStore } from '../store'
import { AppSchema } from '../../srv/db/schema'
import { defaultPresets } from '../../common/presets'
import { Option } from './Select'
import { ADAPTER_LABELS, AIAdapter } from '../../common/adapters'

export const AutoPreset = {
  chat: 'chat',
  service: 'horde',
}

export const BasePresetOptions: Option[] = [
  { label: 'System Built-in Preset (Horde)', value: AutoPreset.service },
]

export function getClientPreset(chat?: AppSchema.Chat) {
  const user = userStore()
  const presets = presetStore((s) => s.presets)

  if (!chat || !user.user) return

  const preset = getChatPreset(chat, user.user, presets)
  const {
    adapter,
    isThirdParty,
    model,
    contextLimit,
    preset: presetLabel,
  } = getAdapter(chat, user.user, preset)

  const name = 'name' in preset ? preset.name : ''
  return { preset, adapter, model, isThirdParty, contextLimit, presetLabel, name }
}

export function getPresetOptions(
  userPresets: AppSchema.UserGenPreset[],
  includes: { builtin?: boolean; base?: boolean }
) {
  const user = userStore((u) => u.user || { defaultPreset: '' })
  const presets = userPresets.slice().map((preset) => ({
    label: `[${getServiceName(preset.service)}, Custom] ${preset.name} ${
      user.defaultPreset === preset._id ? '(*) ' : ''
    }`,
    value: preset._id,
  }))

  const defaults = Object.entries(defaultPresets).map(([_id, preset]) => ({
    ...preset,
    _id,
    name: preset.name,
  }))

  if (includes.builtin) {
    const builtinOptions = defaults.map((preset) => ({
      label: `[${getServiceName(preset.service)}, Built-in] ${preset.name}`,
      value: preset._id,
    }))

    presets.push(...builtinOptions)
  }

  if (includes.base) presets.unshift(...BasePresetOptions)

  return presets.sort(sortByLabel)
}

export function getInitialPresetValue(chat?: AppSchema.Chat) {
  if (!chat) return AutoPreset.service
  if (!chat.genPreset && chat.genSettings) return AutoPreset.chat

  return chat.genPreset || AutoPreset.service
}

export function getServiceName(service?: AIAdapter) {
  if (!service) return 'Unset'
  return `${ADAPTER_LABELS[service]}`
}

export function sortByName(left: { name: string }, right: { name: string }) {
  return left.name.localeCompare(right.name)
}

export function sortByLabel(left: { label: string }, right: { label: string }) {
  return left.label.localeCompare(right.label)
}
