import type { McpAppPresentation } from "@t3tools/contracts";
import { setMcpAppServerPresentation } from "@t3tools/shared/mcpApp";
import { T, useGT, Var } from "gt-react";
import { EllipsisIcon } from "lucide-react";

import { getClientSettings, updateClientSettings } from "~/hooks/useSettings";
import { Button } from "../ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "../ui/menu";

function saveServerPresentation(server: string, mode: McpAppPresentation) {
  const settings = getClientSettings();
  void updateClientSettings({
    mcpAppServerPresentation: setMcpAppServerPresentation(
      settings.mcpAppPresentation,
      settings.mcpAppServerPresentation,
      server,
      mode,
    ),
  });
}

export function McpAppCollapsedRow(props: {
  readonly server: string;
  readonly configured: McpAppPresentation;
  readonly onShow: () => void;
}) {
  const gt = useGT();
  const { server } = props;
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border py-1 ps-3 pe-1 text-muted-foreground text-xs">
      <span className="min-w-0 flex-1 truncate">{gt("{server} app", { server })}</span>
      <Button size="xs" variant="ghost" onClick={props.onShow}>
        <T>Show app</T>
      </Button>
      <Menu>
        <MenuTrigger
          render={
            <Button
              aria-label={gt("{server} app options", { server })}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          <EllipsisIcon />
        </MenuTrigger>
        <MenuPopup align="end">
          {props.configured === "collapsed" ? (
            <MenuItem onClick={() => saveServerPresentation(server, "inline")}>
              <T>
                Always show <Var>{server}</Var> apps
              </T>
            </MenuItem>
          ) : (
            <MenuItem onClick={() => saveServerPresentation(server, "collapsed")}>
              <T>
                Always collapse <Var>{server}</Var> apps
              </T>
            </MenuItem>
          )}
        </MenuPopup>
      </Menu>
    </div>
  );
}
