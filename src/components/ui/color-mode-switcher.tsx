// components/ui/color-mode-switcher.tsx
"use client";

import { IconButton, Tooltip, useColorMode } from "@chakra-ui/react";
import { FaSun, FaMoon } from "react-icons/fa";

export const ColorModeSwitcher = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Tooltip label={`Activar modo ${colorMode === "light" ? "oscuro" : "claro"}`}>
      <IconButton
        aria-label="Alternar modo de color"
        icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
        onClick={toggleColorMode}
        size="lg"
        variant="ghost"
        color="current"
      />
    </Tooltip>
  );
};