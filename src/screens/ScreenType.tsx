import { ChoiceCard } from "../components/ChoiceCard";
import type { BusinessType } from "../engine/gameState";

interface Props {
  onChoose: (type: BusinessType) => void;
}

export function ScreenType({ onChoose }: Props) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-bg text-white px-6 py-12">
      <h2 className="text-3xl sm:text-4xl font-bold lowercase mb-10 text-center">
        what are you building?
      </h2>
      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChoiceCard
          icon="💼"
          title="B2B"
          subtitle="selling to companies who take 6 months to sign a contract."
          onClick={() => onChoose("b2b")}
          variant="large"
        />
        <ChoiceCard
          icon="📱"
          title="B2C"
          subtitle="selling to people who will uninstall your app in 3 days."
          onClick={() => onChoose("b2c")}
          variant="large"
        />
      </div>
    </div>
  );
}
