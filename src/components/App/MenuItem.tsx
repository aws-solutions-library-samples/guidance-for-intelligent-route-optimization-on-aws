import React from "react";
import { Link } from "react-router-dom";
import { Flex, Link as UiLink } from "@aws-amplify/ui-react";

type MenuItemProps = {
  children?: React.ReactNode;
  total: number;
  to: string;
  label: string;
};

const MenuItem: React.FC<MenuItemProps> = ({ total, to, label }) => {
  return (
    <Flex
      alignItems="center"
      justifyContent={total === 1 ? "flex-start" : "center"}
      width={`calc(100% / ${total})`}
    >
      <UiLink as={Link} to={to} color="inherit" fontWeight="bold">
        {label}
      </UiLink>
    </Flex>
  );
};

export default MenuItem;
export type { MenuItemProps };
