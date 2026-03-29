import { ChoiceCard } from "../components/ChoiceCard";
import { officeChoices } from "../engine/gameData";
import type { OfficeChoice } from "../engine/gameState";

interface Props {
  onChoose: (office: OfficeChoice) => void;
}

export function ScreenOffice({ onChoose }: Props) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-bg text-white px-6 py-12">
      <h2 className="text-3xl sm:text-4xl font-bold lowercase mb-10 text-center">
        where does the magic happen?
      </h2>
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {officeChoices.map((choice) => (
          <ChoiceCard
            key={choice.id}
            icon={choice.icon}
            title={choice.title}
            subtitle={choice.subtitle}
            cost={choice.monthlyCost > 0 ? `$${choice.monthlyCost.toLocaleString()}/mo` : "free"}
            onClick={() => onChoose(choice.id)}
          />
        ))}
      </div>
    </div>
  );
}
