// url=https://www.figma.com/design/Xs3B8FrGigk4A5zG9FtSMz/TheCollectiveKit_V.1.13?node-id=47-2415
// source=https://github.com/diveshydrix94/uicollective/blob/main/src/atoms/Radio/Radio.tsx
// component=Radio

import figma from "figma"

const label = figma.selectedInstance.getString("Label")
const subLabel = figma.selectedInstance.getBoolean("Subtext", {
  true: figma.selectedInstance.getString("↘ Subtext"),
  false: undefined,
})
const showLabel = figma.selectedInstance.getBoolean("Content", {
  true: undefined,
  false: false,
})
const defaultChecked = figma.selectedInstance.getEnum("Type", {
  selected: true,
})
const size = figma.selectedInstance.getEnum("Size", {
  lg: "lg",
  md: "md",
})
const feedback = figma.selectedInstance.getEnum("State", {
  error: "error",
})
const disabled = figma.selectedInstance.getEnum("Status", {
  disabled: true,
})

export default {
  id: "Radio",
  imports: ["import { Radio } from './Radio';"],
  example: figma.code`<Radio${figma.helpers.react.renderProp(
    "label",
    label,
  )}${figma.helpers.react.renderProp(
    "subLabel",
    subLabel,
  )}${figma.helpers.react.renderProp(
    "showLabel",
    showLabel,
  )}${figma.helpers.react.renderProp(
    "defaultChecked",
    defaultChecked,
  )}${figma.helpers.react.renderProp(
    "size",
    size,
  )}${figma.helpers.react.renderProp(
    "feedback",
    feedback,
  )}${figma.helpers.react.renderProp("disabled", disabled)}/>`,
  metadata: { nestable: true },
}
