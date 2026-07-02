import { Sparkles } from 'lucide-react';
import Card from './Card.jsx';

const palette = ['#0f4c4a', '#3b82f6', '#22c07a', '#f9762f', '#a855f7', '#f59e0b'];

export default function SkillsCard({ skills = [] }) {
  return (
    <Card title="My Skills" icon={Sparkles}>
      {!skills.length ? (
        <p className="text-xs text-ink-500 py-6 text-center">
          No skills added yet. Ask an admin to add them from your profile.
        </p>
      ) : (
        <div className="space-y-3">
          {skills.map((s, i) => (
            <div key={s.name}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-medium text-ink-700">{s.name}</span>
                <span className="text-ink-500">{s.level}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.level}%`, backgroundColor: palette[i % palette.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
