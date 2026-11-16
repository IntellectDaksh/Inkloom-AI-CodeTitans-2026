import { SkyClouds } from "@/components/landing/SkyClouds";
import styles from "./AuthBackdrop.module.css";

/**
 * The home page sky behind sign-in, sign-up, reset and profile setup: same gradient and drifting
 * clouds, plus soft colour glows and an animated film grain so the page doesn't feel static.
 */
export function AuthBackdrop() {
  return (
    <div className={styles.root} aria-hidden="true">
      <svg className={styles.sky} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="authSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b8fbd" />
            <stop offset=".45" stopColor="#8bbadb" />
            <stop offset=".8" stopColor="#a9d2ea" />
            <stop offset="1" stopColor="#e3f1f8" />
          </linearGradient>
          <radialGradient id="authSun" cx=".82" cy=".18" r=".55">
            <stop offset="0" stopColor="#ffe2b3" stopOpacity=".55" />
            <stop offset="1" stopColor="#ffe2b3" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#authSky)" />
        <rect width="1600" height="900" fill="url(#authSun)" />
      </svg>
      <div className={styles.clouds}>
        <SkyClouds />
      </div>
      <i className={`${styles.glow} ${styles.glowA}`} />
      <i className={`${styles.glow} ${styles.glowB}`} />
      <div className={styles.grain} />
    </div>
  );
}
