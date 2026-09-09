// theme.tsx
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "var(--font-montserrat), system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
    body: "var(--font-montserrat), system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
  },

  // Escalas de colores
  colors: {
    primary: {
      50: "#e6f4f2",
      100: "#b3e3dc",
      200: "#80d2c6",
      300: "#4dc1b0",
      400: "#1ab09a",
      500: "#018F7C", // Color base principal
      600: "#017363", // Hover
      700: "#01574b",
      800: "#003b33",
      900: "#00201b",
    },
    secondary: {
      50: "#eaeff6",
      100: "#cbd7e9",
      200: "#abbfdc",
      300: "#8ca7cf",
      400: "#6d8fc2",
      500: "#2E5796", // Color base secundario
      600: "#244578", // Hover
      700: "#1a345a",
      800: "#11223c",
      900: "#07111e",
    },
  },

  semanticTokens: {
    colors: {
      background: { default: "#f7fafc", _dark: "#1a202c" },
      primary:    { default: "primary.500", _dark: "#0c5d56" },
      navbar:     { default: "#01695bf2", _dark: "#021716" },
      rowhover:   { default: "#00000033", _dark: "#ffffff33" },
      white:      { default: "#fafafa", _dark: "#e4e4e7" },
      secondary:  { default: "secondary.500", _dark: "#173da6" }, 
      success:    { default: "#38a169", _dark: "#68d391" },
      warning:    { default: "#dd6b20", _dark: "#f6ad55" },
      danger:     { default: "#e53e3e", _dark: "#fc8181" },
      info:       { default: "#3182ce", _dark: "#63b3ed" },
      neutral:    { default: "#edf2f7", _dark: "#2d3748" },
    },
  },

  styles: {
    global: (props: any) => ({
      "html, body": {
        bg: props.colorMode === "light" ? "whiteAlpha.900" : "gray.800",
        minHeight: "100vh",
      },
    }),
  },
});

export default theme;
