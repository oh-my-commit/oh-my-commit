declare const acquireVsCodeApi: () => { postMessage: (message: any) => void };

namespace JSX {
  interface IntrinsicElements {
    "vscode-divider": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "vscode-button": React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLElement> & {
        appearance?: "primary" | "secondary";
      },
      HTMLElement
    >;
    "vscode-text-area": React.DetailedHTMLProps<
      React.TextareaHTMLAttributes<HTMLElement> & {
        value?: string;
        onChange?: (event: any) => void;
        resize?: "vertical" | "horizontal" | "both" | "none";
        autofocus?: boolean;
      },
      HTMLElement
    >;
    "vscode-dropdown": React.DetailedHTMLProps<
      React.SelectHTMLAttributes<HTMLElement> & {
        value?: string;
        onChange?: (event: any) => void;
      },
      HTMLElement
    >;
    "vscode-option": React.DetailedHTMLProps<
      React.OptionHTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "vscode-checkbox": React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement> & {
        indeterminate?: boolean;
      },
      HTMLInputElement
    >;
    "vscode-panels": any;
    "vscode-panel-tab": any;
    "vscode-panel-view": any;
    "vscode-progress-ring": any;
    "vscode-icon": any;
  }
}
