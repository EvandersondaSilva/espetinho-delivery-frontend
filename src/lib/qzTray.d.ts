// qz-tray não publica @types oficiais. Declaração parcial, cobrindo só o que
// src/services/qzPrint.ts usa (conexão, criação de config e impressão).
declare module "qz-tray" {
    interface QzPrintConfig {
        // objeto opaco retornado por qz.configs.create — não precisamos inspecionar o formato.
        [key: string]: unknown;
    }

    interface QzRawData {
        type: "raw";
        format: "command";
        flavor: "hex" | "plain" | "base64" | "file";
        data: string;
    }

    const qz: {
        websocket: {
            connect(options?: { retries?: number; delay?: number }): Promise<void>;
            isActive(): boolean;
        };
        configs: {
            create(printer: string): QzPrintConfig;
        };
        print(config: QzPrintConfig, data: Array<string | QzRawData>): Promise<void>;
    };

    export default qz;
}
