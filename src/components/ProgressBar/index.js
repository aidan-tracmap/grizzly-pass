// @flow

import React from "react";
import type { Status } from "../../types";
import "./ProgressBar.css";

type ProgressBarProps = {
  progress: number,
  status: Status
};

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  const className = ["ProgressBar", `isStatus-${status}`];

  if (status == "ontrack" && progress >= 100) {
    className.push("isComplete");
  }

  return (
    <div className={className.join(" ")}>
      <div className="ProgressBar-text">{statusText(progress, status)}</div>
      <div className="ProgressBar-inner" style={{ width: `${progress}%` }} />
    </div>
  );
}

function statusText(progress: number, status: Status): string {

  if (progress >= 100 && status == "ontrack") return "Done";

  switch (status) {
    case "ontrack":
      return "On Track";
    case "atrisk":
      return "At Risk";
    case "intervention":
      return "Intervention Required";
    case "onhold":
      return "On Hold";
    case "blocked":
      return "Blocked";
    case "ready":
      return "Ready For Release";
    case "validation":
      return "Customer Validation";
    case "ready":
      return "Ready For Release";
    default:
      throw new Error(`Invalid status prop: ${status}`);
  }
}
