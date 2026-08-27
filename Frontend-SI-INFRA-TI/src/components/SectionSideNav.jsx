import { useEffect, useState } from "react";
import "./SectionSideNav.css";

const ACTIVE_OFFSET = 120;

function SectionSideNav({ items, onNavigate }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? null);
  const [flyoutOpen, setFlyoutOpen] = useState(false);

  useEffect(() => {
    const updateActive = () => {
      const doc = document.documentElement;
      const atBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
      const scrollPos = atBottom ? doc.scrollHeight : window.scrollY + ACTIVE_OFFSET;
      let current = items[0]?.id ?? null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPos) current = item.id;
      }
      setActiveId(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  const handleClick = (id) => {
    onNavigate?.(id);
    setFlyoutOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <nav
      className="side-nav"
      aria-label="Navegación de secciones"
      onMouseEnter={() => setFlyoutOpen(true)}
      onMouseLeave={() => setFlyoutOpen(false)}
    >
      {flyoutOpen && (
        <div className="side-nav__flyout">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`side-nav__flyout-item ${activeId === item.id ? "is-active" : ""}`}
              onClick={() => handleClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="side-nav__track">
        {items.map((item) => (
          <span
            key={item.id}
            className={`side-nav__bar ${activeId === item.id ? "is-active" : ""}`}
          />
        ))}
      </div>
    </nav>
  );
}

export default SectionSideNav;
