import React from "react"
import { buttonVariants, ButtonVariant } from "./button.types"

interface ButtonProps {
    label: string
    onClick: () => void
    variant?: ButtonVariant
    className?: string
}

const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    variant = "primary",
    className = "",
}) => {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 rounded font-bold w-64 hover:opacity-90 transition ${buttonVariants[variant]} ${className}`}
        >
            {label}
        </button>
    )
}

export default Button
