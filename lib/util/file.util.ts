import * as fs from 'fs';
import * as path from 'path';

/**
 * FileUtil is a class responsible for handling file and folder operations.
 * It provides methods to read and write files, append content to existing files,
 * clear folder contents, and create folders.
 */
export class FileUtil {
  /**
   * Reads the content of a file.
   *
   * @param filePath - The path to the file.
   * @returns The file content as a string.
   */
  readFileContent = async (filePath: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  /**
   * Writes content to a file.
   *
   * @param filePath - The path to the file.
   * @param content - The content to be written.
   * @returns A promise that resolves when the file is written.
   */
  writeFile = async (filePath: string, content: string): Promise<void> => {
    await this.createFolder(path.dirname(filePath));
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  /**
   * Writes buffer to a file.
   *
   * @param filePath - The path to the file.
   * @param buffer - The buffer content to be written.
   * @returns A promise that resolves when the file is written.
   */
  writeFileWithBuffer = async (
    filePath: string,
    buffer: Buffer
  ): Promise<void> => {
    await this.createFolder(path.dirname(filePath));
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  /**
   * Appends content to a file. If the file does not exist, it will be created.
   *
   * @param filePath - The path to the file.
   * @param content - The content to be appended.
   * @returns A promise that resolves when the content is appended.
   */
  appendFile = async (filePath: string, content: string): Promise<void> => {
    await this.createFolder(path.dirname(filePath));
    return new Promise<void>((resolve, reject) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          // File doesn't exist, create it and append to it
          fs.writeFile(filePath, content, 'utf8', (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          // File exists, append to it
          fs.appendFile(filePath, content, 'utf8', (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  };

  /**
   * Clears the content of a folder.
   *
   * @param folderPath - The path to the folder.
   * @returns A promise that resolves when the folder content is cleared.
   */
  clearFolder = async (folderPath: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      fs.access(folderPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        fs.readdir(folderPath, (err, files) => {
          if (err) {
            reject(err);
            return;
          }

          for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
              this.clearFolder(filePath);
            } else {
              fs.unlinkSync(filePath);
            }
          }

          resolve();
        });
      });
    });
  };

  /**
   * Creates a folder.
   *
   * @param filePath - The path to the folder.
   * @returns A promise that resolves when the folder is created.
   */
  createFolder = async (filePath: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // Check if the directory already exists
      fs.access(filePath, (err) => {
        if (!err) {
          // Directory already exists, resolve immediately
          resolve();
          return;
        }

        // Directory does not exist, create it recursively
        let currentPath = '';
        const pathParts = filePath.split(path.sep);
        for (const part of pathParts) {
          currentPath += part + path.sep;
          if (!fs.existsSync(currentPath)) {
            try {
              fs.mkdirSync(currentPath);
            } catch (err) {
              console.log(`Error creating folder at path: ${currentPath}`);
              reject(err);
              return;
            }
          }
        }
        resolve();
      });
    });
  };
}
