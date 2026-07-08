import { describe, it, expect } from "vitest";
import { HABIT_UNITS, HABIT_UNIT_STEPS } from "./constants";

describe("HABIT_UNIT_STEPS", () => {
  it("defines a step for every supported unit", () => {
    for (const unit of HABIT_UNITS) {
      expect(HABIT_UNIT_STEPS[unit]).toBeTypeOf("number");
      expect(HABIT_UNIT_STEPS[unit]).toBeGreaterThan(0);
    }
  });

  it("uses fine-grained steps for continuous units", () => {
    // The whole point of the fix: liters must not step by 5.
    expect(HABIT_UNIT_STEPS.liters).toBe(0.1);
    expect(HABIT_UNIT_STEPS.hours).toBe(0.5);
  });

  it("uses whole-number steps for count-like units", () => {
    expect(HABIT_UNIT_STEPS.pages).toBe(1);
    expect(HABIT_UNIT_STEPS.chapters).toBe(1);
    expect(HABIT_UNIT_STEPS.workouts).toBe(1);
    expect(HABIT_UNIT_STEPS.videos).toBe(1);
    expect(HABIT_UNIT_STEPS.times).toBe(1);
  });

  it("keeps minutes at a practical step", () => {
    expect(HABIT_UNIT_STEPS.minutes).toBe(5);
  });
});
