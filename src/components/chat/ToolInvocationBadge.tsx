import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

function getFilename(path: unknown): string {
  if (typeof path !== "string" || !path) return String(path ?? "");
  return path.split(/[/\\]/).pop() ?? path;
}

function getDescription(
  toolName: string,
  args: Record<string, unknown>,
  isDone: boolean
): string {
  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const file = getFilename(args.path);

    switch (command) {
      case "create":
        return isDone ? `Created ${file}` : `Creating ${file}`;
      case "str_replace":
        return isDone ? `Updated ${file}` : `Updating ${file}`;
      case "view": {
        const hasRange =
          args.view_range != null ||
          args.start_line != null ||
          args.end_line != null;
        if (hasRange) {
          const start = (args.view_range as number[] | undefined)?.[0] ?? args.start_line;
          const end = (args.view_range as number[] | undefined)?.[1] ?? args.end_line;
          const range = start === end ? `line ${start}` : `lines ${start}–${end}`;
          return isDone ? `Read ${range} of ${file}` : `Reading ${range} of ${file}`;
        }
        return isDone ? `Read ${file}` : `Reading ${file}`;
      }
      case "insert": {
        const line = args.insert_line ?? args.line;
        return isDone
          ? `Added content to ${file} at line ${line}`
          : `Adding content to ${file} at line ${line}`;
      }
      default:
        return toolName;
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;

    switch (command) {
      case "rename": {
        const from = getFilename(args.path);
        const to = getFilename(args.new_path);
        return isDone ? `Renamed ${from} → ${to}` : `Renaming ${from} → ${to}`;
      }
      case "delete": {
        const file = getFilename(args.path);
        return isDone ? `Deleted ${file}` : `Deleting ${file}`;
      }
      default:
        return toolName;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({
  toolName,
  args,
  state,
  result,
}: ToolInvocationBadgeProps) {
  const isDone = state === "result" && result != null;
  const description = getDescription(toolName, args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{description}</span>
    </div>
  );
}
