/**
 * tw-ecommerce-majordomo plugin for OpenCode.ai
 *
 * Registers the bundled tw-ecom-* skills path and merges the 12 Taiwan
 * e-commerce MCP servers into the live OpenCode config so users get both
 * sets of capabilities by adding a single plugin entry to opencode.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const skillsDir = path.join(repoRoot, 'skills');
const mcpJsonPath = path.join(repoRoot, 'mcp.json');

let _mcpServers = undefined;

const loadMcpServers = () => {
  if (_mcpServers !== undefined) return _mcpServers;
  if (!fs.existsSync(mcpJsonPath)) {
    _mcpServers = null;
    return null;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'));
    _mcpServers = raw.mcpServers || {};
  } catch {
    _mcpServers = null;
  }
  return _mcpServers;
};

// Expand shell-style ${VAR} and ${VAR:-default} against process.env.
const expandEnv = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}/g, (_, name, dflt) => {
    const v = process.env[name];
    return v !== undefined && v !== '' ? v : (dflt ?? '');
  });
};

// Translate the Claude Code / Cursor MCP spec shape (mcp.json's
// `{ command, args, env }`) into OpenCode's `McpLocalConfig` shape:
// `{ type: "local", command: string[], environment, enabled }`.
const toOpencodeMcp = (spec) => {
  const cmd = [spec.command, ...(Array.isArray(spec.args) ? spec.args : [])];
  const environment = {};
  for (const [k, v] of Object.entries(spec.env || {})) {
    environment[k] = expandEnv(v);
  }
  return {
    type: 'local',
    enabled: true,
    command: cmd,
    environment,
  };
};

export const TwEcommerceMajordomoPlugin = async ({ client, directory }) => {
  return {
    config: async (config) => {
      // Register skills directory (matches the superpowers pattern)
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }

      // Merge MCP servers. Existing user-defined servers win on name conflict.
      const servers = loadMcpServers();
      if (servers) {
        config.mcp = config.mcp || {};
        for (const [name, spec] of Object.entries(servers)) {
          if (!config.mcp[name]) {
            config.mcp[name] = toOpencodeMcp(spec);
          }
        }
      }
    }
  };
};
