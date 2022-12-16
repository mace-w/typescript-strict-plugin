import { getFilePathsWithErrors, getFilePathsOnPathWithoutErrors } from './getFilePaths';
import { isIgnoreCommentPresent, isStrictCommentPresent } from '../isCommentPresent';
import { isFileStrictByPath } from '../../common/isFileStrictByPath';
import { insertIgnoreComment, removeStrictComment } from './commentOperations';
import { PluginInfo } from '../../plugin/utils';

interface UpdateStrictCommentsResult {
  updatedFileCount: number;
}

export async function updateStrictComments(
  filePaths: string[],
  configPaths?: string[],
): Promise<UpdateStrictCommentsResult> {
  const filesWithErrors = await getFilePathsWithErrors(filePaths);
  const filesOnPathWithoutErrors = getFilePathsOnPathWithoutErrors(
    filePaths,
    filesWithErrors,
    configPaths,
  );

  let updatedFileCount = 0;

  filesOnPathWithoutErrors.forEach((filePath) => {
    if (shouldRemoveStrictComment(filePath, configPaths)) {
      removeStrictComment(filePath);
      updatedFileCount++;
    }
  });

  filesWithErrors.forEach((filePath) => {
    const insertIgnore = shouldInsertIgnoreComment(filePath, configPaths);
    const removeStrict = shouldRemoveStrictComment(filePath, configPaths);
    const strictTodos = getStrictTodosCount(filePath, configPaths);

    if (insertIgnore) {
      insertIgnoreComment(filePath);
    }

    if (removeStrict) {
      removeStrictComment(filePath);
    }

    if (strictTodos) {
      removeStrict(filePath);
      insertIgnoreComment(filePath, strictTodos)
    }

    if (removeStrict || insertIgnore || strictTodos) {
      updatedFileCount++;
    }
  });

  return { updatedFileCount };
}

function shouldInsertIgnoreComment(filePath: string, configPaths?: string[]): boolean {
  return isFileStrictByPath({ filePath, configPaths }) && !isIgnoreCommentPresent(filePath);
}

function shouldRemoveStrictComment(filePath: string, configPaths?: string[]): boolean {
  return isFileStrictByPath({ filePath, configPaths }) && isStrictCommentPresent(filePath);
}

function getStrictTodosCount(filePath: string): number|null {
  return PluginInfo?.info?.languageService?.getTodoComments(filePath) ?? null;
}