import { useAtomSet, useAtomValue } from "@effect/atom-react";
import type { EnvironmentId, McpAppPresentation, ThreadId, TurnItemId } from "@t3tools/contracts";
import { scopeThreadRef } from "@t3tools/client-runtime/environment";
import {
  resolveMcpAppPresentation,
  setMcpAppServerPresentation,
  type McpAppReference,
} from "@t3tools/shared/mcpApp";
import { AsyncResult } from "effect/reactivity";
import { useGT } from "gt-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { SymbolView } from "../../components/ui/AppSymbol";
import { AppText as Text } from "../../components/ui/AppText";
import { Button } from "../../components/ui/Button";
import { Menu } from "../../components/ui/Menu";
import { useThreadShell } from "../../state/entities";
import { mobilePreferencesAtom, updateMobilePreferencesAtom } from "../../state/preferences";
import { ThreadMcpApp } from "./McpAppWebView";

function McpAppCollapsedRow(props: {
  readonly server: string;
  readonly presentation: McpAppPresentation;
  readonly servers: Readonly<Record<string, McpAppPresentation>>;
  readonly configured: McpAppPresentation;
  readonly onShow: () => void;
}) {
  const gt = useGT();
  const savePreferences = useAtomSet(updateMobilePreferencesAtom);
  const { server } = props;
  const next = props.configured === "collapsed" ? "inline" : "collapsed";
  return (
    <View className="mb-2 flex-row items-center gap-2 rounded-lg border border-border py-1 pl-3 pr-1">
      <Text className="flex-1 text-sm text-foreground-muted" numberOfLines={1}>
        {gt("{server} app", { server })}
      </Text>
      <Button label={gt("Show app")} tone="text" size="compact" onPress={props.onShow} />
      <Menu
        isAnchoredToRight
        actions={[
          {
            id: next,
            title:
              next === "collapsed"
                ? gt("Always collapse {server} apps", { server })
                : gt("Always show {server} apps", { server }),
          },
        ]}
        onPressAction={() =>
          savePreferences({
            mcpAppServerPresentation: setMcpAppServerPresentation(
              props.presentation,
              props.servers,
              server,
              next,
            ),
          })
        }
      >
        <Pressable
          accessibilityLabel={gt("{server} app options", { server })}
          accessibilityRole="button"
          className="size-[30px] items-center justify-center active:opacity-60"
        >
          <SymbolView
            name="ellipsis.circle"
            size={18}
            tintColorClassName="accent-foreground-muted"
            type="monochrome"
          />
        </Pressable>
      </Menu>
    </View>
  );
}

export function ThreadMcpAppRow(props: {
  readonly environmentId: EnvironmentId;
  readonly threadId: ThreadId;
  readonly conversationThreadId: ThreadId;
  readonly itemId: TurnItemId;
  readonly revision: string;
  readonly app: McpAppReference;
  readonly width: number;
}) {
  const preferences = useAtomValue(mobilePreferencesAtom);
  const presentation = AsyncResult.isSuccess(preferences)
    ? (preferences.value.mcpAppPresentation ?? "inline")
    : "inline";
  const servers = AsyncResult.isSuccess(preferences)
    ? (preferences.value.mcpAppServerPresentation ?? {})
    : {};
  const configured = resolveMcpAppPresentation(presentation, servers, props.app.server);
  // A choice on this card lasts until the configured presentation changes.
  const [chosen, setChosen] = useState<{
    readonly configured: McpAppPresentation;
    readonly mode: McpAppPresentation;
  } | null>(null);
  const mode = chosen?.configured === configured ? chosen.mode : configured;
  const conversation = useThreadShell(
    scopeThreadRef(props.environmentId, props.conversationThreadId),
  );
  // An app waiting for the user stays open so its request is not missed.
  const awaitingUser =
    conversation?.hasPendingApprovals === true || conversation?.hasPendingUserInput === true;

  if (mode === "collapsed" && !awaitingUser) {
    return (
      <McpAppCollapsedRow
        server={props.app.server}
        presentation={presentation}
        servers={servers}
        configured={configured}
        onShow={() => setChosen({ configured, mode: "inline" })}
      />
    );
  }
  return (
    <ThreadMcpApp {...props} onCollapse={() => setChosen({ configured, mode: "collapsed" })} />
  );
}
