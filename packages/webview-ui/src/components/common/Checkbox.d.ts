import React from "react";
interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}
export declare const Checkbox: React.FC<CheckboxProps>;
export {};
