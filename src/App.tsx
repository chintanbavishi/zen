import { useReducer } from "react";
import { gameReducer, initialState } from "./engine/gameReducer";
import { RunwayHeader } from "./components/RunwayHeader";
import { ScreenLayout } from "./components/ScreenLayout";
import { ScreenSplash } from "./screens/ScreenSplash";
import { ScreenMarket } from "./screens/ScreenMarket";
import { ScreenTeam } from "./screens/ScreenTeam";
import { ScreenOffice } from "./screens/ScreenOffice";
import { ScreenGrowth } from "./screens/ScreenGrowth";
import { ScreenLifestyle } from "./screens/ScreenLifestyle";
import { ScreenCurveball } from "./screens/ScreenCurveball";
import { ScreenFastForward } from "./screens/ScreenFastForward";
import { ScreenVerdict } from "./screens/ScreenVerdict";
import { ScreenShare } from "./screens/ScreenShare";

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
      case 5:
        return <ScreenLifestyle state={state} dispatch={dispatch} onNext={next} onBack={back} />;
      case 6:
        return <ScreenCurveball state={state} dispatch={dispatch} onNext={next} onBack={back} />;
      case 7:
        return (
          <ScreenFastForward
            state={state}
            onDone={() => {
              dispatch({ type: "RUN_SIMULATION" });
              next();
            }}
          />
        );
      case 8:
        return <ScreenVerdict state={state} onContinue={next} />;
      case 9:
        return <ScreenShare state={state} onRestart={() => dispatch({ type: "RESTART" })} />;
      default:
        return null;
    }
  };

  return (
    <>
      {state.screen >= 1 && state.screen <= 6 && (
        <RunwayHeader state={state} currentScreen={state.screen} totalScreens={TOTAL_SCREENS} />
      )}
      <ScreenLayout screenKey={state.screen} hasHeader={state.screen > 0}>
        {renderScreen()}
      </ScreenLayout>
    </>
  );
}
