import React from "react";
import "./InitAnimation.css";

interface InitAnimationProps {
  onEnter: () => void;
}

export const InitAnimation: React.FC<InitAnimationProps> = ({ onEnter }) => {
  return (
    <div className="init-animation-container">
      <div className="init-animation">
        <div className="logo-container">
          <svg
            className="oh-my-commits-logo"
            viewBox="0 0 200 100"
            width="128"
            height="64"
          >
            {/* 背景线条 */}
            {/* <path
              className="bg-line"
              d="M20,65 L180,65"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2,3"
              opacity="0.3"
            /> */}

            {/* Y - 简约斜线 */}
            <g className="letter-y" transform="translate(40,50)">
              <path
                d="M-10,-15 L0,5 L10,-15
                   M0,5 L0,20"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* First A - 简化三角 */}
            <g className="letter-a1" transform="translate(80,50)">
              <path
                d="M-10,20 L0,-15 L10,20
                   M-6,8 L6,8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Second A */}
            <g className="letter-a2" transform="translate(120,50)">
              <path
                d="M-10,20 L0,-15 L10,20
                   M-6,8 L6,8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* C - 优雅弧线 */}
            <g className="letter-c" transform="translate(160,50)">
              <path
                d="M12,-15 
                   A18 18 0 0 0 -8,-15
                   A22 22 0 0 0 -8,15
                   A18 18 0 0 0 12,15"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        </div>
        <div className="text-container">
          {/* <span className="app-name">Oh My Commits</span> */}
          <span className="tagline">Oh My Commits</span>
        </div>
        <button className="enter-button" onClick={onEnter}>
          <i className="codicon codicon-arrow-right" />
          Enter
        </button>
      </div>
    </div>
  );
};
