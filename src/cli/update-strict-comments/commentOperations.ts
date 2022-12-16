import { readFileSync, writeFileSync } from 'fs';
import { TS_STRICT_COMMENT, TS_STRICT_IGNORE_COMMENT } from '../../common/constants';

export function insertIgnoreComment(filePath: string, todoCount?: number) {
  const fileContent = readFileSync(filePath, 'utf-8');
  const ignoreString = `// ${TS_STRICT_IGNORE_COMMENT}`;

  if (todoCount) {
    const now = new Date(Date.now()).toISOString();
    ignoreString += ` (issues: ${todoCount}; last checked: ${now})`
  }

  const data = ignoreString + '\n' + fileContent;

  writeFileSync(filePath, data);
}

export function removeStrictComment(filePath: string) {
  const fileContent = readFileSync(filePath, 'utf-8');

  const data = fileContent
    .split('\n')
    .filter((line) => !line.includes(TS_STRICT_COMMENT))
    .join('\n');

  if (data !== fileContent) {
    writeFileSync(filePath, data);
  }
}
