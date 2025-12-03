import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "var(--font-montserrat), system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
    body: "var(--font-montserrat), system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
  },
  semanticTokens: {
    colors: {
      // Colores principales
      background: { default: "#f7fafc", _dark: "#1a202c" },
      primary:   { default: "#2E5796", _dark: "#0c5d56" },
      navbar:    { default: "#2E5796", _dark: "#021716" },
      rowhover:  { default: "#00000033", _dark: "#ffffff33" },
      white:     { default: "#fafafa", _dark: "#e4e4e7"},
      secondary: { default: "#018F7C", _dark: "#173da6" }, 
      success:   { default: "#38a169", _dark: "#68d391" },
      warning:   { default: "#dd6b20", _dark: "#f6ad55" },
      danger:    { default: "#e53e3e", _dark: "#fc8181" },
      info:      { default: "#3182ce", _dark: "#63b3ed" },
      neutral:   { default: "#edf2f7", _dark: "#2d3748" },
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
