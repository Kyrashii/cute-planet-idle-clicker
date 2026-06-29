import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RogueliteScreen } from "./RogueliteScreen";
import { createNewRun, createRogueliteMetaState } from "../../roguelite/engine";

const COACH_SEEN_KEY = "cute_planet_roguelite_coach_seen";

function makeProps() {
  return {
    isOpen: true,
    viewState: "run" as const,
    meta: createRogueliteMetaState(),
    onClose: vi.fn(),
    onBeginRunSetup: vi.fn(),
    onBackToIntro: vi.fn(),
    onOpenArchive: vi.fn(),
    onCloseArchive: vi.fn(),
    onStartRun: vi.fn(),
    onChooseEncounter: vi.fn(),
    onChoosePath: vi.fn(),
    onRerollEncounter: vi.fn(),
    onClaimVictory: vi.fn(),
    onClaimDefeat: vi.fn(),
  };
}

describe("RogueliteScreen", () => {
  // Most tests assume a returning player so the first-run coach doesn't cover the
  // run targets; the dedicated coach test clears this.
  beforeEach(() => {
    window.localStorage.setItem(COACH_SEEN_KEY, "1");
  });

  it("renders the victory results with chest, rewards, and a relic pick", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    let activeRun = createNewRun(props.meta, props.meta.unlockedRelics.slice(0, 2), 42);
    activeRun = {
      ...activeRun,
      phase: "victory_rewards",
      status: "won",
      completedStations: 30,
      rewardPackage: {
        shards: 5,
        glitterDust: 44,
        relicChoiceIds: ["nebelglas", "mondfaden", "sternennaht"],
        victoryType: "normal",
        rewardLabel: "Boss gefallen",
      },
    };

    render(<RogueliteScreen {...props} activeRun={activeRun} />);

    expect(screen.getByText(/sieg!/i)).toBeInTheDocument();
    expect(screen.getByText(/boss gefallen/i)).toBeInTheDocument();
    expect(screen.getByAltText("Roguelite Siegestruhe")).toBeInTheDocument();
    expect(screen.getByText(/reliktwahl/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /nebelglas/i }));
    await user.click(screen.getByRole("button", { name: /belohnungen sichern/i }));

    expect(props.onClaimVictory).toHaveBeenCalledWith("nebelglas");
  });

  it("renders the defeat results with the consolation chest", () => {
    const props = makeProps();
    let activeRun = createNewRun(props.meta, props.meta.unlockedRelics.slice(0, 2), 99);
    activeRun = {
      ...activeRun,
      phase: "defeat",
      status: "lost",
      completedStations: 20,
      currentEncounter: null,
    };

    render(<RogueliteScreen {...props} activeRun={activeRun} />);

    expect(screen.getByText(/niederlage/i)).toBeInTheDocument();
    expect(screen.getByText(/tiefe trosttruhe/i)).toBeInTheDocument();
    expect(screen.getByAltText("Roguelite Trosttruhe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /trostbelohnung einsammeln/i })).toBeInTheDocument();
  });

  it("opens on the intro step and only starts setup after the start button", async () => {
    const user = userEvent.setup();
    const props = { ...makeProps(), viewState: "intro" as const, activeRun: null };

    render(<RogueliteScreen {...props} />);

    expect(screen.getByText(/30 Stationen\. 3 Akte\./i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^start$/i }));
    expect(props.onBeginRunSetup).toHaveBeenCalled();
  });

  it("allows a player with two unlocked relics to start the run", async () => {
    const user = userEvent.setup();
    const props = { ...makeProps(), viewState: "relic_select" as const, activeRun: null };
    props.meta.unlockedRelics = ["kometenherz", "pfotenkompass"];

    render(<RogueliteScreen {...props} />);

    expect(screen.getByText(/waehle bis zu 3 start-relikte/i)).toBeInTheDocument();
    const startButton = screen.getByRole("button", { name: /run starten/i });
    expect(startButton).toBeEnabled();

    await user.click(startButton);

    expect(props.onStartRun).toHaveBeenCalledWith(["kometenherz", "pfotenkompass"]);
  });

  it("allows a player with one unlocked relic to start the run", async () => {
    const user = userEvent.setup();
    const props = { ...makeProps(), viewState: "relic_select" as const, activeRun: null };
    props.meta.unlockedRelics = ["kometenherz"];

    render(<RogueliteScreen {...props} />);

    const startButton = screen.getByRole("button", { name: /run starten/i });
    expect(startButton).toBeEnabled();

    await user.click(startButton);

    expect(props.onStartRun).toHaveBeenCalledWith(["kometenherz"]);
  });

  it("shows a visible recovery state instead of a blank stage when the encounter is missing", () => {
    const props = makeProps();
    let activeRun = createNewRun(props.meta, props.meta.unlockedRelics.slice(0, 2), 123);
    activeRun = {
      ...activeRun,
      phase: "node",
      currentEncounter: null,
    };

    render(<RogueliteScreen {...props} activeRun={activeRun} />);

    expect(screen.getByText(/run wird vorbereitet/i)).toBeInTheDocument();
    expect(screen.getByText(/phase: node/i)).toBeInTheDocument();
    expect(screen.getByText(/akt 1 von 3/i)).toBeInTheDocument();
  });

  it("shows a preparing state when the run view mounts before a run object exists", () => {
    const props = { ...makeProps(), activeRun: null };

    render(<RogueliteScreen {...props} />);

    expect(screen.getByText(/run wird vorbereitet/i)).toBeInTheDocument();
  });

  it("leads with the decision prompt and tucks detail stats into the details panel", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    const activeRun = createNewRun(props.meta, props.meta.unlockedRelics.slice(0, 2), 444);

    render(<RogueliteScreen {...props} activeRun={activeRun} />);

    // The action prompt is the prominent heading (the only h3) and the choices
    // are the focal targets.
    const prompt = screen.getByRole("heading", { level: 3 });
    expect(prompt.textContent).toMatch(/wähle|stelle|kaufe|opfern|forme|triff|reite|öffne|lies/i);
    expect(screen.getByText(/akt 1 von 3/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(activeRun.currentEncounter!.choices[0]!.title, "i"),
      }),
    ).toBeInTheDocument();

    // Detail stats live behind the details toggle, not on the main screen.
    expect(screen.queryByText("Klicks")).not.toBeInTheDocument();
    expect(screen.queryByTestId("roguelite-run-info-panel")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("roguelite-drawer-toggle"));

    expect(screen.getByTestId("roguelite-run-info-panel")).toBeInTheDocument();
    expect(screen.getByText("Klicks")).toBeInTheDocument();
    expect(screen.getAllByText(/werte/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/bossblick/i).length).toBeGreaterThan(0);

    await user.click(screen.getByTestId("roguelite-drawer-toggle"));

    await waitFor(() => {
      expect(screen.queryByTestId("roguelite-run-info-panel")).not.toBeInTheDocument();
    });
  });

  it("shows the first-run coach on a fresh profile and dismisses it", async () => {
    const user = userEvent.setup();
    window.localStorage.removeItem(COACH_SEEN_KEY);
    const props = makeProps();
    const activeRun = createNewRun(props.meta, props.meta.unlockedRelics.slice(0, 2), 7);

    render(<RogueliteScreen {...props} activeRun={activeRun} />);

    expect(screen.getByTestId("roguelite-coach")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /berspringen/i }));

    await waitFor(() => {
      expect(screen.queryByTestId("roguelite-coach")).not.toBeInTheDocument();
    });
  });

  it("opens the help legend from the shell header", async () => {
    const user = userEvent.setup();
    const props = { ...makeProps(), viewState: "intro" as const, activeRun: null };

    render(<RogueliteScreen {...props} />);

    await user.click(screen.getByTestId("roguelite-help-button"));

    expect(screen.getByText(/hilfe & legende/i)).toBeInTheDocument();
    expect(screen.getByText(/so läuft ein run/i)).toBeInTheDocument();
  });

  it("hides the details toggle in victory and defeat results", () => {
    const props = makeProps();
    let victoryRun = createNewRun(props.meta, props.meta.unlockedRelics.slice(0, 2), 17);
    victoryRun = {
      ...victoryRun,
      phase: "victory_rewards",
      status: "won",
      completedStations: 30,
      rewardPackage: {
        shards: 5,
        glitterDust: 44,
        relicChoiceIds: ["nebelglas", "mondfaden", "sternennaht"],
        victoryType: "normal",
        rewardLabel: "Boss gefallen",
      },
    };

    const { rerender } = render(<RogueliteScreen {...props} activeRun={victoryRun} />);

    expect(screen.queryByTestId("roguelite-drawer-toggle")).not.toBeInTheDocument();

    let defeatRun = createNewRun(props.meta, props.meta.unlockedRelics.slice(0, 2), 18);
    defeatRun = {
      ...defeatRun,
      phase: "defeat",
      status: "lost",
      completedStations: 20,
      currentEncounter: null,
    };

    rerender(<RogueliteScreen {...props} activeRun={defeatRun} />);

    expect(screen.queryByTestId("roguelite-drawer-toggle")).not.toBeInTheDocument();
  });
});
