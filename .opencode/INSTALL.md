# Installing tw-ecommerce-majordomo for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed
- [`uv`](https://docs.astral.sh/uv/) installed (the MCP servers run via `uvx`)

## Install

Add the plugin to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["tw-ecommerce-majordomo@git+https://github.com/asgard-ai-platform/tw-ecommerce-majordomo.git"]
}
```

Restart OpenCode. The plugin will:

- Register the 29 `tw-ecom-*` skills under OpenCode's skill discovery
- Merge the 12 Taiwan e-commerce MCP servers into your live config (user-defined entries with the same name win)

## Environment variables

The MCP servers expect API credentials in the environment. Copy `.env.example`
from the plugin repo and set the values you need:

```bash
export ECPAY_MERCHANT_ID=...
export ECPAY_HASH_KEY=...
# ... etc
```

Or use a tool like `direnv` to load `.env` per-project.

See `docs/MCP-SETUP.md` in the plugin repo for the full env var reference.

## Verify

In OpenCode, ask: "Tell me about your tw-ecom skills" — it should list the 29
skills bundled by this plugin.
