import * as yaml from 'js-yaml';

export function parseInputToSchema(input: string): any {
  try {
    return JSON.parse(input);
  } catch {
    return yaml.load(input);
  }
}

function getMethodBadge(method: string): string {
  const upper = method.toUpperCase();
  switch (upper) {
    case 'GET':
      return '<span style="background-color: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid rgba(52, 211, 153, 0.3);">GET</span>';
    case 'POST':
      return '<span style="background-color: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid rgba(96, 165, 250, 0.3);">POST</span>';
    case 'PUT':
      return '<span style="background-color: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid rgba(251, 191, 36, 0.3);">PUT</span>';
    case 'DELETE':
      return '<span style="background-color: rgba(239, 68, 68, 0.2); color: #f87171; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid rgba(248, 113, 113, 0.3);">DELETE</span>';
    default:
      return `<span style="background-color: rgba(100, 116, 139, 0.2); color: #94a3b8; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;">${upper}</span>`;
  }
}

export function openApiToMarkdown(schema: any): string {
  if (!schema || typeof schema !== 'object') return '';

  let markdown = `# ${schema.info?.title || 'API Documentation'}\n\n`;
  if (schema.info?.description) {
    markdown += `${schema.info.description}\n\n`;
  }

  for (const [path, methods] of Object.entries(schema.paths || {})) {
    for (const [method, details] of Object.entries(methods as any)) {
      const badge = getMethodBadge(method);
      
      // Title with Badge
      markdown += `### ${badge} \`${path}\`\n\n`;
      if ((details as any).summary) markdown += `**Summary:** ${(details as any).summary}\n\n`;

      // Parameters Table
      if ((details as any).parameters && (details as any).parameters.length > 0) {
        markdown += `#### Parameters\n\n`;
        markdown += `| Name | In | Type | Required | Description |\n`;
        markdown += `| :--- | :--- | :--- | :--- | :--- |\n`;

        (details as any).parameters.forEach((param: any) => {
          const name = param.name || '-';
          const paramIn = param.in || '-';
          const type = param.schema ? param.schema.type : '-';
          const required = param.required ? 'Yes' : 'No';
          const desc = param.description || '-';

          markdown += `| \`${name}\` | ${paramIn} | \`${type}\` | ${required} | ${desc} |\n`;
        });
        markdown += `\n`;
      }

      // Responses Section
      if ((details as any).responses) {
        markdown += `#### Responses\n\n`;
        markdown += `| Status | Description |\n`;
        markdown += `| :--- | :--- |\n`;

        for (const [status, resp] of Object.entries((details as any).responses as any)) {
          const desc = (resp as any).description || 'No description';
          markdown += `| \`${status}\` | ${desc} |\n`;
        }
        markdown += `\n---\n\n`;
      }
    }
  }

  return markdown;
}