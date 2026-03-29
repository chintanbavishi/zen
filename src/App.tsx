import { useReducer } from "react";
import { gameReducer, initialState } from "./engine/gameReducer";
import { BurnCounter } from "./components/BurnCounter";
import { TransitionWrapper } from "./components/TransitionWrapper";
import { ScreenWire } from "./screens/ScreenWire";
import { ScreenType } from "./screens/ScreenType";
import { ScreenTeam } from "./screens/ScreenTeam";
import { ScreenOffice } from "./screens/ScreenOffice";
import { ScreenGrowth } from "./screens/ScreenGrowth";
import type { BusinessType, TeamChoice, OfficeChoice, GrowthChoice } from "./engine/gameState";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);

  const advance = () => dispatch({ type: "NEXT_SCREEN" });

  const handleType = (type: BusinessType) => {
    dispatch({ type: "SET_TYPE", payload: type });
    advance();
  };

  const handleTeam = (team: TeamChoice) => {
    dispatch({ type: "SET_TEAM", payload: team });
    advance();
  };

  const handleOffice = (office: OfficeChoice) => {
    dispatch({ type: "SET_OFFICE", payload: office });
    advance();
  };

  const handleGrowth = (growth: GrowthChoice) => {
    dispatch({ type: "SET_GROWTH", payload: growth });
    advance();
  };

  const screens = [
    <ScreenWire key="wire" onStart={advance} />,
    <ScreenType key="type" onChoose={handleType} />,
    <ScreenTeam key="team" onChoose={handleTeam} />,
    <ScreenOffice key="office" onChoose={handleOffice} />,
    <ScreenGrowth key="growth" businessType={state.businessType ?? "b2c"} onChoose={handleGrowth} />,
  ];

  return (
    <>
      <BurnCounter
        cash={state.cash}
        monthlyBurn={state.monthlyBurn}
        visible={state.screen > 0}
      />
      <TransitionWrapper screenKey={state.screen}>
        {screens[state.screen] ?? (
          <div className="text-center text-white/50">screens 6-10 coming next...</div>
        )}
      </TransitionWrapper>
    </>
  );
}
