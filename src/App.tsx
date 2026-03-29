import { useReducer } from "react";
import { gameReducer, initialState } from "./engine/gameReducer";
import { RunwayHeader } from "./components/RunwayHeader";
import { ScreenLayout } from "./components/ScreenLayout";
import { ScreenSplash } from "./screens/ScreenSplash";
import { ScreenMarket } from "./screens/ScreenMarket";
import { ScreenTeam } from "./screens/ScreenTeam";
import { ScreenOffice } from "./screens/ScreenOffice";
import { ScreenGrowth } from "./screens/ScreenGrowth";

const TOTAL_SCREENS = 10;

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);

  const next = () => dispatch({ type: "NEXT_SCREEN" });
  const back = () => dispatch({ type: "PREV_SCREEN" });

  const renderScreen = () => {
    switch (state.screen) {
      case 0:
        return <ScreenSplash onStart={next} />;
      case 1:
        return <ScreenMarket state={state} dispatch={dispatch} onNext={next} onBack={back} />;
      case 2:
        return <ScreenTeam state={state} dispatch={dispatch} onNext={next} onBack={back} />;
      case 3:
        return <ScreenOffice state={state} dispatch={dispatch} onNext={next} onBack={back} />;
      case 4:
        return <ScreenGrowth state={state} dispatch={dispatch} onNext={next} onBack={back} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted text-lg">screens 5-9 coming next...</p>
          </div>
        );
    }
  };

  return (
    <>
      {state.screen > 0 && state.screen < 7 && (
        <RunwayHeader state={state} currentScreen={state.screen} totalScreens={TOTAL_SCREENS} />
      )}
      <ScreenLayout screenKey={state.screen} hasHeader={state.screen > 0}>
        {renderScreen()}
      </ScreenLayout>
    </>
  );
}
