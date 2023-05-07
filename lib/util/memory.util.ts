import { FileUtil } from './file.util';

/**
 * A utility class for reading and writing to a memory file.
 */
export class MemoryUtil {
  /**
   * Constructs a new MemoryUtil object with a given FileUtil and memory file path.
   *
   * @param fileUtil - The FileUtil object used to read and write to the memory file.
   * @param memoryFilePath - The path to the memory file.
   */
  constructor(private fileUtil: FileUtil, private memoryFilePath: string) {}

  /**
   * Reads the entire memory file and returns it as a JSON object.
   *
   * @returns A Promise that resolves to the parsed memory object.
   */
  private readLTM = async () => {
    const agiMemoryContent = await this.fileUtil.readFileContent(
      this.memoryFilePath
    );

    return JSON.parse(agiMemoryContent);
  };

  /**
   * Reads the memory file and returns all entries that match a given step.
   *
   * @param step - The step to filter the memory entries by.
   * @returns A Promise that resolves to an array of memory objects matching the given step.
   */
  readLTMByContext = async (step: string) => {
    const agiMemoryContent = await this.fileUtil.readFileContent(
      this.memoryFilePath
    );

    const memory = JSON.parse(agiMemoryContent) as [];

    let ltmByContext: any[] = [];

    memory.forEach((m: any) => {
      if (m.step.includes(step)) {
        ltmByContext.push(m);
      }
    });

    return ltmByContext;
  };

  /**
   * Appends a parsed object to the memory file.
   *
   * @param parsed - The object to be appended to the memory file.
   * @returns A Promise that resolves once the object has been appended to the memory file.
   */
  writeLTM = async (parsed: any) => {
    const agiMemory = await this.readLTM();

    // Append the new parsed object to the existing memory array
    const updatedMemory = Array.isArray(agiMemory)
      ? [...agiMemory, parsed]
      : [parsed];

    await this.fileUtil.writeFile(
      this.memoryFilePath,
      JSON.stringify(updatedMemory, null, 2)
    );
  };

  /**
   * Clears the memory file by overwriting it with an empty array.
   *
   * @returns A Promise that resolves once the memory file has been cleared.
   */
  resetLTM = async () => {
    await this.fileUtil.writeFile(this.memoryFilePath, '[]');
  };
}
