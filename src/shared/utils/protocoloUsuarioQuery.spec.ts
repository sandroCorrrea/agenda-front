import { describe, expect, it } from "vitest";
import { sanitizeProtocoloUsuarioQuery } from "./protocoloUsuarioQuery";

describe("sanitizeProtocoloUsuarioQuery", () => {
    it("omite campos vazios e invalidos", () => {
        expect(sanitizeProtocoloUsuarioQuery({})).toEqual({});
        expect(sanitizeProtocoloUsuarioQuery({ titulo: "   " })).toEqual({});
        expect(sanitizeProtocoloUsuarioQuery({ page: 0 })).toEqual({});
        expect(sanitizeProtocoloUsuarioQuery({ per_page: 101 })).toEqual({});
        expect(sanitizeProtocoloUsuarioQuery({ ano: 1999 })).toEqual({});
        expect(sanitizeProtocoloUsuarioQuery({ ano: 10000 })).toEqual({});
    });

    it("preserva valores validos", () => {
        expect(
            sanitizeProtocoloUsuarioQuery({
                page: 2,
                per_page: 25,
                titulo: "  contrato  ",
                ano: 2026,
                destinatario_tipo: "fisica"
            })
        ).toEqual({
            page: 2,
            per_page: 25,
            titulo: "contrato",
            ano: 2026,
            destinatario_tipo: "fisica"
        });
    });

    it("trunca titulo acima de 100 caracteres", () => {
        const long = "a".repeat(120);
        const r = sanitizeProtocoloUsuarioQuery({ titulo: long });
        expect(r.titulo?.length).toBe(100);
    });

    it("inclui cnpj, cpf e descricao quando preenchidos", () => {
        expect(
            sanitizeProtocoloUsuarioQuery({
                cnpj: " 61.274.240/0001-06 ",
                cpf: " 123.456.789-01 ",
                descricao: "  contrato anual  "
            })
        ).toEqual({
            cnpj: "61.274.240/0001-06",
            cpf: "123.456.789-01",
            descricao: "contrato anual"
        });
    });

    it("omite cnpj, cpf e descricao vazios", () => {
        expect(
            sanitizeProtocoloUsuarioQuery({
                cnpj: "   ",
                cpf: "",
                descricao: ""
            })
        ).toEqual({});
    });

    it("trunca descricao acima de 500 caracteres", () => {
        const long = "x".repeat(520);
        const r = sanitizeProtocoloUsuarioQuery({ descricao: long });
        expect(r.descricao?.length).toBe(500);
    });
});
