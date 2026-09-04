// url=https://www.figma.com/design/Xs3B8FrGigk4A5zG9FtSMz/TheCollectiveKit_V.1.13?node-id=5-157
// source=https://github.com/diveshydrix94/uicollective/blob/master/src/atoms/Link/Link.tsx
// component=Link

import figma from "figma"

const label = figma.selectedInstance.getString("Label")
const variant = figma.selectedInstance.getEnum("Type", {
  standard: "standard",
  "in-line": "inline",
})
const status = figma.selectedInstance.getEnum("State", {
  default: "default",
  information: "information",
  error: "error",
  warning: "warning",
  success: "success",
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
  true: figma.selectedInstance.getInstanceSwap("↘ Icon left")?.executeTemplate()
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
  id: "Link",
  imports: ["import { Link } from './Link';"],
  example: figma.code`<Link${figma.helpers.react.renderProp(
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
      </Link>`,
  metadata: { nestable: true },
}
