import os from 'os';
import { execSync } from 'child_process';

export class EnvironmentUtil {
  private getMacOSVersion(): string {
    const version = execSync('sw_vers -productVersion').toString().trim();
    return `macOS ${version}`;
  }

  private getNodeVersion(): string {
    const version = process.version;
    return `Node.js ${version}`;
  }

  getEnvironmentInfo(): string {
    const platform = os.platform();
    const release = os.release();
    const arch = os.arch();

    let osInfo = '';

    if (platform === 'darwin') {
      osInfo = this.getMacOSVersion();
    } else {
      osInfo = `${platform} ${release} (${arch})`;
    }

    const nodeInfo = this.getNodeVersion();

    return `${osInfo}, ${nodeInfo}`;
  }
}
