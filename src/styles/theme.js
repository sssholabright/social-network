import { extendTheme } from "@chakra-ui/react";

const colors = {
    brand: {
        50: "#F7F8FA",
        100: "#E3E7EB",
        200: "#C8D0D8",
        300: "#A9B3C0",
        400: "#8D97A6",
        500: "#6B7684",
        600: "#4D5561",
        700: "#333D49",
        800: "#252E39",
        900: "#181F27",
    },
    accent: {
        50: "#FFE3E3",
        100: "#FFBDBD",
        200: "#FF9B9B",
        300: "#FF7979",
        400: "#FF5757",
        500: "#FF3535",
        600: "#FF1313",
        700: "#E60000",
        800: "#CC0000",
        900: "#B30000",
    }
}

const fonts = {
    body: "'Inter', sans-serif",
    heading: "'Poppins', sans-serif",
}

const components = {
    Button: {
        baseStyle: {
            fontWeight: "bold",
            borderRadius: "md",
        },
        variants: {
            solid: (props) => ({
                bg: props.colorMode === "dark" ? "brand.200" : "brand.500",
                color: props.colorMode === "dark" ? "gray.800" : "white",
                _hover: {
                    bg: props.colorMode === "dark" ? "brand.300" : "brand.600",
                },
                _active: {
                    bg: props.colorMode === "dark" ? "brand.400" : "brand.700",
                },
            }),
            outline: (props) => ({
                border: "2px solid",
                borderColor: props.colorMode === "dark" ? "brand.200" : "brand.500",
                color: props.colorMode === "dark" ? "brand.200" : "brand.500",
                _hover: {
                    bg: props.colorMode === "dark" ? "brand.800" : "brand.600",
                },
                _active: {
                    bg: props.colorMode === "dark" ? "brand.400" : "brand.700",
                },
            }),
        },
    },
    Input: {
        variants: {
            filled: (props) => ({
                field: {
                    bg: props.colorMode === "dark" ? "whiteAlpha.300" : "gray.100",
                    _hover: {
                        bg: props.colorMode === "dark" ? "whiteAlpha.400" : "gray.200",
                    },
                    _focus: {
                        bg: props.colorMode === "dark" ? "whiteAlpha.500" : "gray.300",
                    },
                },

            }),
        },
        defaultProps: {
            variant: "filled",
        },
    },
    Card: {
        baseStyle: (props) => ({
            container: {
                bg: props.colorMode === "dark" ? "gray.700" : "white",
                borderRadius: "lg",
                boxShadow: "md",
            },
        }),
    },
}

const styles = {
    global: (props) => ({
        body: {
            bg: props.colorMode === "dark" ? "gray.800" : "gray.50",
            color: props.colorMode === "dark" ? "white" : "gray.800",
        },
    }),
}

const config = {
    initialColorMode: "light",
    useSystemColorMode: true,
}

const theme = extendTheme({ colors, fonts, components, styles, config });

export default theme;