import { memo } from "react";

import "./orbital-mark.css";

const ORBIT_PATH = "M 1110 258 A 520 118 0 1 1 90 258 A 520 118 0 1 1 1110 258";

/**
 * Pricing hero wordmark: official GVRZE letters with a live elliptical orbit.
 * Used only on the Pricing page — not the shared navbar mark.
 */
export const OrbitalMark = memo(function OrbitalMark() {
  return (
    <div className="pricing-orbital-mark" aria-hidden="true">
      <svg
        className="pricing-orbital-mark__svg"
        viewBox="0 0 1200 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <title>GVRZE</title>
        <g className="pricing-orbital-mark__orbit" transform="rotate(-18 600 258)">
          <path
            id="pricing-orbit-path"
            d={ORBIT_PATH}
            className="pricing-orbital-mark__path"
          />
          <circle className="pricing-orbital-mark__cap" cx="90" cy="258" r="11" />
          <circle className="pricing-orbital-mark__cap" cx="1110" cy="258" r="7.25" />
          <circle className="pricing-orbit-planet pricing-orbit-planet--live" r="6">
            <animateMotion dur="18s" repeatCount="indefinite" calcMode="linear">
              <mpath href="#pricing-orbit-path" />
            </animateMotion>
          </circle>
          <circle
            className="pricing-orbit-planet pricing-orbit-planet--static"
            cx="1072"
            cy="218"
            r="6"
          />
        </g>

        <image
          href="/assets/home/gvrze-wordmark.png"
          x="145"
          y="196"
          width="840"
          height="136"
          preserveAspectRatio="xMidYMid meet"
        />
        <text className="pricing-orbital-mark__tm" x="996" y="228">
          ™
        </text>
      </svg>
    </div>
  );
});
