"use client"

import type { IconButtonProps } from "@chakra-ui/react"
import { 
  IconButton, 
  useColorMode as useChakraColorMode, 
  useColorModeValue as useChakraColorModeValue,
  ChakraProvider 
} from "@chakra-ui/react"
import * as React from "react"
import { LuMoon, LuSun } from "react-icons/lu"

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function useColorMode(): UseColorModeReturn {
  const { colorMode, toggleColorMode, setColorMode } = useChakraColorMode()
  return {
    colorMode: colorMode as ColorMode,
    setColorMode,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  return useChakraColorModeValue(light, dark)
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <LuMoon /> : <LuSun />
}

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <IconButton
      onClick={toggleColorMode}
      variant="ghost"
      aria-label="Toggle color mode"
      size="sm"
      ref={ref}
      icon={<ColorModeIcon />}
      {...props}
    />
  )
})
