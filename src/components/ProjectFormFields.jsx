import Toggle from "./ui/Toggle";
import { inputClass, labelClass } from "./ui/formStyles";
import { cn } from "../utils/cn";

export default function ProjectFormFields({ form, set, categories }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Client</label>
          <input
            className={inputClass}
            value={form.client}
            onChange={(e) => set("client", e.target.value)}
            placeholder="Client name"
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select
            className={cn(inputClass, "appearance-none")}
            value={form.category_id}
            onChange={(e) => set("category_id", e.target.value)}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input
            type="number"
            className={inputClass}
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={cn(inputClass, "min-h-[80px] resize-y")}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What's this project about?"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Duration</label>
          <input
            className={inputClass}
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
            placeholder="2:45"
          />
        </div>

        <Toggle label="Featured" checked={form.featured} onChange={(v) => set("featured", v)} />
        <Toggle label="Published" checked={form.published} onChange={(v) => set("published", v)} />
      </div>
    </>
  );
}
