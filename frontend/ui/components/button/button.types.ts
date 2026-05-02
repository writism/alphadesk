export const buttonVariants = {
    primary: "bg-blue-600 text-white",
    secondary: "bg-gray-200 text-black",
    outline: "border border-gray-300 text-black",
} as const

export type ButtonVariant = keyof typeof buttonVariants
