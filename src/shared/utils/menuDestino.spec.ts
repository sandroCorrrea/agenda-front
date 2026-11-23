import { describe, expect, it } from "vitest";
import { opcaoMenuAtiva, rotaMenuDaTela } from "@/shared/utils/menuDestino";

describe("rotas do menu CASP", () => {
    it("usa o próprio rota_nome, sem apelido de SICOM", () => {
        expect(rotaMenuDaTela("AdministradorCaspRemessa")).toBe("AdministradorCaspRemessa");
        expect(rotaMenuDaTela("AdministradorCaspRelatorios")).toBe("AdministradorCaspRelatorios");
        expect(rotaMenuDaTela("AdministradorCaspReceitaOrcamentaria")).toBe("AdministradorCaspReceitaOrcamentaria");
        expect(rotaMenuDaTela("AdministradorCaspHistorico")).toBe("AdministradorCaspRemessa");
        expect(rotaMenuDaTela("AdministradorSicomRemessas")).toBe("AdministradorSicomRemessas");
    });

    it("acende só a opção cujo rota_nome é a tela atual", () => {
        expect(opcaoMenuAtiva({ rota_nome: "AdministradorCaspRemessa" }, "AdministradorCaspRemessa")).toBe(true);
        expect(opcaoMenuAtiva({ rota_nome: "AdministradorCaspRelatorios" }, "AdministradorCaspRemessa")).toBe(false);
        expect(opcaoMenuAtiva({ rota_nome: "AdministradorCaspReceitaOrcamentaria" }, "AdministradorCaspReceitaOrcamentaria")).toBe(true);
        expect(opcaoMenuAtiva({ rota_nome: "AdministradorCaspRemessa" }, "AdministradorSicomRemessas")).toBe(false);
    });
});
