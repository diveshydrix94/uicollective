import React from 'react';
import figma from '@figma/code-connect';
import { Button } from './Button';

/**
 * Code Connect mapping for the Button component set.
 *
 * Figma: TheCollectiveKit_V.1.13 → "Button" (node 1:397)
 * https://www.figma.com/design/Xs3B8FrGigk4A5zG9FtSMz/TheCollectiveKit_V.1.13?node-id=1-397
 */
figma.connect(
  Button,
  'https://www.figma.com/design/Xs3B8FrGigk4A5zG9FtSMz/TheCollectiveKit_V.1.13?node-id=1-397',
  {
    props: {
      // Label (TEXT) → children
      label: figma.string('Label'),

      // Type (VARIANT) → variant
      variant: figma.enum('Type', {
        default: 'default',
        subtle: 'subtle',
        outline: 'outline',
        transparent: 'transparent',
      }),

      // State (VARIANT) → status (semantic color)
      status: figma.enum('State', {
        default: 'default',
        success: 'success',
        error: 'error',
        warning: 'warning',
        information: 'information',
        secondary: 'secondary',
      }),

      // Size (VARIANT) → size
      size: figma.enum('Size', {
        default: 'default',
        md: 'md',
        lg: 'lg',
      }),

      // Status (VARIANT) → disabled (only the disabled state maps to a code prop;
      // hover / focus are runtime pseudo-states, not props)
      disabled: figma.enum('Status', {
        disabled: true,
        default: false,
        hover: false,
        focus: false,
      }),

      // Icon left toggle + swap → iconLeft (undefined when the toggle is off)
      iconLeft: figma.boolean('Icon left', {
        true: figma.instance('↘Icon left'),
        false: undefined,
      }),

      // Icon right toggle + swap → iconRight
      iconRight: figma.boolean('Icon right', {
        true: figma.instance('↘ Icon right'),
        false: undefined,
      }),
    },
    example: (props) => (
      <Button
        variant={props.variant}
        status={props.status}
        size={props.size}
        disabled={props.disabled}
        iconLeft={props.iconLeft}
        iconRight={props.iconRight}
      >
        {props.label}
      </Button>
    ),
  },
);
