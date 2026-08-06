// ======================================================
// SALARY STRUCTURE RESOLVER
//
// Resolves the "standard" (monthly) amount for each salary
// component in an employee's structure. Handles:
//   - FIXED components (amount as-is)
//   - PERCENTAGE components (round(baseStandard * pct / 100))
//   - COMPONENT base (% of a single component's standard)
//   - COMPONENTS base (% of the SUM of several components)
//   - GROSS base (% of total EARNING standard, excluding any
//     component that depends on GROSS - avoids circularity)
//   - baseCapAmount caps the base BEFORE applying the percentage
//     (works for COMPONENT, COMPONENTS and GROSS bases)
//   - per-employee overrides (employee rule wins over company rule,
//     field by field; an `amount` on a % row is a hard override)
//
// Cap/floor are NOT applied here - they clamp the payable amount
// after proration at payroll time. Use clampAmount() for previews.
// ======================================================

export type SalaryComponentLike = {
  id: number;
  type: "EARNING" | "DEDUCTION" | "EMPLOYER_CONTRIBUTION";
  prorated: boolean;
  calculationType: "FIXED" | "PERCENTAGE";
  baseType?: "COMPONENT" | "COMPONENTS" | "GROSS" | null;
  baseComponentId?: number | null;
  baseComponentIds?: number[] | null;
  percentageValue?: number | null;
  capAmount?: number | null;
  floorAmount?: number | null;
  baseCapAmount?: number | null;
};

export type SalaryStructureRow = {
  amount?: number | null;
  calculationType?: "FIXED" | "PERCENTAGE" | null;
  baseType?: "COMPONENT" | "COMPONENTS" | "GROSS" | null;
  baseComponentId?: number | null;
  baseComponentIds?: number[] | null;
  percentageValue?: number | null;
  capAmount?: number | null;
  floorAmount?: number | null;
  baseCapAmount?: number | null;
  salaryComponent: SalaryComponentLike;
};

export type ResolvedComponent = {
  componentId: number;
  type: "EARNING" | "DEDUCTION" | "EMPLOYER_CONTRIBUTION";
  prorated: boolean;
  calculationType: "FIXED" | "PERCENTAGE";
  standardAmount: number;
  capAmount: number | null;
  floorAmount: number | null;
};

type Effective = {
  calculationType: "FIXED" | "PERCENTAGE";
  baseType: "COMPONENT" | "COMPONENTS" | "GROSS" | null;
  baseComponentId: number | null;
  baseComponentIds: number[] | null;
  percentageValue: number | null;
  capAmount: number | null;
  floorAmount: number | null;
  baseCapAmount: number | null;
  amount: number | null;
};

const round = (n: number) => Math.round(n);

const capBase = (value: number, baseCapAmount: number | null) => {
  if (baseCapAmount == null) return value;
  return Math.min(value, baseCapAmount);
};

const effectiveRule = (row: SalaryStructureRow): Effective => {
  const c = row.salaryComponent;

  const rowIds = Array.isArray(row.baseComponentIds) && row.baseComponentIds.length ? row.baseComponentIds : null;
  const compIds = Array.isArray(c.baseComponentIds) && c.baseComponentIds.length ? c.baseComponentIds : null;

  return {
    calculationType:
      row.calculationType ?? c.calculationType ?? "FIXED",
    baseType: row.baseType ?? c.baseType ?? null,
    baseComponentId: row.baseComponentId ?? c.baseComponentId ?? null,
    baseComponentIds: rowIds ?? compIds ?? null,
    percentageValue: row.percentageValue ?? c.percentageValue ?? null,
    capAmount: row.capAmount ?? c.capAmount ?? null,
    floorAmount: row.floorAmount ?? c.floorAmount ?? null,
    baseCapAmount: row.baseCapAmount ?? c.baseCapAmount ?? null,
    amount: row.amount ?? null,
  };
};

export const clampAmount = (
  value: number,
  floorAmount: number | null,
  capAmount: number | null,
) => {
  let result = value;

  if (floorAmount != null) {
    result = Math.max(result, floorAmount);
  }

  if (capAmount != null) {
    result = Math.min(result, capAmount);
  }

  return result;
};

