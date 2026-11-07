import { useEffect, useId, useRef, useState } from "react";
import { SlidersHorizontal, Type } from "lucide-react";

import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useTheme } from "../../../context/ThemeContext";

import styles from "./AppearanceMenu.module.css";

function AppearanceMenu({ mobile = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();
  const { mode, textSize, setTextSize } = useTheme();
  const isLargeText = textSize === "large";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${mobile ? styles.mobile : ""}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <SlidersHorizontal aria-hidden="true" />
        <span>Appearance</span>
      </button>

      {isOpen && (
        <div
          id={menuId}
          className={styles.panel}
          role="group"
          aria-label="Appearance settings"
        >
          <div className={styles.setting}>
            <span className={styles.settingLabel}>Color mode</span>
            <div className={styles.settingControl}>
              <span className={styles.settingValue}>
                {mode === "dark" ? "Dark" : "Light"}
              </span>
              <ThemeToggle />
            </div>
          </div>

          <div className={styles.setting}>
            <span className={styles.settingLabel}>Text size</span>
            <button
              type="button"
              className={`${styles.textSizeButton} ${
                isLargeText ? styles.selected : ""
              }`}
              aria-label={isLargeText ? "Disable large text" : "Enable large text"}
              aria-pressed={isLargeText}
              onClick={() => setTextSize(isLargeText ? "normal" : "large")}
            >
              <Type aria-hidden="true" />
              <span>Large text</span>
              <span className={styles.status}>{isLargeText ? "On" : "Off"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppearanceMenu;
