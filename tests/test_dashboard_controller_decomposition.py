from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_controller_uses_domain_input_builders() -> None:
    controller = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller.ts").read_text(encoding="utf-8")
    assert 'from "./dashboard-controller-frame"' in controller
    assert 'from "./dashboard-controller-view-model"' in controller
    assert 'from "./dashboard-controller-main-content-input"' in controller
    assert 'from "./dashboard-controller-overlay-input"' in controller
    assert 'from "./dashboard-controller-top-chrome-input"' in controller
    assert "const frame = buildDashboardControllerFrame(state, runtime)" in controller
    assert "...frame" in controller
    assert "return buildDashboardControllerViewModel({" in controller
    assert "overlay: buildOverlayInput(snapshot, state, runtime)" in controller
    assert "topChrome: buildTopChromeInput(state, runtime)" in controller
    assert "mainContent: buildMainContentInput(snapshot, state, runtime)" in controller


def test_controller_entrypoint_stays_small() -> None:
    controller_lines = (
        ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller.ts"
    ).read_text(encoding="utf-8").splitlines()
    assert len(controller_lines) <= 40


def test_bootstrap_entrypoint_stays_small() -> None:
    bootstrap_lines = (
        ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-bootstrap.ts"
    ).read_text(encoding="utf-8").splitlines()
    assert len(bootstrap_lines) <= 35


def test_controller_typing_monolith_does_not_return() -> None:
    assert not (ROOT / "frontend" / "app" / "lib" / "dashboard-controller-props.ts").exists()


def test_controller_types_are_split_by_domain() -> None:
    expected = [
        "dashboard-controller-component-props.ts",
        "dashboard-controller-overlay-types.ts",
        "dashboard-controller-top-chrome-types.ts",
        "dashboard-controller-main-content-types.ts",
        "dashboard-controller-view-model-types.ts",
        "dashboard-controller-classname.ts",
        "use-dashboard-controller-frame-state.ts",
        "use-dashboard-controller-filter-state.ts",
        "use-dashboard-controller-selection-state.ts",
        "use-dashboard-controller-info-state.ts",
        "use-dashboard-controller-preferences-state.ts",
        "use-dashboard-controller-scene-state.ts",
        "use-dashboard-controller-trust-runtime.ts",
        "use-dashboard-controller-actions-runtime.ts",
        "use-dashboard-controller-interaction-runtime.ts",
        "use-dashboard-controller-collections-runtime.ts",
    ]
    for file_name in expected:
        assert (ROOT / "frontend" / "app" / "lib" / file_name).is_file(), file_name


def test_view_model_layer_uses_builder_naming() -> None:
    view_model = (ROOT / "frontend" / "app" / "lib" / "dashboard-controller-view-model.ts").read_text(encoding="utf-8")
    assert "export function buildDashboardControllerViewModel(" in view_model
    assert "export function useDashboardControllerViewModel(" not in view_model


def test_bootstrap_uses_frame_state_hook() -> None:
    bootstrap = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-bootstrap.ts").read_text(encoding="utf-8")
    assert 'from "./use-dashboard-controller-frame-state"' in bootstrap
    assert "const frameState = useDashboardControllerFrameState()" in bootstrap
    assert "...frameState" in bootstrap


def test_bootstrap_uses_selection_state_hook() -> None:
    bootstrap = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-bootstrap.ts").read_text(encoding="utf-8")
    assert 'from "./use-dashboard-controller-selection-state"' in bootstrap
    assert "const selectionState = useDashboardControllerSelectionState()" in bootstrap
    assert "...selectionState" in bootstrap


def test_bootstrap_uses_filter_state_hook() -> None:
    bootstrap = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-bootstrap.ts").read_text(encoding="utf-8")
    assert 'from "./use-dashboard-controller-filter-state"' in bootstrap
    assert "const filterState = useDashboardControllerFilterState()" in bootstrap
    assert "...filterState" in bootstrap


def test_bootstrap_uses_info_state_hook() -> None:
    bootstrap = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-bootstrap.ts").read_text(encoding="utf-8")
    assert 'from "./use-dashboard-controller-info-state"' in bootstrap
    assert "const infoState = useDashboardControllerInfoState()" in bootstrap
    assert "...infoState" in bootstrap


def test_bootstrap_uses_preferences_state_hook() -> None:
    bootstrap = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-bootstrap.ts").read_text(encoding="utf-8")
    assert 'from "./use-dashboard-controller-preferences-state"' in bootstrap
    assert "const preferencesState = useDashboardControllerPreferencesState()" in bootstrap
    assert "...preferencesState" in bootstrap


def test_bootstrap_is_composition_only() -> None:
    bootstrap = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-bootstrap.ts").read_text(encoding="utf-8")
    assert "useDashboardPreferences()" not in bootstrap
    assert "useDashboardInfo()" not in bootstrap
    assert "useDashboardFilterState()" not in bootstrap
    assert "useSelectedPlaceUrl()" not in bootstrap
    assert "useDashboardWatchlist()" not in bootstrap


def test_runtime_uses_scene_trust_and_actions_subhooks() -> None:
    runtime = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-runtime.ts").read_text(encoding="utf-8")
    assert 'from "./use-dashboard-controller-scene-state"' in runtime
    assert 'from "./use-dashboard-controller-interaction-runtime"' in runtime
    assert 'from "./use-dashboard-controller-collections-runtime"' in runtime
    assert 'from "./dashboard-controller-runtime-output"' in runtime
    assert "const scene = useDashboardControllerSceneState(snapshot, state)" in runtime
    assert "useDashboardControllerInteractionRuntime(snapshot, state, scene)" in runtime
    assert "useDashboardControllerCollectionsRuntime(snapshot, state, scene" in runtime
    assert "return buildDashboardControllerRuntimeOutput({" in runtime


def test_collections_runtime_composes_derived_filter_and_analytics() -> None:
    collections = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-collections-runtime.ts").read_text(encoding="utf-8")
    assert 'from "./use-dashboard-derived-data"' in collections
    assert 'from "./use-dashboard-controller-filter-runtime"' in collections
    assert 'from "./use-dashboard-controller-analytics-runtime"' in collections
    assert "const derived = useDashboardDerivedData({" in collections
    assert "const filter = useDashboardControllerFilterRuntime(snapshot, state, scene)" in collections
    assert "const analytics = useDashboardControllerAnalyticsRuntime(snapshot, state" in collections


def test_interaction_runtime_composes_trust_actions_and_history_measurements() -> None:
    interaction = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-controller-interaction-runtime.ts").read_text(encoding="utf-8")
    assert 'from "./dashboard-explainers"' in interaction
    assert 'from "./dashboard-utils"' in interaction
    assert 'from "./use-dashboard-controller-trust-runtime"' in interaction
    assert 'from "./use-dashboard-controller-actions-runtime"' in interaction
    assert "const historyMeasurements =" in interaction
    assert "const trust = useDashboardControllerTrustRuntime(snapshot, state, historyMeasurements" in interaction
    assert "const actions = useDashboardControllerActionsRuntime(snapshot, state, scene" in interaction


def test_view_model_uses_extracted_input_type() -> None:
    view_model = (ROOT / "frontend" / "app" / "lib" / "dashboard-controller-view-model.ts").read_text(encoding="utf-8")
    assert 'from "./dashboard-controller-view-model-types"' in view_model
    assert "DashboardControllerViewModelInput" in view_model
    assert 'from "./dashboard-controller-classname"' in view_model
    assert "buildDashboardClassName(isMobile, sidebarCollapsed)" in view_model
