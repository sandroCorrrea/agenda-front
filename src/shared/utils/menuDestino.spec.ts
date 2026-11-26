import { describe, expect, it } from "vitest";
import { opcaoForaDoMenu, opcaoMenuAtiva, rotaMenuDaTela, rotuloOpcaoMenu } from "@/shared/utils/menuDestino";

describe("rotas do menu CASP", () => {
    it("usa o próprio rota_nome, sem apelido de SICOM", () => {
        expect(rotaMenuDaTela("AdministradorCaspRemessa")).toBe("AdministradorCaspRemessa");
        expect(rotaMenuDaTela("AdministradorCaspReceitaOrcamentaria")).toBe("AdministradorCaspReceitaOrcamentaria");
        expect(rotaMenuDaTela("AdministradorCaspHistorico")).toBe("AdministradorCaspRemessa");
        expect(rotaMenuDaTela("AdministradorSicomRemessas")).toBe("AdministradorSicomRemessas");
    });

    it("acende só a opção cujo rota_nome é a tela atual", () => {
        expect(opcaoMenuAtiva({ rota_nome: "AdministradorCaspRemessa" }, "AdministradorCaspRemessa")).toBe(true);
        expect(opcaoMenuAtiva({ rota_nome: "AdministradorCaspReceitaOrcamentaria" }, "AdministradorCaspReceitaOrcamentaria")).toBe(true);
        expect(opcaoMenuAtiva({ rota_nome: "AdministradorCaspRemessa" }, "AdministradorSicomRemessas")).toBe(false);
    });

    it("tira Relatórios do menu enquanto a API ainda devolver a rota", () => {
        expect(opcaoForaDoMenu("AdministradorCaspRelatorios")).toBe(true);
        expect(opcaoForaDoMenu("AdministradorCaspRemessa")).toBe(false);
    });

    it("mostra Enviar Remessa no lugar de Histórico", () => {
        expect(rotuloOpcaoMenu({ rota_nome: "AdministradorCaspHistorico", label: "Histórico" })).toBe("Enviar Remessa");
        expect(rotuloOpcaoMenu({ rota_nome: "AdministradorCaspRemessa", label: "Remessa" })).toBe("Remessa");
    });
});
