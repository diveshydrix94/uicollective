// url=https://www.figma.com/design/Xs3B8FrGigk4A5zG9FtSMz/TheCollectiveKit_V.1.13?node-id=1-397
// source=https://github.com/diveshydrix94/uicollective/blob/master/src/atoms/Button/Button.tsx
// component=Button

import figma from "figma"

const label = figma.selectedInstance.getString("Label")
const variant = figma.selectedInstance.getEnum("Type", {
  default: "default",
  subtle: "subtle",
  outline: "outline",
  transparent: "transparent",
})
const status = figma.selectedInstance.getEnum("State", {
  default: "default",
  success: "success",
  error: "error",
  warning: "warning",
  information: "information",
  secondary: "secondary",
})
const size = figma.selectedInstance.getEnum("Size", {
  default: "default",
  md: "md",
  lg: "lg",
})
const disabled = figma.selectedInstance.getEnum("Status", {
  disabled: true,
  default: false,
  hover: false,
  focus: false,
})
const iconLeft = figma.selectedInstance.getBoolean("Icon left", {
  true: figma.selectedInstance.getInstanceSwap("↘Icon left")?.executeTemplate()
    .example,
  false: undefined,
})
const iconRight = figma.selectedInstance.getBoolean("Icon right", {
  true: figma.selectedInstance
    .getInstanceSwap("↘ Icon right")
    ?.executeTemplate().example,
  false: undefined,
})

export default {
  id: "Button",
  imports: ["import { Button } from './Button';"],
  example: figma.code`<Button${figma.helpers.react.renderProp(
    "variant",
    variant,
  )}${figma.helpers.react.renderProp(
    "status",
    status,
  )}${figma.helpers.react.renderProp(
    "size",
    size,
  )}${figma.helpers.react.renderProp(
    "disabled",
    disabled,
  )}${figma.helpers.react.renderProp(
    "iconLeft",
    iconLeft,
  )}${figma.helpers.react.renderProp("iconRight", iconRight)}>
        ${figma.helpers.react.renderChildren(label)}
      </Button>`,
  metadata: { nestable: true },
}
