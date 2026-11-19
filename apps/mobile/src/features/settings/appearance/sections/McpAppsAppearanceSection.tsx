import { msg, T, useGT, useMessages } from "gt-react-native";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import type { McpAppPresentation } from "@t3tools/contracts/settings";
import {
  setMcpAppServerPresentation,
  withoutMcpAppServerPresentation,
} from "@t3tools/shared/mcpApp";
import { AsyncResult } from "effect/reactivity";
import { View } from "react-native";

import { AppText as Text } from "../../../../components/ui/AppText";
import { ListChoiceRow } from "../../../../components/ui/ListChoiceRow";
import { mobilePreferencesAtom, updateMobilePreferencesAtom } from "../../../../state/preferences";
import { SettingsSection } from "../../components/SettingsSection";

const MCP_APP_PRESENTATION_OPTIONS: ReadonlyArray<{
  readonly value: McpAppPresentation;
  readonly label: string;
}> = [
  { value: "inline", label: msg("Inline") },
  { value: "collapsed", label: msg("Collapsed") },
];

export function McpAppsAppearanceSection() {
  const gt = useGT();
  const m = useMessages();
  const savePreferences = useAtomSet(updateMobilePreferencesAtom);
  const preferences = useAtomValue(mobilePreferencesAtom);
  const loaded = AsyncResult.isSuccess(preferences);
  const selected = loaded ? (preferences.value.mcpAppPresentation ?? "inline") : null;
  const servers = loaded ? (preferences.value.mcpAppServerPresentation ?? {}) : {};
  const labels = Object.fromEntries(
    MCP_APP_PRESENTATION_OPTIONS.map((option) => [option.value, m(option.label)]),
  );

  return (
    <View className="gap-3">
      <SettingsSection title={gt("MCP apps")}>
        {MCP_APP_PRESENTATION_OPTIONS.map((option, index) => (
          <ListChoiceRow
            key={option.value}
            label={m(option.label)}
            selected={selected === option.value}
            separated={index > 0}
            disabled={selected === null}
            onPress={() =>
              savePreferences({
                mcpAppPresentation: option.value,
                mcpAppServerPresentation: withoutMcpAppServerPresentation(servers, option.value),
              })
            }
          />
        ))}
      </SettingsSection>
      {selected !== null && Object.keys(servers).length > 0 ? (
        <SettingsSection title={gt("Exceptions")}>
          {Object.entries(servers).map(([server, mode], index) => (
            <ListChoiceRow
              key={server}
              label={gt("{server}: {mode}", { server, mode: labels[mode] ?? mode })}
              description={gt("Tap to remove")}
              selected={false}
              separated={index > 0}
              onPress={() =>
                savePreferences({
                  mcpAppServerPresentation: setMcpAppServerPresentation(
                    selected,
                    servers,
                    server,
                    selected,
                  ),
                })
              }
            />
          ))}
        </SettingsSection>
      ) : null}
      <Text className="px-2 text-sm text-foreground-muted">
        <T>
          Show the apps that MCP servers attach to tool calls, or collapse them to a line. To treat
          one server differently, use the menu on one of its collapsed apps.
        </T>
      </Text>
    </View>
  );
}
