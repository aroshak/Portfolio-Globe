import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > Math.max(620, window.innerHeight * .72));
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <button
    type="button"
    className={`back-to-top ${visible ? "is-visible" : ""}`}
    aria-label="Back to top"
    title="Back to top"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  >
    <span>TOP</span><ArrowUp size={13}/>
  </button>;
}
