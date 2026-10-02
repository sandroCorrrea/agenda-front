import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { lerConsultaCandTexto } from "@/shared/utils/consultaCand";

describe("consulta_cand do TSE", () => {
    it("lê o arquivo de Minas Gerais sem trazer dado sigiloso para a prévia", () => {
        const texto = readFileSync(new URL("../../../consulta_cand_2026_MG.csv", import.meta.url), "latin1");
        const leitura = lerConsultaCandTexto(texto);

        expect(leitura.erro).toBeNull();
        expect(leitura.total).toBe(1832);
        expect(leitura.ano).toBe("2026");
        expect(leitura.ufArquivo).toBe("MG");
        expect(leitura.colunasSensiveis).toEqual(
            expect.arrayContaining(["nr_cpf_candidato", "ds_email", "nr_titulo_eleitoral_candidato", "dt_nascimento"])
        );
        expect(leitura.previa[0]).toMatchObject({
            numero: "33773",
            nomeUrna: "STEPHANIE SOUZA",
            cargo: "Deputado estadual",
            partido: "MOBILIZA",
            uf: "MG",
            detalhe: "FEMININO · ENSINO MÉDIO COMPLETO · OUTROS · PRETA"
        });
        expect(leitura.previa[4]?.nome.startsWith("JOSÉ")).toBe(true);
        expect(JSON.stringify(leitura.previa)).not.toContain("07426478629");
    });
});
