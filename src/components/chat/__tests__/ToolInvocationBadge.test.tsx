import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// Helpers
function badge(toolName: string, args: Record<string, unknown>, state: string, result?: unknown) {
  return render(
    <ToolInvocationBadge toolName={toolName} args={args} state={state} result={result} />
  );
}

// ── str_replace_editor: create ────────────────────────────────────────────────

test("create: in-progress text", () => {
  badge("str_replace_editor", { command: "create", path: "src/Card.jsx" }, "call");
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("create: done text", () => {
  badge("str_replace_editor", { command: "create", path: "src/Card.jsx" }, "result", {});
  expect(screen.getByText("Created Card.jsx")).toBeDefined();
});

// ── str_replace_editor: str_replace ───────────────────────────────────────────

test("str_replace: in-progress text", () => {
  badge("str_replace_editor", { command: "str_replace", path: "App.jsx" }, "call");
  expect(screen.getByText("Updating App.jsx")).toBeDefined();
});

test("str_replace: done text", () => {
  badge("str_replace_editor", { command: "str_replace", path: "App.jsx" }, "result", {});
  expect(screen.getByText("Updated App.jsx")).toBeDefined();
});

// ── str_replace_editor: view (no range) ───────────────────────────────────────

test("view no range: in-progress text", () => {
  badge("str_replace_editor", { command: "view", path: "index.ts" }, "call");
  expect(screen.getByText("Reading index.ts")).toBeDefined();
});

test("view no range: done text", () => {
  badge("str_replace_editor", { command: "view", path: "index.ts" }, "result", {});
  expect(screen.getByText("Read index.ts")).toBeDefined();
});

// ── str_replace_editor: view (with range) ─────────────────────────────────────

test("view with range: in-progress text", () => {
  badge("str_replace_editor", { command: "view", path: "utils.ts", view_range: [1, 20] }, "call");
  expect(screen.getByText("Reading lines 1–20 of utils.ts")).toBeDefined();
});

test("view with range: done text", () => {
  badge("str_replace_editor", { command: "view", path: "utils.ts", view_range: [1, 20] }, "result", {});
  expect(screen.getByText("Read lines 1–20 of utils.ts")).toBeDefined();
});

test("view with single-line range: shows 'line N'", () => {
  badge("str_replace_editor", { command: "view", path: "utils.ts", view_range: [5, 5] }, "call");
  expect(screen.getByText("Reading line 5 of utils.ts")).toBeDefined();
});

// ── str_replace_editor: insert ────────────────────────────────────────────────

test("insert: in-progress text", () => {
  badge("str_replace_editor", { command: "insert", path: "Card.jsx", insert_line: 15 }, "call");
  expect(screen.getByText("Adding content to Card.jsx at line 15")).toBeDefined();
});

test("insert: done text", () => {
  badge("str_replace_editor", { command: "insert", path: "Card.jsx", insert_line: 15 }, "result", {});
  expect(screen.getByText("Added content to Card.jsx at line 15")).toBeDefined();
});

test("insert: line 0 edge case", () => {
  badge("str_replace_editor", { command: "insert", path: "Card.jsx", insert_line: 0 }, "call");
  expect(screen.getByText("Adding content to Card.jsx at line 0")).toBeDefined();
});

// ── file_manager: rename ──────────────────────────────────────────────────────

test("rename: in-progress text", () => {
  badge("file_manager", { command: "rename", path: "Card.jsx", new_path: "CardNew.jsx" }, "call");
  expect(screen.getByText("Renaming Card.jsx → CardNew.jsx")).toBeDefined();
});

test("rename: done text", () => {
  badge("file_manager", { command: "rename", path: "Card.jsx", new_path: "CardNew.jsx" }, "result", {});
  expect(screen.getByText("Renamed Card.jsx → CardNew.jsx")).toBeDefined();
});

test("rename: extracts filename from nested path for both path and new_path", () => {
  badge("file_manager", { command: "rename", path: "src/components/Card.jsx", new_path: "src/components/CardNew.jsx" }, "call");
  expect(screen.getByText("Renaming Card.jsx → CardNew.jsx")).toBeDefined();
});

// ── file_manager: delete ──────────────────────────────────────────────────────

test("delete: in-progress text", () => {
  badge("file_manager", { command: "delete", path: "OldComponent.jsx" }, "call");
  expect(screen.getByText("Deleting OldComponent.jsx")).toBeDefined();
});

test("delete: done text", () => {
  badge("file_manager", { command: "delete", path: "OldComponent.jsx" }, "result", {});
  expect(screen.getByText("Deleted OldComponent.jsx")).toBeDefined();
});

// ── Visual: spinner vs green dot ──────────────────────────────────────────────

test("shows spinner when state=call", () => {
  const { container } = badge("str_replace_editor", { command: "create", path: "A.jsx" }, "call");
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state=result with result", () => {
  const { container } = badge("str_replace_editor", { command: "create", path: "A.jsx" }, "result", {});
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state=result but result is null", () => {
  const { container } = badge("str_replace_editor", { command: "create", path: "A.jsx" }, "result", null);
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows spinner when state=partial-call", () => {
  const { container } = badge("str_replace_editor", { command: "create", path: "A.jsx" }, "partial-call");
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});

// ── Fallback ──────────────────────────────────────────────────────────────────

test("unknown toolName renders raw name", () => {
  badge("some_unknown_tool", { command: "do_something" }, "call");
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("known tool with no command renders raw tool name", () => {
  badge("str_replace_editor", {}, "call");
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});
