import React from 'react';
import * as Icons from '@mui/icons-material';
import { Icon as MuiIcon } from '@mui/material';
import { FunctionComponent } from 'react';
import { SvgIconTypeMap } from '@mui/material';

export type IconName = keyof typeof Icons;
type SVGIconProps = SvgIconTypeMap['props'];

interface IconProps extends SVGIconProps {
  name: IconName;
  className?: string;
}

export const Icon: FunctionComponent<IconProps> = (props) => {
  const { name, className, ...restProps } = props;
  const IconComponent = Icons[name];
  if (!IconComponent) {
    console.error('Icon not found:', name);
    return <></>;
  }
  return <span className={`icon icon-${name} ${className}`}>
    <MuiIcon component={IconComponent} {...restProps} />
  </span>
};
