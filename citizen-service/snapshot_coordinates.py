from __future__ import annotations

import logging
import time

import numpy as np
import pandas as pd
import requests


def resolve_place_coordinates(
    row: pd.Series,
    *,
    resolve_coordinates: bool,
    geocode_limit: int,
    cache: dict,
    resolve_cache: dict,
    session: requests.Session,
    google_key: str | None,
    paged_addr_index: dict[str, str],
    coord_overrides: dict[str, dict],
    budget_remain: list[int],
    api_calls: int,
    log: logging.Logger,
    place_index: int,
    total_places: int,
    normalize_location_key,
    clean_optional_text,
    strict_paged_address_only_domains: set[str],
    geocode_resolve_module,
    geocode_address_simple_fn,
    county_to_latlon,
    approximate_point_estonia,
) -> dict:
    """Resolve coordinates and override outcome for a single place row."""
    loc_name = clean_optional_text(row.get("location"))
    domain = str(row["domain"])
    county = row["county"] if "county" in row.index else None
    if county is not None and isinstance(county, float) and pd.isna(county):
        county = None
    county = str(county).strip() if county else None
    site = clean_optional_text(row.get("geocode_site"))
    facility = clean_optional_text(row.get("geocode_facility"))

    lat = lon = None
    coord_source = "none"
    geocode_matched: str | None = None
    hidden = False
    overridden = False

    official_lat = row.get("official_lat") if "official_lat" in row.index else None
    official_lon = row.get("official_lon") if "official_lon" in row.index else None
    if official_lat is not None and official_lon is not None:
        try:
            f_lat, f_lon = float(official_lat), float(official_lon)
            if np.isfinite(f_lat) and np.isfinite(f_lon):
                lat, lon = f_lat, f_lon
                source = row.get("official_coord_source") if "official_coord_source" in row.index else None
                coord_source = str(source) if source is not None and pd.notna(source) else "terviseamet_official"
        except (TypeError, ValueError):
            pass

    if lat is None and resolve_coordinates:
        strict_paged_only = domain in strict_paged_address_only_domains
        paged_addr = paged_addr_index.get(normalize_location_key(loc_name, domain))
        if paged_addr:
            got = geocode_resolve_module.resolve_coordinates_cascade(
                [f"{paged_addr}, Eesti", f"{loc_name}, {paged_addr}, Eesti"],
                resolve_cache=resolve_cache,
                session=session,
                google_api_key=google_key,
                budget_remaining=budget_remain,
                log=log,
            )
            if got:
                coord_source, lat, lon, geocode_matched = got
                coord_source = f"{coord_source}_paged_address"

        if lat is None and not strict_paged_only:
            queries = geocode_resolve_module.build_geocode_queries(str(domain), loc_name, site, facility, county)
            got = geocode_resolve_module.resolve_coordinates_cascade(
                queries,
                resolve_cache=resolve_cache,
                session=session,
                google_api_key=google_key,
                budget_remaining=budget_remain,
                log=log,
            )
            if got:
                coord_source, lat, lon, geocode_matched = got
    elif lat is None:
        strict_paged_only = domain in strict_paged_address_only_domains
        paged_addr = paged_addr_index.get(normalize_location_key(loc_name, domain))
        if paged_addr:
            query = f"{paged_addr}, Eesti"
            remaining = max(0, int(geocode_limit) - api_calls)
            _, _, src_addr, new_used = geocode_address_simple_fn(
                query,
                cache,
                session,
                google_key=google_key,
                http_budget=remaining,
            )
            api_calls += new_used
            cached = cache.get(query, {})
            if cached.get("lat") is not None:
                lat, lon = float(cached["lat"]), float(cached["lon"])
                coord_source = f"{src_addr}_paged_address" if src_addr else "geocode_cache_paged_address"

        if lat is None and not strict_paged_only:
            query = f"{loc_name}, Estonia"
            needs_geo = query not in cache or cache[query].get("lat") is None
            remaining = max(0, int(geocode_limit) - api_calls)
            if needs_geo and remaining > 0:
                log.info(
                    "coords simple-mode Geocoding %s/%s для места %s/%s",
                    api_calls + 1,
                    geocode_limit,
                    place_index,
                    total_places,
                )
                _, _, _, new_used = geocode_address_simple_fn(
                    query,
                    cache,
                    session,
                    google_key=google_key,
                    http_budget=remaining,
                )
                api_calls += new_used

            cached = cache.get(query, {})
            if cached.get("lat") is not None:
                lat, lon = float(cached["lat"]), float(cached["lon"])
                coord_source = str(cached.get("coord_source") or "geocode_cache")

    if lat is None and county:
        county_latlon = county_to_latlon(str(county))
        if county_latlon:
            lat, lon = county_latlon
            coord_source = "county_centroid"

    if lat is None:
        lat, lon = approximate_point_estonia(domain, loc_name)
        coord_source = "approximate_ee"

    override_key = normalize_location_key(loc_name, domain)
    override = coord_overrides.get(override_key)
    if isinstance(override, dict):
        action = str(override.get("action") or "").strip().lower()
        if action == "hide":
            hidden = True
        elif action == "set_manual":
            try:
                override_lat = float(override.get("lat"))
                override_lon = float(override.get("lon"))
                if np.isfinite(override_lat) and np.isfinite(override_lon):
                    lat, lon = override_lat, override_lon
                    coord_source = "manual_override"
                    overridden = True
            except (TypeError, ValueError):
                log.warning("Некорректный manual override для %s/%s: %s", domain, loc_name, override)

    return {
        "loc_name": loc_name,
        "domain": domain,
        "county": county,
        "site": site,
        "facility": facility,
        "lat": lat,
        "lon": lon,
        "coord_source": coord_source,
        "geocode_matched": geocode_matched,
        "api_calls": api_calls,
        "hidden": hidden,
        "overridden": overridden,
    }


