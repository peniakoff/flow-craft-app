import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

export const Icon = ({ size = 16, children, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className="icon"
    {...rest}
  >
    {children}
  </svg>
);

export default Icon;
