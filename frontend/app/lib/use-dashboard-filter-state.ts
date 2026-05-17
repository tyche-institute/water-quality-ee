"use client";

import { useState } from "react";

export function useDashboardFilterState() {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("all");
  const [risk, setRisk] = useState("all");
  const [county, setCounty] = useState("all");
  const [official, setOfficial] = useState<"all" | "compliant" | "violation" | "unknown">("all");
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [sampleDateFrom, setSampleDateFrom] = useState("");
  const [sampleDateTo, setSampleDateTo] = useState("");
  const [minProb, setMinProb] = useState(0);
  const [minProbInput, setMinProbInput] = useState(0);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(10);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  return {
    query,
    setQuery,
    segment,
    setSegment,
    risk,
    setRisk,
    county,
    setCounty,
    official,
    setOfficial,
    alertsOnly,
    setAlertsOnly,
    sampleDateFrom,
    setSampleDateFrom,
    sampleDateTo,
    setSampleDateTo,
    minProb,
    setMinProb,
    minProbInput,
    setMinProbInput,
    nearbyOnly,
    setNearbyOnly,
    nearbyRadiusKm,
    setNearbyRadiusKm,
    userCoords,
    setUserCoords,
    geoError,
    setGeoError,
  };
}
