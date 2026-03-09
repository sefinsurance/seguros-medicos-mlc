import React, { useEffect, useState } from "react";

export default function UsStateMap(props) {
  const [MapComponent, setMapComponent] = useState(null);

  useEffect(() => {
    let mounted = true;

    import("./UsStateMapClient").then((mod) => {
      if (mounted) setMapComponent(() => mod.default);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!MapComponent) {
    return (
      <section
        className="py-12 px-4 max-w-5xl mx-auto"
        style={{ position: "relative", zIndex: 0, isolation: "isolate" }}
      >
        <div
          className="rounded-2xl overflow-hidden border border-gray-200 shadow-md flex items-center justify-center text-gray-400 text-sm"
          style={{ height: "420px", background: "#dbeafe" }}
        >
          Loading map…
        </div>
      </section>
    );
  }

  return <MapComponent {...props} />;
}
