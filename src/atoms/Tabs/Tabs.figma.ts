// url=https://www.figma.com/design/Xs3B8FrGigk4A5zG9FtSMz/TheCollectiveKit_V.1.13?node-id=95-830
// source=https://github.com/diveshydrix94/uicollective/blob/main/src/atoms/Tabs/Tabs.tsx
// component=Tabs

import figma from "figma"

const variant = figma.selectedInstance.getEnum("Type", {
  default: "default",
  filled: "filled",
})
const size = figma.selectedInstance.getEnum("Size", {
  default: "default",
  lg: "lg",
})
const width = figma.selectedInstance.getEnum("Width", {
  default: "default",
  wide: "wide",
})
const background = figma.selectedInstance.getEnum("Background", {
  filled: "filled",
  transparent: "transparent",
})

export default {
  id: "Tabs",
  imports: ["import { Tabs } from './Tabs';"],
  example: figma.code`<Tabs aria-label="Sections" items={[
        { value: 'overview', label: 'Overview' },
        { value: 'networth', label: 'Networth' },
        { value: 'cash-flow', label: 'Cash flow' },
    ]} defaultValue="networth"${figma.helpers.react.renderProp(
      "variant",
      variant,
    )}${figma.helpers.react.renderProp(
    "size",
    size,
  )}${figma.helpers.react.renderProp(
    "width",
    width,
  )}${figma.helpers.react.renderProp("background", background)}/>`,
  metadata: { nestable: true },
}
