import { describe, expect, it } from "vitest";
import { exigirProducao, resolverBaseManual } from "@/infrastructure/http/manualApiBase";

describe("resolverBaseManual", () => {
    it("exige a variável e cita o modo", () => {
        expect(() => resolverBaseManual("  ", "development")).toThrow(
            "Defina VITE_MANUAL_API_URL. Modo do Vite: development."
        );
    });

    it("no desenvolvimento aceita só o serviço local, sem barra final", () => {
        expect(resolverBaseManual("http://127.0.0.1:8765/", "development")).toBe("http://127.0.0.1:8765");
        expect(resolverBaseManual("http://localhost:8765", "development")).toBe("http://localhost:8765");
        expect(() => resolverBaseManual("https://manual-service.onrender.com", "development")).toThrow(
            "VITE_MANUAL_API_URL inválida para o modo development."
        );
        expect(() => resolverBaseManual("http://127.0.0.1:8765/api", "development")).toThrow(
            "VITE_MANUAL_API_URL inválida para o modo development."
        );
    });

    it("em produção aceita só o Render", () => {
        expect(exigirProducao("https://manual-service.onrender.com", "production")).toBe(
            "https://manual-service.onrender.com"
        );
        expect(() => exigirProducao("http://127.0.0.1:8765", "production")).toThrow(
            "VITE_MANUAL_API_URL inválida para o modo production."
        );
        expect(() => exigirProducao("http://localhost:8765", "production")).toThrow(
            "VITE_MANUAL_API_URL inválida para o modo production."
        );
    });
});
