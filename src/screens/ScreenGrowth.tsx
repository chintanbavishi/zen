import { ChoiceCard } from "../components/ChoiceCard";
import { b2cGrowthChoices, b2bGrowthChoices } from "../engine/gameData";
import type { BusinessType, GrowthChoice } from "../engine/gameState";

interface Props {
  businessType: BusinessType;
  onChoose: (growth: GrowthChoice) => void;
}

export function ScreenGrowth({ businessType, onChoose }: Props) {
  const choices = businessType === "b2b" ? b2bGrowthChoices : b2cGrowthChoices;
  const noun = businessType === "b2b" ? "customers" : "users";

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-bg text-white px-6 py-12">
      <p className="text-white/40 text-sm uppercase tracking-widest mb-3">month 2. time to grow.</p>
      <h2 className="text-3xl sm:text-4xl font-bold lowercase mb-10 text-center">
        how do you get {noun}?
      </h2>
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {choices.map((choice) => {
          let costLabel: string;
          if (choice.monthlyCost > 0) {
            costLabel = `$${choice.monthlyCost.toLocaleString()}/mo`;
          } else if (choice.oneTimeCost > 0) {
            costLabel = `$${choice.oneTimeCost.toLocaleString()} one-time`;
          } else {
            costLabel = "free";
          }
          return (
            <ChoiceCard
              key={choice.id}
              icon={choice.icon}
              title={choice.title}
              subtitle={choice.subtitle}
              cost={costLabel}
              onClick={() => onChoose(choice.id as GrowthChoice)}
            />
          );
        })}
      </div>
    </div>
  );
}
