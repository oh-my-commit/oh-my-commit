/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react"

import "./InitAnimation.css"

interface InitAnimationProps {
  onEnter: () => void
}

export const InitAnimation: React.FC<InitAnimationProps> = ({ onEnter }) => {
  return (
    <div className="init-animation-container">
      <div className="init-animation">
        <div className="logo-container">
          <svg className="oh-my-commit-logo" height="64" viewBox="0 0 200 100" width="128">
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
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </g>

            {/* First A - 简化三角 */}
            <g className="letter-a1" transform="translate(80,50)">
              <path
                d="M-10,20 L0,-15 L10,20
                   M-6,8 L6,8"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </g>

            {/* Second A */}
            <g className="letter-a2" transform="translate(120,50)">
              <path
                d="M-10,20 L0,-15 L10,20
                   M-6,8 L6,8"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </g>

            {/* C - 优雅弧线 */}
            <g className="letter-c" transform="translate(160,50)">
              <path
                d="M12,-15 
                   A18 18 0 0 0 -8,-15
                   A22 22 0 0 0 -8,15
                   A18 18 0 0 0 12,15"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </g>
          </svg>
        </div>
        <div className="text-container">
          {/* <span className="app-name">Oh My Commit</span> */}
          <span className="tagline">Oh My Commit</span>
        </div>
        <button className="enter-button" onClick={onEnter}>
          <i className="codicon codicon-arrow-right" />
          Enter
        </button>
      </div>
    </div>
  )
}
