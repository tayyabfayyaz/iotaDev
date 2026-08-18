const stars = [
  { left: "6%", top: "18%", size: 2, delay: "0s", dur: "3.4s" },
  { left: "12%", top: "64%", size: 1.5, delay: "0.6s", dur: "2.8s" },
  { left: "22%", top: "30%", size: 2, delay: "1.2s", dur: "4s" },
  { left: "30%", top: "78%", size: 1.5, delay: "0.3s", dur: "3.2s" },
  { left: "38%", top: "12%", size: 2, delay: "1.8s", dur: "3.6s" },
  { left: "46%", top: "56%", size: 1.5, delay: "0.9s", dur: "2.6s" },
  { left: "52%", top: "22%", size: 2, delay: "2.1s", dur: "4.2s" },
  { left: "58%", top: "70%", size: 1.5, delay: "0.5s", dur: "3s" },
  { left: "66%", top: "34%", size: 2, delay: "1.5s", dur: "3.8s" },
  { left: "72%", top: "14%", size: 1.5, delay: "2.4s", dur: "2.9s" },
  { left: "80%", top: "48%", size: 2, delay: "0.2s", dur: "3.3s" },
  { left: "88%", top: "66%", size: 1.5, delay: "1.1s", dur: "3.7s" },
  { left: "94%", top: "26%", size: 2, delay: "2.7s", dur: "3.1s" },
  { left: "4%", top: "42%", size: 1.5, delay: "1.7s", dur: "3.5s" },
  { left: "16%", top: "86%", size: 2, delay: "0.8s", dur: "2.7s" },
  { left: "60%", top: "88%", size: 1.5, delay: "1.9s", dur: "3.9s" },
];

export default function OrbitScene() {
  return (
    <div className="orbit-scene" aria-hidden="true">
      <div
        className="aurora"
        style={{ width: "34rem", height: "34rem", top: "-10%", left: "-8%", background: "rgba(124,108,255,0.5)" }}
      />
      <div
        className="aurora"
        style={{ width: "30rem", height: "30rem", bottom: "-12%", right: "-6%", background: "rgba(45,212,191,0.45)", animationDelay: "-8s" }}
      />

      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            ["--dur" as string]: s.dur,
            ["--delay" as string]: s.delay,
          }}
        />
      ))}

      <div className="planet-system">
        <div className="earth" />

        <div className="orbit-plane" style={{ inset: "-6%" }}>
          <div className="orbit-ring" />
          <div className="orbit-spinner" style={{ animationDuration: "16s" }}>
            <span className="orbit-star" style={{ ["--star-color" as string]: "#FF8A5C" }} />
          </div>
        </div>

        <div className="orbit-plane" style={{ inset: "-28%", animationDirection: "reverse" }}>
          <div className="orbit-ring" />
          <div className="orbit-spinner" style={{ animationDuration: "28s", animationDirection: "reverse" }}>
            <span className="orbit-star" style={{ ["--star-color" as string]: "#2DD4BF" }} />
          </div>
        </div>

        <div className="orbit-plane" style={{ inset: "-52%" }}>
          <div className="orbit-ring" />
          <div className="orbit-spinner" style={{ animationDuration: "42s" }}>
            <span className="orbit-star" style={{ ["--star-color" as string]: "#7C6CFF" }} />
            <span className="orbit-star" style={{ left: "50%", top: "auto", bottom: "-3px", ["--star-color" as string]: "#ffffff" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