def resolve_place_county(
    *,
    county: str | None,
    lat: float,
    lon: float,
    coord_source: str,
    geocode_matched: str | None,
    extract_county_from_address,
    nearest_county_from_coords,
    validate_county_against_coords,
) -> str | None:
    """Resolve final county label from row data, matched address, and coords."""
    county_out = county.strip() if county else None
    if not county_out:
        county_from_match = extract_county_from_address(geocode_matched)
        if county_from_match:
            county_out = county_from_match
    if not county_out:
        county_from_coords = nearest_county_from_coords(lat, lon)
        if county_from_coords:
            county_out = county_from_coords

    if county_out and lat is not None and lon is not None and coord_source not in ("county_centroid", "approximate_ee", "none"):
        corrected = validate_county_against_coords(county_out, lat, lon)
        if corrected:
            county_out = corrected
    return county_out


def persist_coordinate_caches(
    *,
    resolve_coordinates: bool,
    geocode_limit: int,
    api_calls: int,
    budget_remain: list[int],
    cache: dict,
    resolve_cache: dict,
    geocode_path,
    coord_resolve_path,
    save_geocode_cache_fn,
    geocode_resolve_module,
    log: logging.Logger,
) -> None:
    """Persist geocoding caches according to the active coordinate mode."""
    if resolve_coordinates:
        geocode_resolve_module.save_resolve_cache(coord_resolve_path, resolve_cache)
        save_geocode_cache_fn(cache)
        used = max(0, geocode_limit - budget_remain[0])
        log.info(
            "Сохранены кэши координат: resolve=%s geocode=%s (HTTP каскада: %s из %s)",
            coord_resolve_path,
            geocode_path,
            used,
            geocode_limit,
        )
    elif api_calls > 0:
        save_geocode_cache_fn(cache)
        log.info("Сохранён geocode_cache: %s (HTTP: %s)", geocode_path, api_calls)


def geocode_address_simple(
    query: str,
    cache: dict,
    session: requests.Session,
    *,
    google_key: str | None,
    http_budget: int,
    geocode_resolve_module,
    log: logging.Logger,
) -> tuple[float | None, float | None, str | None, int]:
    """
    Простой режим (без --resolve-coordinates): кэш geocode_cache.json, иначе Google.
    Возвращает (lat, lon, coord_source, число_HTTP); lat/lon None при промахе.
    """
    clip = query[:88] + ("…" if len(query) > 88 else "")
    if query in cache:
        cached = cache[query]
        if cached.get("lat") is not None and cached.get("lon") is not None:
            source = str(cached.get("coord_source") or "geocode_cache")
            log.debug(
                "coords verified simple-cache lat=%.5f lon=%.5f source=%s query=%s",
                float(cached["lat"]),
                float(cached["lon"]),
                source,
                clip,
            )
            return float(cached["lat"]), float(cached["lon"]), source, 0
        if cached.get("miss"):
            return None, None, None, 0
    used = 0
    if http_budget <= 0:
        return None, None, None, 0
    if not google_key:
        log.warning("coords simple: нет GOOGLE_MAPS_GEOCODING_API_KEY — пропуск query=%s", clip)
        cache[query] = {"lat": None, "lon": None, "miss": True}
        return None, None, None, 0

    if google_key and used < http_budget:
        log.info("coords HTTP google(simple) query=%s", clip)
        time.sleep(0.15)
        used += 1
        try:
            result = geocode_resolve_module.geocode_google(query, google_key, session)
        except (requests.RequestException, ValueError, KeyError) as exc:
            log.warning("coords google(simple) error: %s", exc)
            result = None
        if result:
            cache[query] = {
                "lat": result["lat"],
                "lon": result["lon"],
                "coord_source": "google",
                "matched_address": result.get("matched_address"),
            }
            log.info(
                "coords update-cache google(simple) lat=%.5f lon=%.5f query=%s",
                float(result["lat"]),
                float(result["lon"]),
                clip,
            )
            return float(result["lat"]), float(result["lon"]), "google", used

    cache[query] = {"lat": None, "lon": None, "miss": True}
    log.info("coords miss simple (google) query=%s", clip)
    return None, None, None, used