export const resolveStructureStandard = (
  rows: SalaryStructureRow[],
): ResolvedComponent[] => {
  if (!rows.length) return [];

  const byId = new Map<number, { row: SalaryStructureRow; eff: Effective }>();

  for (const row of rows) {
    const id = row.salaryComponent.id;

    if (byId.has(id)) {
      throw new Error(`Duplicate salary component in structure: ${id}`);
    }

    byId.set(id, { row, eff: effectiveRule(row) });
  }

  const result = new Map<number, ResolvedComponent>();
  const resolvedStandard = (id: number) =>
    result.get(id)?.standardAmount ?? null;

  // ======================================================
  // FIXED (and % with hard amount override) - no dependency
  // ======================================================

  const percent = new Map<number, { id: number; eff: Effective }>();

  for (const [id, { eff }] of byId) {
    if (eff.calculationType === "PERCENTAGE" && eff.amount == null) {
      if (eff.baseType == null) {
        throw new Error(
          `Percentage component ${id} requires a base (component or GROSS)`,
        );
      }

      percent.set(id, { id, eff });
      continue;
    }

    const standardAmount = eff.amount;

    if (standardAmount == null) {
      throw new Error(
        `Salary component ${id} requires an amount (fixed component)`,
      );
    }

    result.set(id, {
      componentId: id,
      type: byId.get(id)!.row.salaryComponent.type,
      prorated: byId.get(id)!.row.salaryComponent.prorated,
      calculationType: eff.calculationType,
      standardAmount: Number(standardAmount),
      capAmount: eff.capAmount,
      floorAmount: eff.floorAmount,
    });
  }

  // ======================================================
  // PERCENTAGE dependency graph
  // ======================================================

  const dependsOn = (id: number): number[] => {
    const { eff } = byId.get(id)!;

    if (eff.baseType === "COMPONENT" && eff.baseComponentId != null) {
      return [eff.baseComponentId];
    }

    if (eff.baseType === "COMPONENTS" && eff.baseComponentIds?.length) {
      return eff.baseComponentIds;
    }

    return [];
  };

  // component -> components that depend on it (reverse edges)
  const dependents = new Map<number, number[]>();

  const addEdge = (child: number, parent: number) => {
    const list = dependents.get(parent) ?? [];
    list.push(child);
    dependents.set(parent, list);
  };

  for (const id of percent.keys()) {
    const bases = dependsOn(id);

    for (const base of bases) {
      if (!byId.has(base)) {
        throw new Error(
          `Base component ${base} not found in the salary structure`,
        );
      }

      if (base === id) {
        throw new Error("Salary component cannot depend on itself");
      }

      addEdge(id, base);
    }
  }

  const isGrossDependent = new Set<number>();

  for (const [id, { eff }] of percent) {
    if (eff.baseType === "GROSS") {
      isGrossDependent.add(id);
    }
  }

  // components transitively depending on a GROSS-based component
  const queue = [...isGrossDependent];

  while (queue.length) {
    const current = queue.shift()!;
    const next = dependents.get(current) ?? [];

    for (const child of next) {
      if (!isGrossDependent.has(child)) {
        isGrossDependent.add(child);
        queue.push(child);
      }
    }
  }

  // ======================================================
  // Resolve non-GROSS-dependent % components (topo order)
  // ======================================================

  const topoOrder = (nodes: number[]): number[] => {
    const visited = new Set<number>();
    const visiting = new Set<number>();
    const order: number[] = [];

    const visit = (id: number) => {
      if (visited.has(id)) return;

      if (visiting.has(id)) {
        throw new Error("Circular percentage dependency detected");
      }

      visiting.add(id);

      for (const base of dependsOn(id)) {
        visit(base);
      }

      visiting.delete(id);
      visited.add(id);
      order.push(id);
    };

    for (const id of nodes) visit(id);

    return order;
  };

  const nonGrossPercent = [...percent.keys()].filter(
    (id) => !isGrossDependent.has(id),
  );

  const computeBaseStandard = (
    eff: Effective,
    gross: number | null = null,
  ): number => {
    if (eff.baseType === "GROSS") {
      if (gross == null) {
        throw new Error("GROSS base requested before gross is resolved");
      }

      return gross;
    }

    if (eff.baseType === "COMPONENT") {
      const baseStandard = resolvedStandard(eff.baseComponentId!);

      if (baseStandard == null) {
        throw new Error(`Base amount for component could not be resolved`);
      }

      return baseStandard;
    }

    if (eff.baseType === "COMPONENTS") {
      const ids = eff.baseComponentIds ?? [];

      if (!ids.length) {
        throw new Error(
          `COMPONENTS base requires at least one base component`,
        );
      }

      let sum = 0;

      for (const id of ids) {
        const baseStandard = resolvedStandard(id);

        if (baseStandard == null) {
          throw new Error(`Base amount for component could not be resolved`);
        }

        sum += baseStandard;
      }

      return sum;
    }

    throw new Error(`Unsupported base type: ${eff.baseType}`);
  };

  for (const id of topoOrder(nonGrossPercent)) {
    if (!percent.has(id)) continue;

    const { eff } = byId.get(id)!;

    if (eff.percentageValue == null) {
      throw new Error(`Percentage value required for component ${id}`);
    }

    const baseStandard = capBase(
      computeBaseStandard(eff),
      eff.baseCapAmount,
    );

    const standardAmount = round(baseStandard * (eff.percentageValue / 100));

    result.set(id, {
      componentId: id,
      type: byId.get(id)!.row.salaryComponent.type,
      prorated: byId.get(id)!.row.salaryComponent.prorated,
      calculationType: "PERCENTAGE",
      standardAmount,
      capAmount: eff.capAmount,
      floorAmount: eff.floorAmount,
    });
  }

  // ======================================================
  // GROSS pseudo-base
  // ======================================================

  const gross = [...result.values()]
    .filter(
      (c) =>
        c.type === "EARNING" && !isGrossDependent.has(c.componentId),
    )
    .reduce((sum, c) => sum + c.standardAmount, 0);

  for (const id of topoOrder([...isGrossDependent])) {
    const { eff } = byId.get(id)!;

    if (eff.percentageValue == null) {
      throw new Error(`Percentage value required for component ${id}`);
    }

    const baseStandard = capBase(
      computeBaseStandard(eff, gross),
      eff.baseCapAmount,
    );

    const standardAmount = round(baseStandard * (eff.percentageValue / 100));

    result.set(id, {
      componentId: id,
      type: byId.get(id)!.row.salaryComponent.type,
      prorated: byId.get(id)!.row.salaryComponent.prorated,
      calculationType: "PERCENTAGE",
      standardAmount,
      capAmount: eff.capAmount,
      floorAmount: eff.floorAmount,
    });
  }

  return [...result.values()];
};
