import { Item, Spell } from "@/components/types/types";

export default function Score({ hitCounts }: { hitCounts: number[] }) {
    const sum = hitCounts.reduce((sum, hit) => sum + hit);
    return (
        <div className="absolute top-0 flex gap-10 px-16 py-7 bg-[#6d6d6d85] rounded-b-3xl">
            {hitCounts.map((hitCount, index) => (
                <div key={index}>
                    <div>
                        <p className="font-extrabold text-4xl text-white">
                            {sum - hitCount}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
