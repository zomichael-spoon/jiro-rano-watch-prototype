"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Report, CutType } from "@/lib/jiro-data";

// ── Fix Leaflet default icon paths broken by bundlers ──────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Madagascar geographic bounds ───────────────────────────────────────────
// SW: -25.6, 43.2  |  NE: -11.9, 50.5
const MADAGASCAR_BOUNDS = L.latLngBounds(
  L.latLng(-25.6, 43.2),
  L.latLng(-11.9, 50.5),
);

// Center on Antananarivo
const TANA_CENTER: L.LatLngTuple = [-18.9101, 47.5362];
const INITIAL_ZOOM = 13;

// ── Marker color map ───────────────────────────────────────────────────────
const MARKER_COLORS: Record<CutType, { fill: string; stroke: string }> = {
  power:    { fill: "#f59e0b", stroke: "#d97706" },
  water:    { fill: "#3b82f6", stroke: "#2563eb" },
  dirty:    { fill: "#c2410c", stroke: "#9a3412" },
  fuel:     { fill: "#f97316", stroke: "#ea580c" },
  road:     { fill: "#8b5cf6", stroke: "#7c3aed" },
  internet: { fill: "#06b6d4", stroke: "#0891b2" },
  restored: { fill: "#10b981", stroke: "#059669" },
};

function makeIcon(type: CutType, isActive: boolean): L.DivIcon {
  const { fill, stroke } = MARKER_COLORS[type];
  const pulse = isActive
    ? `<circle cx="12" cy="12" r="14" fill="${fill}" opacity="0.2">
         <animate attributeName="r" from="10" to="20" dur="1.5s" repeatCount="indefinite"/>
         <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite"/>
       </circle>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    ${pulse}
    <circle cx="12" cy="12" r="9" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

interface Props {
  reports: Report[];
  onMarkerClick: (report: Report) => void;
}

export default function LeafletMap({ reports, onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const layerRef     = useRef<L.LayerGroup | null>(null);

  // ── Initialize map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: TANA_CENTER,
      zoom: INITIAL_ZOOM,
      minZoom: 5,
      maxZoom: 18,
      maxBounds: MADAGASCAR_BOUNDS,
      maxBoundsViscosity: 0.85,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark tile layer (CartoDB Dark Matter)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // ── Sync markers when reports change ──────────────────────────────────────
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    layer.clearLayers();

    reports.forEach((report) => {
      const icon = makeIcon(report.type, report.is_active ?? true);
      const marker = L.marker([report.lat, report.lng], { icon });
      marker.on("click", () => onMarkerClick(report));
      marker.addTo(layer);
    });
  }, [reports, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ background: "#0f1117" }}
    />
  );
}
