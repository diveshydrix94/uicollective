// url=https://www.figma.com/design/Xs3B8FrGigk4A5zG9FtSMz/TheCollectiveKit_V.1.13?node-id=47-666
// source=https://github.com/diveshydrix94/uicollective/blob/main/src/atoms/Checkbox/Checkbox.tsx
// component=Checkbox

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
const indeterminate = figma.selectedInstance.getEnum("Type", {
  indeterminate: true,
})
const size = figma.selectedInstance.getEnum("Size", {
  lg: "lg",
  md: "md",
})
const feedback = figma.selectedInstance.getEnum("Feedback", {
  error: "error",
})
const disabled = figma.selectedInstance.getEnum("State", {
  disabled: true,
})

export default {
  id: "Checkbox",
  imports: ["import { Checkbox } from './Checkbox';"],
  example: figma.code`<Checkbox${figma.helpers.react.renderProp(
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
    "indeterminate",
    indeterminate,
  )}${figma.helpers.react.renderProp(
    "size",
    size,
  )}${figma.helpers.react.renderProp(
    "feedback",
    feedback,
  )}${figma.helpers.react.renderProp("disabled", disabled)}/>`,
  metadata: { nestable: true },
}
