import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "test-key";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.removeItem(KEY);
  });

  afterEach(() => {
    localStorage.removeItem(KEY);
  });

  it("returns initial value when key is not in localStorage", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("returns stored value when key exists", () => {
    localStorage.setItem(KEY, JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage(KEY, "initial"));
    expect(result.current[0]).toBe("stored");
  });

  it("updates value and persists to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 0));
    expect(result.current[0]).toBe(0);

    act(() => {
      result.current[1](42);
    });
    expect(result.current[0]).toBe(42);
    expect(localStorage.getItem(KEY)).toBe("42");
  });

  it("removeItem resets state to initial value (effect then syncs it to localStorage)", () => {
    localStorage.setItem(KEY, JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage(KEY, "initial"));
    expect(result.current[0]).toBe("stored");

    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe("initial");
    // Hook's useEffect syncs state to localStorage, so key ends up with initial value
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify("initial"));
  });
});
