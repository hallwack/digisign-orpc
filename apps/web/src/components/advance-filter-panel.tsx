import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface AdvancedFilter {
  id: string;
  fieldValue: string;
  fieldLabel: string;
  operator: "contains" | "equals" | "gt" | "lt" | "gte" | "lte" | "dateRange";
  value: string;
}

interface AdvancedFilterPanelProps {
  filters: AdvancedFilter[];
  filterFields: Array<{
    value: string;
    label: string;
  }>;
  onAddFilter: (field: string) => void;
  onUpdateFilter: (id: string, updates: Partial<AdvancedFilter>) => void;
  onRemoveFilter: (id: string) => void;
  onReorderFilter: (filters: AdvancedFilter[]) => void;
  selectedField?: string;
  onFieldChange?: (field: string) => void;
}

const OPERATOR_LABELS: Record<string, string> = {
  contains: "Contains",
  equals: "Equals",
  gt: "> Greater than",
  lt: "< Less than",
  gte: "≥ Greater or equal",
  lte: "≤ Less or equal",
  dateRange: "Date range",
};

export function AdvancedFilterPanel({
  filters,
  filterFields,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
  onReorderFilter,
  selectedField = "",
  onFieldChange,
}: AdvancedFilterPanelProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === dropId) return;

    const draggedIndex = filters.findIndex((f) => f.id === draggedId);
    const dropIndex = filters.findIndex((f) => f.id === dropId);

    if (draggedIndex === -1 || dropIndex === -1) return;

    const newFilters = [...filters];
    const [draggedFilter] = newFilters.splice(draggedIndex, 1);
    newFilters.splice(dropIndex, 0, draggedFilter);

    onReorderFilter(newFilters);
    setDraggedId(null);
  };

  const moveFilter = (id: string, direction: "up" | "down") => {
    const index = filters.findIndex((f) => f.id === id);
    if (index === -1) return;

    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === filters.length - 1) return;

    const newFilters = [...filters];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newFilters[index], newFilters[targetIndex]] = [newFilters[targetIndex], newFilters[index]];

    onReorderFilter(newFilters);
  };

  return (
    <div className="border-border space-y-3 rounded-lg border p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Advanced Filters</h3>

        {/* Add Filter */}
        <div className="flex gap-2">
          <Select
            value={selectedField}
            onValueChange={(value) => {
              onFieldChange?.(value ?? "");
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {filterFields.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => onAddFilter(selectedField)} variant="outline" disabled={!selectedField}>
            Add Filter
          </Button>
        </div>

        {/* Active Filters with Drag and Drop */}
        {filters.length > 0 && (
          <div className="space-y-2 pt-2">
            {filters.map((filter, index) => (
              <div
                key={filter.id}
                draggable
                onDragStart={(e) => handleDragStart(e, filter.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, filter.id)}
                className={cn(
                  "border-border/50 bg-muted/30 flex items-center gap-2 rounded border p-2 transition-colors",
                  draggedId === filter.id && "opacity-50",
                )}
              >
                {/* Drag Handle */}
                <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab active:cursor-grabbing" />

                {/* Field Label */}
                <span className="min-w-20 shrink-0 text-sm font-medium">{filter.fieldLabel}</span>

                {/* Operator Select */}
                <Select
                  value={filter.operator}
                  onValueChange={(operator) =>
                    onUpdateFilter(filter.id, {
                      operator: operator as AdvancedFilter["operator"],
                    })
                  }
                >
                  <SelectTrigger className="w-32 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OPERATOR_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value Input */}
                <Input
                  placeholder="Filter value"
                  value={filter.value}
                  onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                  className="h-8 flex-1"
                  type={filter.operator === "dateRange" ? "date" : "text"}
                />

                {/* Move Buttons */}
                <div className="flex shrink-0 gap-1">
                  <Button
                    onClick={() => moveFilter(filter.id, "up")}
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => moveFilter(filter.id, "down")}
                    variant="ghost"
                    size="sm"
                    disabled={index === filters.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  onClick={() => onRemoveFilter(filter.id)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
