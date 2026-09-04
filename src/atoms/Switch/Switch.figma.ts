// url=https://www.figma.com/design/Xs3B8FrGigk4A5zG9FtSMz/TheCollectiveKit_V.1.13?node-id=186-21228
// source=https://github.com/diveshydrix94/uicollective/blob/main/src/atoms/Switch/Switch.tsx
// component=Switch

import figma from "figma"

// Branch per variant combination.

let template
if (figma.selectedInstance.getPropertyValue("Size") === "md") {
  const label = figma.selectedInstance.getString("Label")
  const showLabel = figma.selectedInstance.getBoolean("Text", {
    true: undefined,
    false: false,
  })
  const defaultChecked = figma.selectedInstance.getEnum("State", {
    on: true,
  })
  const feedback = figma.selectedInstance.getEnum("Feedback", {
    error: "error",
  })
  const disabled = figma.selectedInstance.getEnum("Status", {
    disabled: true,
  })

  template = {
    id: "Switch",
    imports: ["import { Switch } from './Switch';"],
    example: figma.code`<Switch${figma.helpers.react.renderProp(
      "label",
      label,
    )}${figma.helpers.react.renderProp(
      "showLabel",
      showLabel,
    )}${figma.helpers.react.renderProp(
      "defaultChecked",
      defaultChecked,
    )} size="md"${figma.helpers.react.renderProp(
      "feedback",
      feedback,
    )}${figma.helpers.react.renderProp("disabled", disabled)}/>`,
    metadata: { nestable: true },
  }
} else {
  const subLabel = figma.selectedInstance.getBoolean("Sub-label", {
    true: figma.selectedInstance.getString("↘ Sub-label"),
    false: undefined,
  })
  const label = figma.selectedInstance.getString("Label")
  const showLabel = figma.selectedInstance.getBoolean("Text", {
    true: undefined,
    false: false,
  })
  const defaultChecked = figma.selectedInstance.getEnum("State", {
    on: true,
  })
  const feedback = figma.selectedInstance.getEnum("Feedback", {
    error: "error",
  })
  const disabled = figma.selectedInstance.getEnum("Status", {
    disabled: true,
  })

  template = {
    id: "Switch",
    imports: ["import { Switch } from './Switch';"],
    example: figma.code`<Switch${figma.helpers.react.renderProp(
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
    )} size="lg"${figma.helpers.react.renderProp(
      "feedback",
      feedback,
    )}${figma.helpers.react.renderProp("disabled", disabled)}/>`,
    metadata: { nestable: true },
  }
}

export default template
