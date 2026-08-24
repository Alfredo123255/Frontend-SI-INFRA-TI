import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { datacenters, STATUS } from "../data/datacenters";
import { IconPlus, IconMinus, IconTarget } from "./icons";
import "./WorldMap.css";

const WIDTH = 800;
const HEIGHT = 500;
const MERCATOR_SCALE = WIDTH / (2 * Math.PI);
const DEFAULT_CENTER = [0, 10];
const DEFAULT_ZOOM = 1;
const PERU_CENTER = [-74.5, -9.5];
const PERU_ZOOM = 4.2;
const MIN_ZOOM = 1;
const MAX_ZOOM = 24;

function WorldMap({ activeId, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z * 1.6).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z / 1.6).toFixed(2)));
  const recenter = () => {
    setCenter(PERU_CENTER);
    setZoom(PERU_ZOOM);
  };

  return (
    <div className="world-map">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: MERCATOR_SCALE, center: [0, 0] }}
        width={WIDTH}
        height={HEIGHT}
        preserveAspectRatio="xMidYMid slice"
        className="world-map__svg"
      >
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="var(--map-ocean)" />

        <ZoomableGroup
          center={center}
          zoom={zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onMoveEnd={({ coordinates, zoom: z }) => {
            setCenter(coordinates);
            setZoom(z);
          }}
        >
          <Graticule stroke="var(--map-grid-line)" strokeWidth={0.5} />

          <Geographies geography="/world-50m.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const isPeru = geo.properties.name === "Peru";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={`world-map__country ${isPeru ? "is-peru" : ""}`}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {datacenters.map((dc) => {
            const meta = STATUS[dc.status];
            const isActive = dc.id === activeId;
            const isHovered = dc.id === hoveredId;
            return (
              <Marker
                key={dc.id}
                coordinates={dc.coordinates}
                onMouseEnter={() => setHoveredId(dc.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(dc.id)}
                className="world-map__marker"
              >
                <g transform={`scale(${1 / zoom})`}>
                  <g className={isActive ? "dc-marker dc-marker--active" : "dc-marker"}>
                    <circle r={isActive ? 13 : 10} className="dc-marker__pulse" style={{ stroke: meta.color }} />
                    <circle r={isActive ? 6.5 : 5} className="dc-marker__dot" style={{ fill: meta.color }} />
                  </g>

                  {(isHovered || isActive) && (
                    <foreignObject x={12} y={-58} width={168} height={70} style={{ overflow: "visible" }}>
                      <div className="dc-tooltip">
                        <div className="dc-tooltip__id">{dc.id}</div>
                        <div className="dc-tooltip__name">{dc.name}</div>
                        <div className="dc-tooltip__meta">
                          <span style={{ color: meta.color }}>{meta.label}</span>
                          <span>·</span>
                          <span>{dc.servers} equipos</span>
                        </div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      <div className="world-map__controls">
        <button type="button" onClick={zoomIn} title="Acercar" aria-label="Acercar">
          <IconPlus />
        </button>
        <button type="button" onClick={zoomOut} title="Alejar" aria-label="Alejar">
          <IconMinus />
        </button>
        <button type="button" onClick={recenter} title="Centrar en Perú" aria-label="Centrar en Perú">
          <IconTarget />
        </button>
      </div>
    </div>
  );
}

export default WorldMap;
