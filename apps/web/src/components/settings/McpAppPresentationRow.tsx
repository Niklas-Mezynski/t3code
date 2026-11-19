import { McpAppPresentation } from "@t3tools/contracts";
import {
  setMcpAppServerPresentation,
  withoutMcpAppServerPresentation,
} from "@t3tools/shared/mcpApp";
import * as Schema from "effect/Schema";
import { msg, useGT, useMessages } from "gt-react";
import { XIcon } from "lucide-react";

import { updateClientSettings, useClientSettings } from "../../hooks/useSettings";
import { Button } from "../ui/button";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "../ui/select";
import { SettingResetButton, SettingsRow } from "./settingsLayout";
import { useSearchableSetting } from "./settingsSearch";

const MCP_APP_PRESENTATION_LABELS: Record<McpAppPresentation, string> = {
  inline: msg("Inline"),
  collapsed: msg("Collapsed"),
};

const isMcpAppPresentation = Schema.is(McpAppPresentation);

export function McpAppPresentationRow() {
  const gt = useGT();
  const messages = useMessages();
  const searchableSetting = useSearchableSetting();
  const presentation = useClientSettings((settings) => settings.mcpAppPresentation);
  const servers = useClientSettings((settings) => settings.mcpAppServerPresentation);
  const exceptions = Object.entries(servers);
  return (
    <SettingsRow
      {...searchableSetting("mcp-app-presentation")}
      description={gt(
        "Show the apps that MCP servers attach to tool calls, or collapse them to a line. To treat one server differently, use the menu on one of its collapsed apps.",
      )}
      resetAction={
        presentation !== "inline" || exceptions.length > 0 ? (
          <SettingResetButton
            ariaLabel={gt("Reset MCP apps to default")}
            onClick={() =>
              updateClientSettings({ mcpAppPresentation: "inline", mcpAppServerPresentation: {} })
            }
          />
        ) : null
      }
      control={
        <Select
          value={presentation}
          onValueChange={(value) => {
            if (!isMcpAppPresentation(value)) return;
            void updateClientSettings({
              mcpAppPresentation: value,
              mcpAppServerPresentation: withoutMcpAppServerPresentation(servers, value),
            });
          }}
        >
          <SelectTrigger size="sm" className="w-full sm:w-40" aria-label={gt("MCP apps")}>
            <SelectValue>{messages(MCP_APP_PRESENTATION_LABELS[presentation])}</SelectValue>
          </SelectTrigger>
          <SelectPopup align="end" alignItemWithTrigger={false}>
            {McpAppPresentation.literals.map((value) => (
              <SelectItem key={value} value={value}>
                {messages(MCP_APP_PRESENTATION_LABELS[value])}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      }
    >
      {exceptions.length > 0 ? (
        <ul aria-label={gt("MCP server exceptions")} className="mt-3 flex flex-col gap-1.5 pb-2">
          {exceptions.map(([server, mode]) => (
            <li
              key={server}
              className="flex items-center gap-2 rounded-md border border-border/60 py-0.5 ps-2 pe-0.5 text-xs"
            >
              <span className="min-w-0 flex-1 truncate font-medium">{server}</span>
              <span className="text-muted-foreground">
                {messages(MCP_APP_PRESENTATION_LABELS[mode])}
              </span>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={gt("Remove the exception for {server}", { server })}
                onClick={() =>
                  updateClientSettings({
                    mcpAppServerPresentation: setMcpAppServerPresentation(
                      presentation,
                      servers,
                      server,
                      presentation,
                    ),
                  })
                }
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </SettingsRow>
  );
}
