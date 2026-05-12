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
});
